# Copyright 2026 Polymerix
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""In-process cache of protected paths, keyed by tenant.

Freshness is the `rules_version` token from J1.4, not a TTL on the payload.
A local rule write invalidates immediately. A teammate's write is seen on the
next poll, or on a tight synchronous refresh if the entry is older than the
poll interval at decision time. Missing cache, missing credentials, or a
backend that does not answer: fail-open (caller allows the write).
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass
from typing import Any, Callable, Mapping, Optional, Protocol, Sequence

from dont_break.hooks.glob_match import glob_match
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.infrastructure.gateway_routes import GatewayRoutes

logger = logging.getLogger(__name__)

POLL_INTERVAL_SEC = 5.0
SYNC_REFRESH_TIMEOUT_SEC = 0.4


@dataclass(frozen=True)
class ProtectedRule:
    rule_id: str
    severity: str
    globs: tuple[str, ...]
    paths: frozenset[str]


@dataclass(frozen=True)
class FreshnessTokens:
    rules_version: int
    graph_version: int
    policy_version: int


@dataclass
class CacheEntry:
    workspace_id: str
    project_slug: str
    freshness: FreshnessTokens
    rules: tuple[ProtectedRule, ...]
    path_index: dict[str, tuple[ProtectedRule, ...]]
    fetched_at: float

    def match(self, relative_path: str) -> Optional[ProtectedRule]:
        found: list[ProtectedRule] = []
        exact = self.path_index.get(relative_path)
        if exact:
            found.extend(exact)
        seen = {rule.rule_id for rule in found}
        for rule in self.rules:
            if rule.rule_id in seen:
                continue
            if any(glob_match(glob, relative_path) for glob in rule.globs):
                found.append(rule)
        return _worst(found)


def _worst(rules: Sequence[ProtectedRule]) -> Optional[ProtectedRule]:
    if not rules:
        return None
    for rule in rules:
        if rule.severity == "block":
            return rule
    return rules[0]


def _index_paths(rules: Sequence[ProtectedRule]) -> dict[str, tuple[ProtectedRule, ...]]:
    buckets: dict[str, list[ProtectedRule]] = {}
    for rule in rules:
        for path in rule.paths:
            buckets.setdefault(path, []).append(rule)
    return {path: tuple(hits) for path, hits in buckets.items()}


def parse_protected_paths(payload: Mapping[str, Any]) -> tuple[ProtectedRule, ...]:
    raw_rules = payload.get("rules")
    if not isinstance(raw_rules, list):
        return ()
    parsed: list[ProtectedRule] = []
    for item in raw_rules:
        if not isinstance(item, dict):
            continue
        rule_id = str(item.get("rule_id") or "").strip()
        severity = str(item.get("severity") or "").strip()
        if not rule_id or severity not in ("warn", "block"):
            continue
        globs = tuple(
            glob for glob in (item.get("globs") or []) if isinstance(glob, str) and glob
        )
        paths = frozenset(
            path for path in (item.get("paths") or []) if isinstance(path, str) and path
        )
        parsed.append(
            ProtectedRule(rule_id=rule_id, severity=severity, globs=globs, paths=paths)
        )
    return tuple(parsed)


def parse_freshness(payload: Mapping[str, Any]) -> Optional[FreshnessTokens]:
    try:
        return FreshnessTokens(
            rules_version=int(payload["rules_version"]),
            graph_version=int(payload.get("graph_version") or 0),
            policy_version=int(payload.get("policy_version") or 0),
        )
    except (KeyError, TypeError, ValueError):
        return None


class ProtectedPathsFetcher(Protocol):
    async def freshness(
        self, token: str, workspace_id: str, project_slug: str
    ) -> Optional[FreshnessTokens]: ...

    async def protected_paths(
        self, token: str, workspace_id: str, project_slug: str
    ) -> Optional[tuple[ProtectedRule, ...]]: ...


class GatewayProtectedPathsFetcher:
    """Reads freshness and protected-paths through the already-authenticated gateway client."""

    def __init__(self, gateway: Callable[[], GatewayClient]) -> None:
        self._gateway = gateway

    async def freshness(
        self, token: str, workspace_id: str, project_slug: str
    ) -> Optional[FreshnessTokens]:
        path = GatewayRoutes.rules(workspace_id, project_slug, "/freshness")
        res = await self._gateway().api_request(token, "GET", path)
        if res.status_code != 200:
            return None
        try:
            body = res.json()
        except ValueError:
            return None
        return parse_freshness(body) if isinstance(body, dict) else None

    async def protected_paths(
        self, token: str, workspace_id: str, project_slug: str
    ) -> Optional[tuple[ProtectedRule, ...]]:
        path = GatewayRoutes.query(workspace_id, project_slug, "/protected-paths")
        res = await self._gateway().api_request(token, "GET", path)
        if res.status_code != 200:
            return None
        try:
            body = res.json()
        except ValueError:
            return None
        if not isinstance(body, dict):
            return None
        return parse_protected_paths(body)


