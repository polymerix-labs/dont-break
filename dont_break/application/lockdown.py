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

"""In-process lockdown: one entry per project, expiration checked at decision.

A known lock continues to apply without the network. An expired lock is
dropped on lookup, not by a background sweeper. Conversation membership is
a dict so a session-scoped check stays O(1).
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Sequence

from dont_break.config import config_dir
from dont_break.project.mapping import ProjectMapping

DEFAULT_SCOPE = "session"
DEFAULT_TTL_SEC = 30 * 60
NEVER = float("inf")


def _project_key(workspace_id: str, project_slug: str) -> str:
    return f"{workspace_id}/{project_slug}"


@dataclass
class Lockdown:
    workspace_id: str
    project_slug: str
    scope: str
    conversations: dict[str, bool]
    opened_at: float
    expires_at: float

    @property
    def project_key(self) -> str:
        return _project_key(self.workspace_id, self.project_slug)

    def as_dict(self) -> dict[str, Any]:
        expires = self.expires_at
        return {
            "workspace_id": self.workspace_id,
            "project_slug": self.project_slug,
            "scope": self.scope,
            "conversations": list(self.conversations),
            "opened_at": self.opened_at,
            "expires_at": None if expires == NEVER else expires,
        }


class LockdownStore:
    def __init__(
        self,
        path: Path | None = None,
        *,
        clock: Callable[[], float] = time.time,
        default_scope: str = DEFAULT_SCOPE,
        default_ttl_sec: float = DEFAULT_TTL_SEC,
    ) -> None:
        self._path = path or config_dir() / "lockdowns.json"
        self._clock = clock
        self.default_scope = default_scope
        self.default_ttl_sec = default_ttl_sec
        self._by_project: dict[str, Lockdown] = {}
        self._parent: dict[str, str] = {}


        self._pending: list[str] = []
        self._load()

    def remember_subagent(self, conversation_id: str, parent_conversation_id: str) -> None:
        child = conversation_id.strip()
        parent = parent_conversation_id.strip() or child
        if not parent:
            return
        if child and child != parent:
            self._parent[child] = parent
            self._save()
            return
        self._pending.append(parent)
        self._save()

    def root_conversation(self, conversation_id: str) -> str:
        current = conversation_id.strip()
        if current and current not in self._parent and self._pending:
            parent = self._pending.pop(0)
            if parent and parent != current:
                self._parent[current] = parent
                self._save()
        seen: set[str] = set()
        while current in self._parent and current not in seen:
            seen.add(current)
            current = self._parent[current]
        return current

    def active(
        self,
        workspace_id: str,
        project_slug: str,
        conversation_id: str,
        *,
        also: Sequence[str] = (),
    ) -> Optional[Lockdown]:
        """Live lock for this conversation, accepting legacy slug aliases."""
        entry = self._find_live(workspace_id, project_slug, also, rekey_to=project_slug)
        if entry is None:
            return None
        if entry.scope == "project":
            return entry
        if not conversation_id.strip():
            return entry
        root = self.root_conversation(conversation_id)
        if root in entry.conversations:
            return entry
        return None

    def open(
        self,
        workspace_id: str,
        project_slug: str,
        conversation_id: str,
        *,
        scope: str | None = None,
        ttl_sec: float | None = None,
        also: Sequence[str] = (),
    ) -> Lockdown:
        """Create or extend a lock, rekeying a legacy slug entry onto the id."""
        now = self._clock()
        root = self.root_conversation(conversation_id) if conversation_id else ""
        existing = self._find_live(workspace_id, project_slug, also, rekey_to=project_slug)
        if existing is not None:
            if root:
                existing.conversations[root] = True
            self._save()
            return existing
        ttl = self.default_ttl_sec if ttl_sec is None else ttl_sec
        expires = NEVER if ttl < 0 else now + ttl
        entry = Lockdown(
            workspace_id=workspace_id,
            project_slug=project_slug,
            scope=scope or self.default_scope,
            conversations={root: True} if root else {},
            opened_at=now,
            expires_at=expires,
        )
        self._by_project[_project_key(workspace_id, project_slug)] = entry
        self._save()
        return entry

    def release(
        self,
        workspace_id: str,
        project_slug: str,
        *,
        also: Sequence[str] = (),
    ) -> bool:
        """Drop the primary key and any legacy alias keys for this project."""
        removed = False
        for key_part in (project_slug, *also):
            text = (key_part or "").strip()
            if not text:
                continue
            stored = _project_key(workspace_id, text)
            if stored in self._by_project:
                self._by_project.pop(stored)
                removed = True
        if removed:
            self._save()
        return removed

    def current(
        self,
        workspace_id: str,
        project_slug: str,
        *,
        also: Sequence[str] = (),
    ) -> Optional[Lockdown]:
        """Live lock for the project, ignoring conversation. For the human banner."""
        return self._find_live(workspace_id, project_slug, also, rekey_to=project_slug)

    def migrate_slug_keys(self, mappings: Iterable[ProjectMapping]) -> int:
        """Rewrite persisted slug keys to registered ids. Returns entries moved."""
        slug_to_id: dict[tuple[str, str], str] = {}
        for mapping in mappings:
            slug = (mapping.project_slug or "").strip()
            project_id = (mapping.project_id or "").strip()
            workspace = (mapping.workspace_id or "").strip()
            if not slug or not project_id or slug == project_id:
                continue
            slug_to_id[(workspace, slug)] = project_id
        moved = 0
        for entry in list(self._by_project.values()):
            new_id = slug_to_id.get((entry.workspace_id, entry.project_slug))
            if new_id is None:
                for (workspace, slug), project_id in slug_to_id.items():
                    if slug == entry.project_slug and (
                        not workspace or workspace == entry.workspace_id
                    ):
                        new_id = project_id
                        break
            if not new_id or new_id == entry.project_slug:
                continue
            self._rekey(entry, new_id)
            moved += 1
        if moved:
            self._save()
        return moved

    def _find_live(
        self,
        workspace_id: str,
        primary: str,
        also: Sequence[str],
        *,
        rekey_to: str = "",
    ) -> Optional[Lockdown]:
        now = self._clock()
        seen: set[str] = set()
        for key_part in (primary, *also):
            text = (key_part or "").strip()
            if not text or text in seen:
                continue
            seen.add(text)
            stored = _project_key(workspace_id, text)
            entry = self._by_project.get(stored)
            if entry is None:
                continue
            if now >= entry.expires_at:
                self._by_project.pop(stored, None)
                self._save()
                continue
            if rekey_to and rekey_to != entry.project_slug:
                return self._rekey(entry, rekey_to)
            return entry
        return None

    def _rekey(self, entry: Lockdown, new_project_key: str) -> Lockdown:
        """Move a lock onto the registered id, merging conversations if needed."""
        dest_part = (new_project_key or "").strip()
        if not dest_part or dest_part == entry.project_slug:
            return entry
        old = entry.project_key
        dest = _project_key(entry.workspace_id, dest_part)
        existing = self._by_project.get(dest)
        self._by_project.pop(old, None)
        if (
            existing is not None
            and existing is not entry
            and self._clock() < existing.expires_at
        ):
            existing.conversations.update(entry.conversations)
            self._save()
            return existing
        entry.project_slug = dest_part
        self._by_project[dest] = entry
        self._save()
        return entry

    def remaining_sec(self, entry: Lockdown) -> Optional[float]:
        if entry.expires_at == NEVER:
            return None
        return max(0.0, entry.expires_at - self._clock())

    def set_policy(self, scope: str, ttl_sec: float) -> None:
        if scope in ("session", "project"):
            self.default_scope = scope
        self.default_ttl_sec = float(ttl_sec)
        self._save()

    def _load(self) -> None:
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        if not isinstance(raw, dict):
            return
        parents = raw.get("parents") or {}
        if isinstance(parents, dict):
            self._parent = {
                str(child): str(parent)
                for child, parent in parents.items()
                if child and parent
            }
        pending = raw.get("pending") or []
        if isinstance(pending, list):
            self._pending = [str(item) for item in pending if item]
        policy = raw.get("policy") if isinstance(raw.get("policy"), dict) else {}
        scope = str(policy.get("scope") or self.default_scope)
        if scope in ("session", "project"):
            self.default_scope = scope
        ttl = policy.get("ttl_sec")
        if isinstance(ttl, (int, float)) and ttl != 0:
            self.default_ttl_sec = float(ttl)
        locks = raw.get("locks") or []
        if not isinstance(locks, list):
            return
        for item in locks:
            if not isinstance(item, dict):
                continue
            ws = str(item.get("workspace_id") or "").strip()
            slug = str(item.get("project_slug") or "").strip()
            if not ws or not slug:
                continue
            convs = item.get("conversations") or []
            expires = item.get("expires_at")
            entry = Lockdown(
                workspace_id=ws,
                project_slug=slug,
                scope=str(item.get("scope") or DEFAULT_SCOPE),
                conversations={str(cid): True for cid in convs if cid},
                opened_at=float(item.get("opened_at") or 0),
                expires_at=NEVER if expires is None else float(expires),
            )
            self._by_project[entry.project_key] = entry

    def _save(self) -> None:
        payload = {
            "locks": [entry.as_dict() for entry in self._by_project.values()],
            "parents": dict(self._parent),
            "pending": list(self._pending),
            "policy": {
                "scope": self.default_scope,
                "ttl_sec": None if self.default_ttl_sec == NEVER else self.default_ttl_sec,
            },
        }
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
