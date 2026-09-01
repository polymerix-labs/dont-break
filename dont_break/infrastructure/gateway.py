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

"""Shared HTTP client for Polymerix gateway and viewer-api routes."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncIterator

import httpx

from dont_break.config import CLIENT_NAME, CLIENT_VERSION, Settings, client_os, install_id
from dont_break.domain.errors import (
    GATEWAY_UNREACHABLE_HINT,
    ApiErrorMessage,
    ErrorCode,
    GatewayError,
)
from dont_break.domain.wire import SFS_TRANSPORT_VERSION, SyncPhase, SyncUploadMode
from dont_break.infrastructure.gateway_models import SyncJsonField
from dont_break.infrastructure.gateway_routes import GatewayHeaders, GatewayRoutes

logger = logging.getLogger(__name__)


class GatewayClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=30.0))

    @property
    def base_url(self) -> str:
        return self._settings.api_base_url.rstrip("/")

    async def aclose(self) -> None:
        await self._client.aclose()

    def _unreachable(self, exc: Exception) -> GatewayError:
        """Nothing answered at the configured address.

        The address itself is not something the user can act on, so it goes to
        the log with the hint; the exception carries only the sentence.
        """
        logger.warning(
            "gateway unreachable at %s (%s) — %s",
            self.base_url,
            type(exc).__name__,
            GATEWAY_UNREACHABLE_HINT,
        )
        return GatewayError(
            ApiErrorMessage.GATEWAY_UNREACHABLE.value,
            code=ErrorCode.GATEWAY_UNREACHABLE,
        )

    def _headers(self, token: str, extra: dict[str, str] | None = None) -> dict[str, str]:
        """Auth plus desktop wake hints (version, os, install-id). No analytics token."""





        headers = {
            GatewayHeaders.AUTHORIZATION: GatewayHeaders.bearer(token),
            GatewayHeaders.ACCEPT: GatewayHeaders.JSON_ACCEPT,
            GatewayHeaders.CLIENT: CLIENT_NAME,
            GatewayHeaders.EXTENSION_VERSION: CLIENT_VERSION,
            GatewayHeaders.INSTALL_ID: install_id(),
            GatewayHeaders.OS: client_os(),
        }
        if extra:
            headers.update(extra)
        return headers

    async def verify_token(self, token: str) -> bool:
        return await self.identify(token) is not None

    async def identify(self, token: str) -> str | None:
        """The user id this token actually acts as, or None if it is refused.

        Returning the id rather than a bare bool is what lets `--wake` say
        *who* it signed in as. A saved token outliving the account that made
        it looks identical to a good one from the CLI's side, so the only
        defence a person has is seeing the identity printed.
        """
        url = f"{self.base_url}{GatewayRoutes.ME}"
        try:
            res = await self._client.get(url, headers=self._headers(token))
        except httpx.HTTPError:
            return None
        if res.status_code != 200:
            return None
        try:
            payload = res.json()
        except ValueError:
            return None
        if not isinstance(payload, dict):
            return None
        user_id = str(payload.get("user_id") or "").strip()
        return user_id or None

    async def list_projects(self, token: str) -> list[dict[str, Any]]:
        payload = await self._get_json(token, GatewayRoutes.ME_PROJECTS)
        projects = payload.get("projects", payload) if isinstance(payload, dict) else payload
        return [item for item in projects if isinstance(item, dict)] if isinstance(projects, list) else []

    async def get_context(self, token: str) -> dict[str, Any]:
        return await self._get_json(token, GatewayRoutes.ME_CONTEXT)

    async def create_project(
        self,
        token: str,
        workspace_id: str,
        display_name: str,
        *,
        remote_url: str = "",
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "workspace_id": workspace_id,
            "display_name": display_name,
        }
        if remote_url.strip():
            body["remote_url"] = remote_url.strip()
        return await self._post_json(token, GatewayRoutes.PROJECTS, body)

    async def create_api_token(
        self,
        token: str,
        *,
        workspace_id: str,
        project_id: str,
        label: str,
        scopes: list[str],
    ) -> dict[str, Any]:
        return await self._post_json(
            token,
            GatewayRoutes.ME_TOKENS,
            {
                "workspace_id": workspace_id,
                "project_id": project_id,
                "label": label,
                "scopes": scopes,
            },
        )

    async def revoke_api_token(self, token: str, token_id: str) -> None:
        await self._delete_json(token, GatewayRoutes.me_token(token_id))

    async def list_api_tokens(self, token: str) -> list[dict[str, Any]]:
        payload = await self._get_json(token, GatewayRoutes.ME_TOKENS)
        tokens = payload.get("tokens", payload) if isinstance(payload, dict) else payload
        return [item for item in tokens if isinstance(item, dict)] if isinstance(tokens, list) else []

    async def create_sync_session(
        self,
        token: str,
        workspace_id: str,
        project_slug: str,
        project_id: str = "",
        *,
        file_count: int,
        file_manifest: list[dict[str, Any]] | None = None,
        previous_bundle_fingerprint: str | None = None,
        upload_mode: SyncUploadMode = SyncUploadMode.STREAMING,
    ) -> dict[str, Any]:



        path = GatewayRoutes.sync_sessions(workspace_id, project_slug)
        body: dict[str, Any] = {
            SyncJsonField.FILE_COUNT.value: file_count,
            SyncJsonField.UPLOAD_MODE.value: upload_mode.value,
        }
        if file_manifest is not None:
            body[SyncJsonField.FILE_MANIFEST.value] = file_manifest
        if previous_bundle_fingerprint:
            body[SyncJsonField.PREVIOUS_BUNDLE_FINGERPRINT.value] = previous_bundle_fingerprint
        return await self._post_json(token, path, body)

    async def get_sync_upload_url(self, token: str, session_id: str) -> dict[str, Any]:
        path = GatewayRoutes.sync_upload_url(session_id)
        return await self._post_json(token, path, {})

    async def get_sync_upload_plan(
        self,
        token: str,
        session_id: str,
        *,
        estimated_gzip_bytes: int | None = None,
        encoding: str | None = None,
        transport_version: int = SFS_TRANSPORT_VERSION,
    ) -> dict[str, Any]:
        path = GatewayRoutes.sync_upload_plan(session_id)
        body: dict[str, Any] = {SyncJsonField.TRANSPORT_VERSION.value: transport_version}
        if estimated_gzip_bytes is not None:
            body[SyncJsonField.ESTIMATED_GZIP_BYTES.value] = estimated_gzip_bytes
        if encoding:


            body[SyncJsonField.ENCODING.value] = encoding
        return await self._post_json(token, path, body)

    async def complete_sync_session(
        self,
        token: str,
        session_id: str,
        *,
        bundle_fingerprint: str,
        repo_root: str,
        byte_size: int | None = None,
        content_sha256: str | None = None,
        parts: list[dict[str, Any]] | None = None,
        transport_version: int = SFS_TRANSPORT_VERSION,
    ) -> dict[str, Any]:
        path = GatewayRoutes.sync_complete(session_id)
        body: dict[str, Any] = {
            SyncJsonField.BUNDLE_FINGERPRINT.value: bundle_fingerprint,
            SyncJsonField.REPO_ROOT.value: repo_root,
            SyncJsonField.TRANSPORT_VERSION.value: transport_version,
        }
        if parts is not None:



            body[SyncJsonField.PARTS.value] = parts
        else:
            body[SyncJsonField.BYTE_SIZE.value] = byte_size or 0
            body[SyncJsonField.CONTENT_SHA256.value] = content_sha256 or ""


        url = f"{self.base_url}{path}"
        last_error: GatewayError | None = None
        for attempt in range(1, 4):
            try:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(900.0, connect=30.0)
                ) as client:
                    res = await client.post(
                        url, headers=self._headers(token), json=body
                    )
                return self._expect_json(res)
            except httpx.ConnectError as exc:
                raise self._unreachable(exc) from exc
            except GatewayError as exc:
                last_error = exc
                if exc.status_code is None or exc.status_code < 500:
                    raise
                if attempt == 3:
                    break
                await asyncio.sleep(2.0 * attempt)
        assert last_error is not None
        raise last_error

    async def notify_sync_part_uploaded(
        self, token: str, session_id: str, part_id: str
    ) -> dict[str, Any]:



        path = GatewayRoutes.sync_part_uploaded(session_id, part_id)
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=5.0)) as client:
            try:
                res = await client.post(url, headers=self._headers(token), json={})
            except httpx.ConnectError as exc:
                raise self._unreachable(exc) from exc
            return self._expect_json(res)

    async def retry_sync_build(self, token: str, session_id: str) -> dict[str, Any]:
        path = GatewayRoutes.sync_retry_build(session_id)
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.post(url, headers=self._headers(token), json={})
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        if res.status_code not in (200, 202):
            detail = res.text[:500] if res.text else res.reason_phrase
            raise GatewayError(f"Gateway request failed ({res.status_code}): {detail}")
        return (
            res.json()
            if res.content
            else {SyncJsonField.STATUS.value: SyncPhase.SEALING.value}
        )

    async def get_sync_session(self, token: str, session_id: str) -> dict[str, Any]:
        path = GatewayRoutes.sync_session(session_id)
        return await self._get_json(token, path)

    async def put_sync_file(
        self,
        token: str,
        session_id: str,
        file_index: int,
        file_entry: dict[str, Any],
        *,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        path = GatewayRoutes.sync_file(session_id, file_index)
        extra = (
            {GatewayHeaders.IDEMPOTENCY_KEY: idempotency_key} if idempotency_key else None
        )
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.put(
                url,
                headers=self._headers(token, extra),
                json=file_entry,
            )
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        return self._expect_json(res)

    async def put_sync_files_batch(
        self,
        token: str,
        session_id: str,
        files: list[dict[str, Any]],
        *,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """One PUT for N delta files (single manifest write server-side).

        Raises GatewayError with the response status attached so callers can
        fall back to unitary PUTs against older gateways (404/405).
        """
        path = GatewayRoutes.sync_files_batch(session_id)
        extra = (
            {GatewayHeaders.IDEMPOTENCY_KEY: idempotency_key} if idempotency_key else None
        )
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.put(
                url,
                headers=self._headers(token, extra),
                json={"files": files},
            )
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        return self._expect_json(res)

    async def seal_sync_session(
        self,
        token: str,
        session_id: str,
        *,
        bundle_fingerprint: str,
    ) -> dict[str, Any]:
        path = GatewayRoutes.sync_seal(session_id)
        return await self._post_json(
            token, path, {SyncJsonField.BUNDLE_FINGERPRINT.value: bundle_fingerprint}
        )

    async def open_sync_events_sse(
        self,
        token: str,
        session_id: str,
    ) -> AsyncIterator[dict[str, Any]]:
        path = GatewayRoutes.sync_events(session_id)
        url = f"{self.base_url}{path}"
        headers = self._headers(token, {GatewayHeaders.ACCEPT: GatewayHeaders.SSE_ACCEPT})
        async with self._client.stream("GET", url, headers=headers) as res:
            if res.status_code >= 400:
                detail = (await res.aread()).decode("utf-8", errors="replace")[:500]
                raise GatewayError(f"SSE open failed ({res.status_code}): {detail}")
            event_data: list[str] = []
            async for line in res.aiter_lines():
                if line.startswith("data:"):
                    event_data.append(line[5:].strip())
                elif line == "" and event_data:
                    payload = "\n".join(event_data)
                    event_data = []
                    try:
                        yield json.loads(payload)
                    except json.JSONDecodeError:
                        continue

    def _expect_json(self, res: httpx.Response) -> dict[str, Any]:
        if res.status_code == 401:
            raise GatewayError(ApiErrorMessage.INVALID_TOKEN.value, status_code=401)
        if res.status_code >= 400:
            detail = res.text[:500] if res.text else res.reason_phrase
            raise GatewayError(
                f"Gateway request failed ({res.status_code}): {detail}",
                status_code=res.status_code,
            )
        return res.json() if res.content else {}

    async def _post_json(self, token: str, path: str, body: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.post(url, headers=self._headers(token), json=body)
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        return self._expect_json(res)

    async def _get_json(self, token: str, path: str) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.get(url, headers=self._headers(token))
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        return self._expect_json(res)

    async def _delete_json(self, token: str, path: str) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            res = await self._client.delete(url, headers=self._headers(token))
        except httpx.ConnectError as exc:
            raise self._unreachable(exc) from exc
        return self._expect_json(res)

    async def viewer_get(
        self,
        token: str,
        workspace_id: str,
        project_slug: str,
        suffix: str,
        *,
        query: dict[str, str] | None = None,
    ) -> httpx.Response:
        from urllib.parse import urlencode

        path = GatewayRoutes.viewer(workspace_id, project_slug, suffix)
        params = urlencode(query or {})
        url = f"{self.base_url}{path}{('?' + params) if params else ''}"
        try:
            return await self._client.get(url, headers=self._headers(token), timeout=60.0)
        except httpx.HTTPError as exc:
            raise self._unreachable(exc) from exc

    async def open_sse_stream(
        self,
        token: str,
        path: str,
        json_body: Any,
    ) -> httpx.Response:
        """Opens a POST SSE stream (assist runs). The caller owns the
        response and must `aclose()` it; a run can span several model turns
        so no read timeout is applied."""
        url = f"{self.base_url}{path}"
        headers = self._headers(token, {GatewayHeaders.ACCEPT: GatewayHeaders.SSE_ACCEPT})
        request = self._client.build_request(
            "POST",
            url,
            headers=headers,
            json=json_body,
            timeout=httpx.Timeout(None, connect=30.0),
        )
        try:
            return await self._client.send(request, stream=True)
        except httpx.HTTPError as exc:
            raise self._unreachable(exc) from exc

    async def api_request(
        self,
        token: str,
        method: str,
        path: str,
        *,
        query: dict[str, str] | None = None,
        json_body: Any | None = None,
    ) -> httpx.Response:
        """Generic authenticated gateway request (query and rules proxies)."""
        from urllib.parse import urlencode

        params = urlencode(query or {})
        url = f"{self.base_url}{path}{('?' + params) if params else ''}"
        try:
            return await self._client.request(
                method,
                url,
                headers=self._headers(token),
                json=json_body,
                timeout=60.0,
            )
        except httpx.HTTPError as exc:
            raise self._unreachable(exc) from exc
