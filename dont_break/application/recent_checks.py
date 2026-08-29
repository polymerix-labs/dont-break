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

"""In-memory permits from recent check_change events.

Hard mode reads this store only — the hook stays fast. A permit is bound to
a conversation (and its parent subagent chain). The local MCP posts here
the moment a check returns; the activity poller is a backup and must never
overwrite a newer stamp with an older event.

``no_rules`` is not a permit. An unbound activity event is not a permit.
An unbound local MCP check is accepted briefly: the tool has no
conversation id, but it ran on this machine just now.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Iterable, Optional

DEFAULT_TTL_SEC = 15 * 60
UNBOUND_LOCAL_TTL_SEC = 2 * 60
LOCAL = "local"
ACTIVITY = "activity"
PERMIT_VERDICTS = frozenset({"ok", "warn", "block"})


@dataclass(frozen=True)
class RecentCheck:
    path: str
    verdict: str
    at: float
    conversation_id: str = ""
    source: str = ACTIVITY


def is_actionable_verdict(verdict: str, verdict_basis: str = "") -> bool:
    if verdict_basis == "no_rules":
        return False
    return verdict in PERMIT_VERDICTS


class RecentCheckStore:
    def __init__(self, *, ttl_sec: float = DEFAULT_TTL_SEC, clock=time.time) -> None:
        self._ttl = ttl_sec
        self._clock = clock
        self._by_key: dict[tuple[str, str], RecentCheck] = {}

    def remember(
        self,
        path: str,
        verdict: str,
        *,
        at: float | None = None,
        conversation_id: str = "",
        source: str = ACTIVITY,
        verdict_basis: str = "",
    ) -> bool:
        path = path.strip()
        conversation_id = conversation_id.strip()
        if not path or not is_actionable_verdict(verdict, verdict_basis):
            return False
        stamp = self._clock() if at is None else at
        key = (path, conversation_id)
        existing = self._by_key.get(key)
        if existing is not None and stamp < existing.at:
            return False
        self._by_key[key] = RecentCheck(
            path=path,
            verdict=verdict,
            at=stamp,
            conversation_id=conversation_id,
            source=source if source in {LOCAL, ACTIVITY} else ACTIVITY,
        )
        return True

    def remember_event_files(
        self,
        files: Iterable[str],
        verdict: str,
        *,
        at: float | None = None,
        conversation_id: str = "",
        source: str = ACTIVITY,
        verdict_basis: str = "",
    ) -> int:
        remembered = 0
        for path in files:
            if self.remember(
                path,
                verdict,
                at=at,
                conversation_id=conversation_id,
                source=source,
                verdict_basis=verdict_basis,
            ):
                remembered += 1
        return remembered

    def ingest_file_verdicts(
        self,
        files: Iterable[dict],
        *,
        fallback_verdict: str = "ok",
        at: float | None = None,
        conversation_id: str = "",
        source: str = LOCAL,
        verdict_basis: str = "",
    ) -> int:
        remembered = 0
        for item in files:
            if not isinstance(item, dict):
                continue
            path = str(item.get("path") or item.get("file") or "").strip()
            verdict = str(item.get("verdict") or fallback_verdict).strip()
            if self.remember(
                path,
                verdict,
                at=at,
                conversation_id=conversation_id,
                source=source,
                verdict_basis=verdict_basis,
            ):
                remembered += 1
        return remembered

    def lookup(
        self,
        path: str,
        conversation_id: str = "",
        parent_ids: Iterable[str] = (),
    ) -> Optional[RecentCheck]:
        path = path.strip()
        now = self._clock()
        seen: list[str] = []
        conversation_id = conversation_id.strip()
        if conversation_id:
            seen.append(conversation_id)
        for parent in parent_ids:
            parent = str(parent).strip()
            if parent and parent not in seen:
                seen.append(parent)
        for cid in seen:
            entry = self._fresh(path, cid, now)
            if entry is not None:
                return entry
        unbound = self._fresh(path, "", now)
        if (
            unbound is not None
            and unbound.source == LOCAL
            and now - unbound.at <= min(self._ttl, UNBOUND_LOCAL_TTL_SEC)
        ):
            return unbound
        return None

    def _fresh(self, path: str, conversation_id: str, now: float) -> Optional[RecentCheck]:
        key = (path, conversation_id)
        entry = self._by_key.get(key)
        if entry is None:
            return None
        if now - entry.at > self._ttl:
            self._by_key.pop(key, None)
            return None
        return entry