class ProtectedPathsCache:
    def __init__(
        self,
        fetcher: ProtectedPathsFetcher,
        token_provider: Callable[[], str],
        *,
        poll_interval: float = POLL_INTERVAL_SEC,
        sync_timeout: float = SYNC_REFRESH_TIMEOUT_SEC,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._fetcher = fetcher
        self._token_provider = token_provider
        self.poll_interval = poll_interval
        self.sync_timeout = sync_timeout
        self._clock = clock
        self._entries: dict[str, CacheEntry] = {}
        self._loads: dict[str, int] = {}
        self._lock = asyncio.Lock()

    @staticmethod
    def _key(workspace_id: str, project_slug: str) -> str:
        return f"{workspace_id}/{project_slug}"

    def invalidate(self, workspace_id: str, project_slug: str) -> None:
        self._entries.pop(self._key(workspace_id, project_slug), None)

    def seed(
        self,
        workspace_id: str,
        project_slug: str,
        rules: Sequence[ProtectedRule],
        *,
        rules_version: int = 1,
        graph_version: int = 1,
        policy_version: int = 0,
        fetched_at: Optional[float] = None,
    ) -> CacheEntry:
        packed = tuple(rules)
        entry = CacheEntry(
            workspace_id=workspace_id,
            project_slug=project_slug,
            freshness=FreshnessTokens(rules_version, graph_version, policy_version),
            rules=packed,
            path_index=_index_paths(packed),
            fetched_at=self._clock() if fetched_at is None else fetched_at,
        )
        self._entries[self._key(workspace_id, project_slug)] = entry
        return entry

    def peek(self, workspace_id: str, project_slug: str) -> Optional[CacheEntry]:
        return self._entries.get(self._key(workspace_id, project_slug))

    def load_count(self, workspace_id: str, project_slug: str) -> int:
        return self._loads.get(self._key(workspace_id, project_slug), 0)

    async def ensure(
        self, workspace_id: str, project_slug: str
    ) -> Optional[CacheEntry]:
        """Return a usable entry, refreshing if missing, stale, or version-moved.

        Fail-open: returns None when there is no token or the backend does not
        answer in time. A still-warm entry is returned even if refresh fails.
        """
        key = self._key(workspace_id, project_slug)
        entry = self._entries.get(key)
        token = self._token_provider().strip()
        if not token:
            return entry
        now = self._clock()
        needs_sync = entry is None or (now - entry.fetched_at) >= self.poll_interval
        if not needs_sync:
            return entry
        try:
            refreshed = await asyncio.wait_for(
                self._refresh(token, workspace_id, project_slug, entry),
                timeout=self.sync_timeout,
            )
        except (asyncio.TimeoutError, Exception):
            logger.debug("protected-paths refresh failed; fail-open", exc_info=True)
            return entry
        return refreshed if refreshed is not None else entry

    async def poll(self) -> None:
        """Background pass: compare version tokens, reload only when they moved."""
        token = self._token_provider().strip()
        if not token or not self._entries:
            return
        snapshot = list(self._entries.values())
        for entry in snapshot:
            try:
                await self._refresh(
                    token, entry.workspace_id, entry.project_slug, entry, poll=True
                )
            except Exception:
                logger.debug("protected-paths poll failed", exc_info=True)

    async def _refresh(
        self,
        token: str,
        workspace_id: str,
        project_slug: str,
        current: Optional[CacheEntry],
        *,
        poll: bool = False,
    ) -> Optional[CacheEntry]:
        key = self._key(workspace_id, project_slug)
        async with self._lock:

            latest = self._entries.get(key)
            if latest is not None and latest is not current and not poll:
                age = self._clock() - latest.fetched_at
                if age < self.poll_interval:
                    return latest
            tokens = await self._fetcher.freshness(token, workspace_id, project_slug)
            if tokens is None:
                return latest
            if latest is not None and tokens.rules_version == latest.freshness.rules_version:
                latest.fetched_at = self._clock()
                return latest
            rules = await self._fetcher.protected_paths(token, workspace_id, project_slug)
            if rules is None:
                return latest
            self._loads[key] = self._loads.get(key, 0) + 1
            packed = tuple(rules)
            entry = CacheEntry(
                workspace_id=workspace_id,
                project_slug=project_slug,
                freshness=tokens,
                rules=packed,
                path_index=_index_paths(packed),
                fetched_at=self._clock(),
            )
            self._entries[key] = entry
            return entry
