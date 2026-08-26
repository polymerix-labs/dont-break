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

"""Local proxies for the gateway rules CRUD and zone visualization."""

from __future__ import annotations

from fastapi import APIRouter, Request

from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.server.deps import session_store_from_app
from dont_break.server.gateway_proxy import proxy_api_request
from dont_break.server.routes_constants import RulesProxyRoutes

router = APIRouter()


def _invalidate_hook_cache(request: Request) -> None:
    """A rule written here is visible to the hook without waiting for the poll."""
    cache = getattr(request.app.state, "protected_paths_cache", None)
    if cache is None:
        return
    store = session_store_from_app(request)
    workspace = resolve_workspace_id(store)
    slug = store.project_slug.strip()
    if workspace and slug:
        cache.invalidate(workspace, slug)


@router.get(RulesProxyRoutes.LIST)
async def rules_list(request: Request):
    return await proxy_api_request(request, "rules", "GET")


@router.get(RulesProxyRoutes.EVENTS)
async def rules_events(request: Request):
    return await proxy_api_request(
        request, "rules", "GET", RulesProxyRoutes.EVENTS_SUFFIX
    )


@router.get(RulesProxyRoutes.ACTIVITY)
async def rules_activity(request: Request):
    return await proxy_api_request(
        request, "rules", "GET", RulesProxyRoutes.ACTIVITY_SUFFIX
    )


@router.post(RulesProxyRoutes.ACTIVITY_ACK)
async def rules_activity_ack(request: Request, incident_id: str):
    return await proxy_api_request(
        request, "rules", "POST", RulesProxyRoutes.activity_ack_suffix(incident_id)
    )


@router.post(RulesProxyRoutes.LIST)
async def rules_create(request: Request):
    body = await request.json()
    response = await proxy_api_request(request, "rules", "POST", json_body=body)
    if 200 <= response.status_code < 300:
        _invalidate_hook_cache(request)
    return response


@router.put(RulesProxyRoutes.ITEM)
async def rules_update(request: Request, rule_id: str):
    body = await request.json()
    response = await proxy_api_request(
        request, "rules", "PUT", RulesProxyRoutes.item_suffix(rule_id), json_body=body
    )
    if 200 <= response.status_code < 300:
        _invalidate_hook_cache(request)
    return response


@router.delete(RulesProxyRoutes.ITEM)
async def rules_delete(request: Request, rule_id: str):
    response = await proxy_api_request(
        request, "rules", "DELETE", RulesProxyRoutes.item_suffix(rule_id)
    )
    if 200 <= response.status_code < 300:
        _invalidate_hook_cache(request)
    return response


@router.get(RulesProxyRoutes.NODES)
async def rules_nodes(request: Request, rule_id: str):
    return await proxy_api_request(
        request, "rules", "GET", RulesProxyRoutes.nodes_suffix(rule_id)
    )


@router.post(RulesProxyRoutes.APPROVE)
async def rules_approve(request: Request, rule_id: str):
    response = await proxy_api_request(
        request, "rules", "POST", RulesProxyRoutes.approve_suffix(rule_id)
    )
    if 200 <= response.status_code < 300:
        _invalidate_hook_cache(request)
    return response


@router.post(RulesProxyRoutes.REJECT)
async def rules_reject(request: Request, rule_id: str):
    response = await proxy_api_request(
        request, "rules", "POST", RulesProxyRoutes.reject_suffix(rule_id)
    )
    if 200 <= response.status_code < 300:
        _invalidate_hook_cache(request)
    return response
