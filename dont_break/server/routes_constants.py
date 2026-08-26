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

"""Local extension server route paths."""

from __future__ import annotations


class LocalRoutes:
    """HTTP routes served by the dont-break local FastAPI server."""

    SESSION = "/api/session"
    SESSION_EVENTS = "/api/session/events"
    PROJECT_PICK = "/api/project/pick"
    PROJECTS = "/api/projects"
    PROJECT_LINK = "/api/project/link"
    PROJECT_CREATE = "/api/project/create"
    PROJECT_SYNC = "/api/project/sync"
    PROJECT_WATCH = "/api/project/watch"
    DEBUG_VIEWER = "/api/debug/viewer"
    WS_GRAPH = "/ws/graph"
    VIEWER_MOUNT = "/viewer/"
    AUTH_CALLBACK = "/auth/callback"
    AGENTS_SETUP = "/api/agents/setup"
    AGENTS_MINT_TOKEN = "/api/agents/mint-token"
    AGENTS_REGENERATE_TOKEN = "/api/agents/regenerate-token"
    AGENTS_SKILL_INSTALL = "/api/agents/skill/install"
    AGENTS_HOOK_STATUS = "/api/agents/hook/status"
    AGENTS_HOOK_INSTALL = "/api/agents/hook/install"
    HOOK_DECISION = "/api/hook/decision"
    HOOK_SUBAGENT = "/api/hook/subagent"
    LOCKDOWN = "/api/lockdown"
    LOCKDOWN_RELEASE = "/api/lockdown/release"
    LOCKDOWN_POLICY = "/api/lockdown/policy"


class ViewerProxyRoutes:
    """Local Nebula viewer proxy paths (mapped to gateway viewer suffixes)."""

    SNAPSHOT_META = "/nebula/snapshot/meta"
    NODE_DETAIL = "/nebula/nodes/{node_id}/detail"
    ARCH_GLOBAL = "/nebula/arch/global"
    ARCH_SCORES = "/nebula/arch/scores"
    ARCH_ACTIONS = "/nebula/arch/actions"
    RESOLVED_METHODS = "/nebula/resolved/methods"
    RESOLVED_HAPPENS_BEFORE = "/nebula/resolved/happens-before"

    SNAPSHOT_META_SUFFIX = "/snapshot/meta"
    ARCH_GLOBAL_SUFFIX = "/arch/global"
    ARCH_SCORES_SUFFIX = "/arch/scores"
    ARCH_ACTIONS_SUFFIX = "/arch/actions"
    RESOLVED_METHODS_SUFFIX = "/resolved/methods"
    RESOLVED_HAPPENS_BEFORE_SUFFIX = "/resolved/happens-before"

    @staticmethod
    def node_detail_suffix(node_id: str) -> str:
        from urllib.parse import quote

        return f"/nodes/{quote(node_id)}/detail"


class QueryProxyRoutes:
    """Local query proxy paths (mapped to gateway query suffixes)."""

    FIND = "/nebula/query/find"
    SEMANTIC_FIND = "/nebula/query/semantic-find"
    IMPACT = "/nebula/query/impact"
    PATH = "/nebula/query/path"
    DO_NOT_TOUCH = "/nebula/query/do-not-touch"
    ARCH_STATUS = "/nebula/query/arch/status"
    CHECK = "/nebula/query/check"
    SIMULATE_RULE = "/nebula/query/simulate-rule"

    FIND_SUFFIX = "/find"
    SEMANTIC_FIND_SUFFIX = "/semantic-find"
    IMPACT_SUFFIX = "/impact"
    PATH_SUFFIX = "/path"
    DO_NOT_TOUCH_SUFFIX = "/do-not-touch"
    ARCH_STATUS_SUFFIX = "/arch/status"
    CHECK_SUFFIX = "/check"
    SIMULATE_RULE_SUFFIX = "/simulate-rule"


class AssistProxyRoutes:
    """Local Rule Studio assist proxy paths (mapped to gateway assist routes)."""

    RULES = "/nebula/assist/rules"
    RUN_EVENTS = "/nebula/assist/rules/{run_id}/events"

    RULES_SUFFIX = "/rules"

    @staticmethod
    def run_events_suffix(run_id: str) -> str:
        from urllib.parse import quote

        return f"/rules/{quote(run_id)}/events"


class RulesProxyRoutes:
    """Local rules proxy paths (mapped to gateway rules routes)."""

    LIST = "/nebula/rules"
    ITEM = "/nebula/rules/{rule_id}"
    NODES = "/nebula/rules/{rule_id}/nodes"
    APPROVE = "/nebula/rules/{rule_id}/approve"
    REJECT = "/nebula/rules/{rule_id}/reject"
    ACTIVITY = "/nebula/rules/activity"
    ACTIVITY_ACK = "/nebula/rules/activity/incidents/{incident_id}/ack"
    EVENTS = "/nebula/rules/events"

    ACTIVITY_SUFFIX = "/activity"
    EVENTS_SUFFIX = "/events"

    @staticmethod
    def item_suffix(rule_id: str) -> str:
        from urllib.parse import quote

        return f"/{quote(rule_id)}"

    @staticmethod
    def activity_ack_suffix(incident_id: str) -> str:
        from urllib.parse import quote

        return f"/activity/incidents/{quote(incident_id)}/ack"

    @staticmethod
    def nodes_suffix(rule_id: str) -> str:
        from urllib.parse import quote

        return f"/{quote(rule_id)}/nodes"

    @staticmethod
    def approve_suffix(rule_id: str) -> str:
        from urllib.parse import quote

        return f"/{quote(rule_id)}/approve"

    @staticmethod
    def reject_suffix(rule_id: str) -> str:
        from urllib.parse import quote

        return f"/{quote(rule_id)}/reject"
