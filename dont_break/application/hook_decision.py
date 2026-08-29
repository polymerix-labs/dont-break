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

"""Local hook decision: protected-paths cache plus an in-process lockdown.

Watch mode still allows when the cache, mapping, or backend is missing.
Hard mode does not: if this workspace is Hard and the write cannot be
proven allowed, it is denied. A lock already known locally still denies
without the network.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping, Optional

from dont_break.application.lockdown import LockdownStore
from dont_break.application.protected_paths_cache import (
    ProtectedPathsCache,
    ProtectedRule,
)
from dont_break.application.recent_checks import RecentCheckStore
from dont_break.application.write_mode import WriteModeStore
from dont_break.hooks.write_payload import observation_fields
from dont_break.project.mapping import (
    FolderProjectStore,
    ProjectMapping,
    relative_to_folder,
)

ALLOW = "allow"
DENY = "deny"

UNVERIFIED = (
    "dont-break: Hard mode cannot verify this write. "
    "Call check_change with this path. If the verdict is block, do not write."
)
UNCHECKED = (
    "dont-break: this file is protected and has not been checked. "
    "Call check_change with this path. If the verdict is block, do not write."
)


@dataclass(frozen=True)
class HookDecision:
    permission: str
    agent_message: str = ""
    user_message: str = ""
    matched: Optional[ProtectedRule] = None
    mapping: Optional[ProjectMapping] = None
    relative_path: str = ""
    conversation_id: str = ""
    tool_name: str = ""
    extra: dict[str, Any] = field(default_factory=dict)

    def as_hook_response(self) -> dict[str, str]:
        body: dict[str, str] = {"permission": self.permission}
        if self.agent_message:
            body["agent_message"] = self.agent_message
        if self.user_message:
            body["user_message"] = self.user_message
        return body


def allow(**kwargs: Any) -> HookDecision:
    return HookDecision(permission=ALLOW, **kwargs)


def deny_unverified(**kwargs: Any) -> HookDecision:
    return HookDecision(
        permission=DENY,
        agent_message=kwargs.pop("agent_message", UNVERIFIED),
        user_message=kwargs.pop(
            "user_message", "Hard mode: write refused because it could not be verified."
        ),
        **kwargs,
    )


class HookDecisionService:
    def __init__(
        self,
        cache: ProtectedPathsCache,
        mappings: FolderProjectStore,
        *,
        enforce_blocks: bool = False,
        locks: LockdownStore | None = None,
        write_modes: WriteModeStore | None = None,
        recent_checks: RecentCheckStore | None = None,
    ) -> None:
        self._cache = cache
        self._mappings = mappings
        self.enforce_blocks = enforce_blocks
        self._locks = locks
        self._write_modes = write_modes
        self._recent_checks = recent_checks

    def is_hard(self, payload: Mapping[str, Any]) -> bool:
        if self._write_modes is None:
            return False
        workspace_root = str(payload.get("workspace_root") or "").strip()
        if workspace_root and self._write_modes.is_hard(workspace_root):
            return True
        file_path = str(payload.get("file_path") or "").strip()
        if not file_path:
            return False
        try:
            mapping = self._mappings.for_file(file_path, workspace_root)
        except Exception:
            return bool(workspace_root and self._write_modes.is_hard(workspace_root))
        if mapping is None:
            return False
        return self._write_modes.is_hard(mapping.folder)

    async def decide(self, payload: Mapping[str, Any]) -> HookDecision:
        hard = self.is_hard(payload)
        conversation_id = str(payload.get("conversation_id") or "").strip()
        tool_name = str(payload.get("tool_name") or "").strip()
        extra = observation_fields(payload)
        extra["permission_preview"] = ALLOW
        try:
            located = self._locate(payload)
        except Exception:
            if hard:
                return deny_unverified(
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
            return allow(
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )
        if located is None:
            if hard:
                return deny_unverified(
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
            return allow(
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )
        mapping, relative, conversation_id, tool_name = located
        extra["relative_path"] = relative
        if self._locks is not None:
            locked = self._locks.active(
                mapping.workspace_id, mapping.project_slug, conversation_id
            )
            if locked is not None:
                return HookDecision(
                    permission=DENY,
                    agent_message=(
                        "dont-break: this agent session is locked after a blocked write. "
                        "A person must release it, or wait until it expires."
                    ),
                    user_message="Agent writes are locked on this project.",
                    mapping=mapping,
                    relative_path=relative,
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
        try:
            return await self._match_rules(
                mapping, relative, conversation_id, tool_name, extra, payload
            )
        except Exception:
            if self._write_modes is not None and self._write_modes.is_hard(mapping.folder):
                return deny_unverified(
                    mapping=mapping,
                    relative_path=relative,
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )

    def _locate(
        self, payload: Mapping[str, Any]
    ) -> Optional[tuple[ProjectMapping, str, str, str]]:
        file_path = str(payload.get("file_path") or "").strip()
        workspace_root = str(payload.get("workspace_root") or "").strip()
        conversation_id = str(payload.get("conversation_id") or "").strip()
        tool_name = str(payload.get("tool_name") or "").strip()
        if not file_path:
            return None
        mapping = self._mappings.for_file(file_path, workspace_root)
        if mapping is None or not mapping.workspace_id or not mapping.project_slug:
            return None
        relative = relative_to_folder(file_path, mapping.folder)
        if relative is None:
            return None
        return mapping, relative, conversation_id, tool_name

    def _parent_ids(self, conversation_id: str, payload: Mapping[str, Any]) -> tuple[str, ...]:
        found: list[str] = []
        parent = str(payload.get("parent_conversation_id") or "").strip()
        if parent:
            found.append(parent)
        if self._locks is not None and conversation_id:
            root = self._locks.root_conversation(conversation_id)
            if root and root != conversation_id and root not in found:
                found.append(root)
        return tuple(found)

    async def _match_rules(
        self,
        mapping: ProjectMapping,
        relative: str,
        conversation_id: str,
        tool_name: str,
        extra: dict[str, Any] | None = None,
        payload: Mapping[str, Any] | None = None,
    ) -> HookDecision:
        extra = extra or {}
        payload = payload or {}
        hard = (
            self._write_modes is not None
            and self._write_modes.is_hard(mapping.folder)
        )
        entry = await self._cache.ensure(mapping.workspace_id, mapping.project_slug)
        if entry is None:
            if hard:
                return deny_unverified(
                    mapping=mapping,
                    relative_path=relative,
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )

        matched = entry.match(relative)
        if matched is None:
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )

        if hard:
            permit = (
                self._recent_checks.lookup(
                    relative,
                    conversation_id=conversation_id,
                    parent_ids=self._parent_ids(conversation_id, payload),
                )
                if self._recent_checks
                else None
            )
            if permit is None or permit.verdict == "block":
                reason = (
                    UNCHECKED
                    if permit is None
                    else (
                        f"dont-break: check_change blocked {relative}. Do not write this file."
                    )
                )
                return HookDecision(
                    permission=DENY,
                    agent_message=reason,
                    user_message=f"{relative} is protected. A check must pass first.",
                    matched=matched,
                    mapping=mapping,
                    relative_path=relative,
                    conversation_id=conversation_id,
                    tool_name=tool_name,
                    extra=extra,
                )
            return allow(
                agent_message=(
                    f"dont-break: {relative} was checked ({permit.verdict}). Write allowed."
                ),
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
                matched=matched,
            )

        agent_message = (
            f"dont-break: rule {matched.rule_id} covers {relative} at distance 0. "
            "Do not write this file."
        )
        user_message = f"{relative} is protected by {matched.rule_id} ({matched.severity})."
        if self.enforce_blocks and matched.severity == "block":
            if self._locks is not None:
                try:
                    self._locks.open(
                        mapping.workspace_id, mapping.project_slug, conversation_id
                    )
                except Exception:
                    pass
            return HookDecision(
                permission=DENY,
                agent_message=agent_message,
                user_message=user_message,
                matched=matched,
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
                extra=extra,
            )
        return HookDecision(
            permission=ALLOW,
            agent_message=agent_message,
            user_message=user_message,
            matched=matched,
            mapping=mapping,
            relative_path=relative,
            conversation_id=conversation_id,
            tool_name=tool_name,
            extra=extra,
        )
