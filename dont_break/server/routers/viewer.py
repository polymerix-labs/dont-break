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

from __future__ import annotations

from fastapi import APIRouter, Request

from dont_break.server.routes_constants import ViewerProxyRoutes
from dont_break.server.viewer_proxy import proxy_viewer_get

router = APIRouter()


@router.get(ViewerProxyRoutes.SNAPSHOT_META)
async def nebula_snapshot_meta(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.SNAPSHOT_META_SUFFIX)


@router.get(ViewerProxyRoutes.NODE_DETAIL)
async def nebula_node_detail(request: Request, node_id: str):
    return await proxy_viewer_get(request, ViewerProxyRoutes.node_detail_suffix(node_id))


@router.get(ViewerProxyRoutes.ARCH_GLOBAL)
async def nebula_arch_global(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.ARCH_GLOBAL_SUFFIX)


@router.get(ViewerProxyRoutes.ARCH_SCORES)
async def nebula_arch_scores(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.ARCH_SCORES_SUFFIX)


@router.get(ViewerProxyRoutes.ARCH_ACTIONS)
async def nebula_arch_actions(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.ARCH_ACTIONS_SUFFIX)


@router.get(ViewerProxyRoutes.RESOLVED_METHODS)
async def nebula_resolved_methods(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.RESOLVED_METHODS_SUFFIX)


@router.get(ViewerProxyRoutes.RESOLVED_HAPPENS_BEFORE)
async def nebula_happens_before(request: Request):
    return await proxy_viewer_get(request, ViewerProxyRoutes.RESOLVED_HAPPENS_BEFORE_SUFFIX)
