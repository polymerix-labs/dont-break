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

from dont_break.auth.constants import AuthCallbackField
from dont_break.domain.errors import ApiErrorMessage, AuthError
from dont_break.infrastructure.credentials import (
    StoredCredentials,
    is_valid_access_token,
    save_credentials,
)


def parse_callback_query(
    query: dict[str, str],
    pending_state: str | None,
) -> StoredCredentials:
    token = (query.get(AuthCallbackField.TOKEN.value) or "").strip()
    state = (query.get(AuthCallbackField.STATE.value) or "").strip()
    org_slug = (query.get(AuthCallbackField.ORG_SLUG.value) or "").strip()

    if not token or not state or not pending_state or state != pending_state:
        raise AuthError(ApiErrorMessage.AUTH_INVALID_CALLBACK.value)

    if not is_valid_access_token(token):
        raise AuthError(ApiErrorMessage.AUTH_INVALID_TOKEN.value)

    creds = StoredCredentials(token=token, org_slug=org_slug)
    save_credentials(creds)
    return creds
