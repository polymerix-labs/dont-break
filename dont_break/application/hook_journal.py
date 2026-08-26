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

"""Fire-and-forget journal of a hook decision. Failures never change the verdict."""

from __future__ import annotations

import logging
from typing import Any, Callable, Optional, Protocol

from dont_break.application.hook_decision import HookDecision
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.infrastructure.gateway_routes import GatewayRoutes

logger = logging.getLogger(__name__)


class HookJournal(Protocol):
    async def emit(self, decision: HookDecision) -> None: ...


class NullHookJournal:
    async def emit(self, decision: HookDecision) -> None:
        return None


class GatewayHookJournal:
    def __init__(
        self,
        gateway: Callable[[], GatewayClient],
        token_provider: Callable[[], str],
    ) -> None:
        self._gateway = gateway
        self._token_provider = token_provider

    async def emit(self, decision: HookDecision) -> None:
        if decision.matched is None or decision.mapping is None:
            return
        token = str(self._token_provider() or "").strip()
        mapping = decision.mapping
        if not token or not mapping.workspace_id or not mapping.project_slug:
            return
        kind = _kind_for(decision)
        path = GatewayRoutes.rules(mapping.workspace_id, mapping.project_slug, "/hook-events")
        body: dict[str, Any] = {
            "kind": kind,
            "rule_id": decision.matched.rule_id,
            "agent_session_id": decision.conversation_id,
        }
        await self._gateway().api_request(token, "POST", path, json_body=body)


def _kind_for(decision: HookDecision) -> str:
    if decision.permission == "deny":
        return "block_forced"
    if decision.matched is not None and decision.matched.severity == "block":
        return "block_advised"
    return "warned"


async def emit_quietly(journal: Optional[HookJournal], decision: HookDecision) -> None:
    if journal is None or decision.matched is None:
        return
    try:
        await journal.emit(decision)
    except Exception:
        logger.debug("hook observation journal failed", exc_info=True)
