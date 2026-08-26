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

A cache miss, an unmapped folder, a path outside the repo, or a backend that
does not answer still allow. A lock already known locally does not: expiration
is compared at this decision, and the network is not consulted. The project is
resolved from the folder mapping, never from the session store.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Optional

from dont_break.application.lockdown import LockdownStore
from dont_break.application.protected_paths_cache import (
    ProtectedPathsCache,
    ProtectedRule,
)
from dont_break.project.mapping import (
    FolderProjectStore,
    ProjectMapping,
    relative_to_folder,
)

ALLOW = "allow"
DENY = "deny"


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

    def as_hook_response(self) -> dict[str, str]:
        body: dict[str, str] = {"permission": self.permission}
        if self.agent_message:
            body["agent_message"] = self.agent_message
        if self.user_message:
            body["user_message"] = self.user_message
        return body


def allow(**kwargs: Any) -> HookDecision:
    return HookDecision(permission=ALLOW, **kwargs)


class HookDecisionService:
    def __init__(
        self,
        cache: ProtectedPathsCache,
        mappings: FolderProjectStore,
        *,
        enforce_blocks: bool = False,
        locks: LockdownStore | None = None,
    ) -> None:
        self._cache = cache
        self._mappings = mappings
        self.enforce_blocks = enforce_blocks
        self._locks = locks

    async def decide(self, payload: Mapping[str, Any]) -> HookDecision:
        try:
            located = self._locate(payload)
        except Exception:
            return allow()
        if located is None:
            conversation_id = str(payload.get("conversation_id") or "").strip()
            tool_name = str(payload.get("tool_name") or "").strip()
            return allow(conversation_id=conversation_id, tool_name=tool_name)
        mapping, relative, conversation_id, tool_name = located
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
                )
        try:
            return await self._match_rules(mapping, relative, conversation_id, tool_name)
        except Exception:
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
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

    async def _match_rules(
        self,
        mapping: ProjectMapping,
        relative: str,
        conversation_id: str,
        tool_name: str,
    ) -> HookDecision:
        entry = await self._cache.ensure(mapping.workspace_id, mapping.project_slug)
        if entry is None:
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
            )

        matched = entry.match(relative)
        if matched is None:
            return allow(
                mapping=mapping,
                relative_path=relative,
                conversation_id=conversation_id,
                tool_name=tool_name,
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
        )
