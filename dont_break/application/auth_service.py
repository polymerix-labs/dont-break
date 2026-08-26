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

"""Authentication restore and browser sign-in orchestration."""

from __future__ import annotations

import webbrowser

from dont_break.application.session_store import SessionStore
from dont_break.auth.callback import parse_callback_query
from dont_break.domain.errors import AuthError
from dont_break.auth.connect import build_connect_url, new_auth_state
from dont_break.config import AUTH_CALLBACK_TIMEOUT_SEC, Settings
from dont_break.infrastructure.credentials import CredentialStore, StoredCredentials, is_valid_access_token
from dont_break.infrastructure.gateway import GatewayClient


class AuthService:
    def __init__(
        self,
        store: SessionStore,
        gateway: GatewayClient | None = None,
        credentials: CredentialStore | None = None,
    ) -> None:
        self._store = store
        self._gateway = gateway
        self._credentials = credentials or CredentialStore()

    def _gateway_for(self, settings: Settings) -> GatewayClient:
        return self._gateway or GatewayClient(settings)

    async def restore_saved_session(
        self, settings: Settings, creds: StoredCredentials | None = None
    ) -> bool:
        creds = creds or self._credentials.load()
        token = creds.token.strip()
        org_slug = creds.org_slug.strip()
        if not is_valid_access_token(token):
            return False
        gateway = self._gateway_for(settings)
        owned = self._gateway is None
        try:
            if not await gateway.verify_token(token):
                return False
        finally:
            if owned:
                await gateway.aclose()
        await self._store.restore_auth(org_slug)
        return True

    async def begin_browser_sign_in(self, settings: Settings) -> str:
        state = new_auth_state()
        await self._store.set_pending_auth(state)
        return build_connect_url(state, settings)

    async def wait_for_callback(self, timeout_sec: float = AUTH_CALLBACK_TIMEOUT_SEC) -> None:
        await self._store.wait_for_auth(timeout_sec)

    async def handle_callback(self, query: dict[str, str]) -> None:
        pending = self._store.pending_auth_state
        try:
            creds = parse_callback_query(query, pending)
        except AuthError as exc:
            await self._store.fail_auth(str(exc))
            raise
        await self._store.complete_auth(creds.org_slug)

    def open_browser(self, url: str) -> None:
        webbrowser.open(url)
