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

"""Application-layer session state and auth coordination."""

from __future__ import annotations

import asyncio
import time
from typing import Any

from dont_break import __version__
from dont_break.config import AUTH_CALLBACK_TIMEOUT_SEC, Settings
from dont_break.credentials import StoredCredentials, load_credentials
from dont_break.domain.errors import ApiErrorMessage
from dont_break.domain.session import SessionSnapshot, human_org_label, is_opaque_id
from dont_break.domain.wire import (
    GraphDeltaOp,
    GraphStreamInboundType,
    GraphStreamPhase,
    SyncEventType,
    SyncPhase,
    SyncProgressLabel,
    SyncProgressThresholds,
    SyncUploadMode,
    parse_graph_delta_op,
    parse_graph_message_type,
    parse_graph_stream_phase,
    parse_sync_event_type,
    parse_sync_phase,
    humanize_sync_error,
    sync_failure_text,
    sync_l2_blend_pct,
    sync_phase_label,
)



_PROGRESS_EVENTS = (
    SyncEventType.UPLOAD_PROGRESS,
    SyncEventType.SEAL_PROGRESS,
    SyncEventType.L2_PARTIAL,
)


def _phase_to_wire(phase: SyncPhase | None) -> str:
    return phase.value if phase is not None else ""


class SessionStore:
    """Mutable session state with async-safe auth coordination."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self.authenticated: bool = False
        self.org_slug: str = ""
        self.workspace_id: str = ""
        self.project_path: str = ""
        self.project_id: str = ""
        self.project_slug: str = ""
        self.project_display_name: str = ""
        self.graph_error: str = ""
        self.snapshot_saved: bool = False
        self.graph_stream_connected: bool = False
        self.graph_bootstrap_complete: bool = False
        self.graph_nodes_received: int = 0
        self.sync_phase: SyncPhase | None = None
        self.sync_session_id: str = ""
        self.graph_version: int = 0
        self.coverage_pct: int = 0
        self.sync_progress_label: str = ""
        self._label_phase: SyncPhase | None = None
        self.sync_upload_mode: str = ""
        self.bundle_fingerprint: str = ""
        self.live_sync_enabled: bool = True
        self.watch_status: str = ""
        self.watch_error: str = ""
        self.last_synced_at: float = 0.0
        self.pending_auth_state: str | None = None
        self.auth_error: str = ""
        self._progress_checkpoint_at: float = 0.0
        self._auth_event: asyncio.Event | None = None
        self._listeners: list[asyncio.Queue[SessionSnapshot | None]] = []

    def _bump_progress_checkpoint(self, pct: int, *, creep: bool = True) -> None:
        """Record a hard progress checkpoint (resets temporal creep).

        ``creep=False`` freezes the bar where it is put. The creep exists to
        show that a slow step is still alive; after a failure there is nothing
        alive to show, and re-arming it made a dead sync crawl from 0 to 4 %.
        """
        self.coverage_pct = max(0, min(100, int(pct)))
        self._progress_checkpoint_at = time.time() if creep else 0.0

    def _set_progress_label(self, label: str) -> None:
        """Attach a label to the phase that is running as it is pushed.

        A label only describes the step that produced it. Left to outlive its
        phase it becomes a lie the UI repeats: the counter moves on with the
        sync while the sentence stays behind.
        """
        self.sync_progress_label = label
        self._label_phase = self.sync_phase

    def _clear_progress_label(self) -> None:
        self.sync_progress_label = ""
        self._label_phase = None

    def visible_progress_label(self) -> str:
        """What the sync is doing, in words, right now.

        A label that belongs to a phase the sync has left is dropped in favour
        of the current phase's own sentence. The host answers this question
        itself so the words and the number can never be sourced from two
        different moments of the sync.
        """
        if self.sync_progress_label and self._label_phase is self.sync_phase:
            return self.sync_progress_label
        return sync_phase_label(self.sync_phase)

    def display_progress(self, now: float) -> int:
        """Monotone UI progress: checkpoint + slow creep, capped at 98 until READY.

        Creep is +0.4 pt every 5 s since the last checkpoint, saturating at
        checkpoint+4 (and hard-capped at 98). Pure function of ``now`` for tests.

        Only the phase may lift the cap. A checkpoint of 100 used to short-
        circuit it, so any step that bumped the checkpoint to 100 before the
        seal completed showed a finished bar over an unfinished sync — the
        "Sealing snapshot… 100 %" that never moved again.
        """
        if self.sync_phase is SyncPhase.READY or self.snapshot_saved:
            return 100
        checkpoint = max(0, min(100, int(self.coverage_pct)))
        if self.sync_phase is SyncPhase.FAILED:


            return min(98, checkpoint)
        if self._progress_checkpoint_at <= 0:
            return min(98, checkpoint)
        elapsed = max(0.0, float(now) - self._progress_checkpoint_at)
        creep = min(4.0, (elapsed / 5.0) * 0.4)
        return min(98, int(checkpoint + creep))

    def _auth_event_for_loop(self) -> asyncio.Event:
        """Lazily bind auth wait to the running event loop."""
        if self._auth_event is None:
            self._auth_event = asyncio.Event()
        return self._auth_event

    async def begin_wake(self) -> None:
        async with self._lock:
            self.authenticated = False
            self.org_slug = ""
            self.workspace_id = ""
            self.project_path = ""
            self.project_id = ""
            self.project_slug = ""
            self.project_display_name = ""
            self.graph_error = ""
            self.snapshot_saved = False
            self.graph_stream_connected = False
            self.graph_bootstrap_complete = False
            self.graph_nodes_received = 0
            self.pending_auth_state = None
            self.auth_error = ""
            if self._auth_event is not None:
                self._auth_event.clear()
        await self._notify()

    async def set_pending_auth(self, state: str) -> None:
        async with self._lock:
            self.pending_auth_state = state
            self._auth_event_for_loop().clear()
        await self._notify()

    def _signal_auth_waiters(self) -> None:
        self._auth_event_for_loop().set()

    async def complete_auth(self, org_slug: str) -> None:
        async with self._lock:
            self.authenticated = True
            slug = org_slug.strip()
            self.org_slug = "" if is_opaque_id(slug) else slug
            self.workspace_id = slug
            self.pending_auth_state = None
            self.auth_error = ""
            self._signal_auth_waiters()
        await self._notify()

    async def fail_auth(self, message: str) -> None:
        async with self._lock:
            self.auth_error = message
            self._signal_auth_waiters()
        await self._notify()

    async def wait_for_auth(self, timeout_sec: float = AUTH_CALLBACK_TIMEOUT_SEC) -> None:
        try:
            await asyncio.wait_for(self._auth_event_for_loop().wait(), timeout=timeout_sec)
        except asyncio.TimeoutError as exc:
            raise RuntimeError(ApiErrorMessage.AUTH_TIMEOUT.value) from exc
        if self.auth_error:
            raise RuntimeError(self.auth_error)

    async def restore_auth(self, org_slug: str) -> None:
        async with self._lock:
            self.authenticated = True
            slug = org_slug.strip()
            self.org_slug = "" if is_opaque_id(slug) else slug
            self.workspace_id = slug
        await self._notify()

    async def set_workspace(self, workspace_id: str) -> None:
        """Pin the API workspace id. Never overwrite the human org slug with it."""
        async with self._lock:
            self.workspace_id = workspace_id.strip()
        await self._notify()

    async def set_project(
        self,
        path: str,
        slug: str = "",
        *,
        project_id: str = "",
        display_name: str = "",
    ) -> None:
        async with self._lock:
            project_changed = project_id != self.project_id or slug != self.project_slug
            self.project_path = path
            self.project_id = project_id.strip()
            self.project_slug = slug
            self.project_display_name = display_name.strip()
            if project_changed:
                self.snapshot_saved = False
                self.graph_bootstrap_complete = False
                self.graph_nodes_received = 0
                self.graph_error = ""
                self.sync_phase = None
                self.sync_session_id = ""
            workspace = self.workspace_id or self.org_slug
            if workspace:
                self.workspace_id = workspace
        await self._notify()

    async def mark_sync_start(self) -> None:
        async with self._lock:
            self.graph_error = ""
            self._bump_progress_checkpoint(0)
            self._clear_progress_label()
            self.sync_upload_mode = ""
            self.snapshot_saved = False
            self.graph_bootstrap_complete = False
            self.graph_nodes_received = 0
        await self._notify()

    async def set_sync_progress(self, pct: int, label: str = "") -> None:
        """Record one step of the sync: its number and the words for it, together.

        A step that cannot move the bar forward is a step the sync has already
        left behind, so it does not get to rename what the user is reading
        either — that split is how a counter and a label started disagreeing.
        """
        async with self._lock:
            if self.sync_phase is SyncPhase.FAILED:
                return
            target = max(0, min(100, int(pct)))
            if target < self.coverage_pct:
                return
            self._bump_progress_checkpoint(target)
            if label:
                self._set_progress_label(label)
        await self._notify()

    async def set_graph_error(self, message: str) -> None:
        """Publish an error to the dashboard — humanised, like every other one."""
        async with self._lock:
            self.graph_error = humanize_sync_error(message) if message else ""
        await self._notify()

    async def set_sync_step(self, label: str) -> None:
        """Rename the current step without moving the bar.

        For work that is happening but is not progress — waiting, retrying
        after an upstream blip. The number stays where the sync actually got
        to; only the words change.
        """
        async with self._lock:
            if self.sync_phase is SyncPhase.FAILED:
                return
            self._set_progress_label(label)
        await self._notify()

    async def mark_sync_result(self, *, saved: bool, error: str = "") -> None:
        async with self._lock:
            self.snapshot_saved = saved



            self.graph_error = humanize_sync_error(error) if error else ""
            if saved:
                self.sync_phase = SyncPhase.READY
                self._bump_progress_checkpoint(100)
                self.sync_session_id = ""
                self._clear_progress_label()
                self.sync_upload_mode = ""
            else:
                self.sync_phase = SyncPhase.FAILED
                self.sync_session_id = ""
                self.sync_upload_mode = ""




                self._bump_progress_checkpoint(0, creep=False)
                self._clear_progress_label()
        await self._notify()

    async def set_bundle_fingerprint(self, fingerprint: str) -> None:
        async with self._lock:
            self.bundle_fingerprint = fingerprint.strip()

    async def set_watch_status(self, status: str, *, error: str = "") -> None:
        """Publish the watcher's state — the error humanised, like every other one.

        Live sync fails while the user is typing, so this is the failure they
        read most; it used to reach the header as the raw exception, truncated
        to whatever fitted next to the toggle.
        """
        async with self._lock:
            self.watch_status = status
            self.watch_error = humanize_sync_error(error) if error else ""
        await self._notify()

    async def mark_watch_synced(self) -> None:
        """Records a successful live sync: back to watching, timestamp for the UI."""
        async with self._lock:
            self.watch_status = "watching"
            self.watch_error = ""
            self.last_synced_at = time.time()
        await self._notify()

    async def set_live_sync_enabled(self, enabled: bool) -> None:
        async with self._lock:
            self.live_sync_enabled = bool(enabled)
        await self._notify()

    async def set_sync_session(
        self,
        session_id: str,
        *,
        phase: SyncPhase,
        total: int,
        upload_mode: SyncUploadMode | None = None,
    ) -> None:
        async with self._lock:
            if phase in (SyncPhase.READY, SyncPhase.FAILED):
                self.sync_session_id = ""
                self.sync_upload_mode = ""
            else:
                self.sync_session_id = session_id
                if upload_mode is not None:
                    self.sync_upload_mode = upload_mode.value
            self.sync_phase = phase
            if total > 0 and self.coverage_pct == 0:
                self.coverage_pct = 0
        await self._notify()

    async def on_sync_event(self, event: dict[str, Any]) -> None:
        changed = False
        async with self._lock:
            kind = parse_sync_event_type(event.get("t"))
            if self.sync_phase is SyncPhase.FAILED and kind in _PROGRESS_EVENTS:


                return
            if kind is SyncEventType.UPLOAD_PROGRESS:
                received = int(event.get("received") or 0)
                total = int(event.get("total") or 0)
                raw = int(
                    event.get("pct")
                    or (round(received * 100 / total) if total else 0)
                )




                mapped = min(max(0, raw), SyncProgressThresholds.UPLOAD_MAX_PCT)
                if mapped > self.coverage_pct:
                    self._bump_progress_checkpoint(mapped)
                    self._set_progress_label(SyncProgressLabel.UPLOADING_FILES.value)
                    changed = True
            elif kind is SyncEventType.GRAPH_VERSION:
                self.graph_version = int(event.get("graph_version") or 0)
                changed = True
            elif kind is SyncEventType.PHASE:
                self.sync_phase = parse_sync_phase(event.get("phase")) or self.sync_phase
                if self.sync_phase is SyncPhase.READY:
                    self._bump_progress_checkpoint(100)
                if self.sync_phase in (SyncPhase.READY, SyncPhase.FAILED):
                    self.sync_session_id = ""
                    self._clear_progress_label()
                    self.sync_upload_mode = ""
                if self.sync_phase is SyncPhase.SEALING:


                    self._set_progress_label(SyncProgressLabel.SEALING.value)
                    if self.coverage_pct < SyncProgressThresholds.SEALING_MIN_PCT:
                        self._bump_progress_checkpoint(
                            SyncProgressThresholds.SEALING_MIN_PCT
                        )
                changed = True
            elif kind is SyncEventType.SEALED:
                self.sync_phase = SyncPhase.READY
                self._bump_progress_checkpoint(100)
                self.sync_session_id = ""
                self._clear_progress_label()
                self.sync_upload_mode = ""
                self.graph_version = int(event.get("graph_version") or self.graph_version)
                changed = True
            elif kind is SyncEventType.SEAL_PROGRESS:
                pct = int(event.get("pct") or 0)
                mapped = 82 + int(pct * 0.16 + 0.5)
                if mapped > self.coverage_pct:
                    self._bump_progress_checkpoint(mapped)




                if self.sync_phase not in (SyncPhase.READY, SyncPhase.FAILED):
                    self.sync_phase = SyncPhase.SEALING
                self._set_progress_label(SyncProgressLabel.SEALING.value)
                changed = True
            elif kind is SyncEventType.L2_PARTIAL:





                l2 = int(event.get("coverage_pct") or 0)
                blended = max(self.coverage_pct, sync_l2_blend_pct(l2))
                if blended > self.coverage_pct:
                    self._bump_progress_checkpoint(blended)
                if self.sync_phase is not SyncPhase.SEALING:
                    self._set_progress_label(SyncProgressLabel.RESOLVING.value)
                changed = True
            elif kind is SyncEventType.FAILED:
                self.sync_phase = SyncPhase.FAILED


                self.graph_error = sync_failure_text(
                    event.get("code"), event.get("message")
                )



                self._bump_progress_checkpoint(0, creep=False)
                self._clear_progress_label()
                changed = True
        if changed:
            await self._notify()

    async def on_graph_stream_open(self) -> None:
        async with self._lock:
            self.graph_stream_connected = True
            self.graph_bootstrap_complete = False
            self.graph_nodes_received = 0
        await self._notify()

    async def on_graph_stream_close(self) -> None:
        async with self._lock:
            self.graph_stream_connected = False
        await self._notify()

    async def on_graph_message(self, parsed: dict[str, Any]) -> None:
        """Tally what the proxy relays, as a sign of life — not as a node count.

        This counts ids on the wire: a node re-sent by a delta is counted
        twice, a removed one is never subtracted, and the tally restarts with
        each socket. The viewer counts the distinct nodes it has drawn, which
        is the only number fit to show a person ("702 of 727 nodes"). What this
        one answers is narrower and always true: did anything arrive at all.
        """
        changed = False
        async with self._lock:
            msg_type = parse_graph_message_type(parsed.get("t"))
            if msg_type is GraphStreamInboundType.NODES:
                batch = parsed.get("batch") or {}
                self.graph_nodes_received += len(batch.get("ids") or [])
                changed = True
            elif msg_type is GraphStreamInboundType.GRAPH_DELTA:
                ops = parsed.get("ops") or []
                added = sum(
                    1
                    for op in ops
                    if parse_graph_delta_op(op.get("op")) is GraphDeltaOp.ADD_NODE
                )
                if added:
                    self.graph_nodes_received += added
                    changed = True
            elif msg_type is GraphStreamInboundType.COMPLETE:
                if parse_graph_stream_phase(parsed.get("phase")) is GraphStreamPhase.BOOTSTRAP:
                    self.graph_bootstrap_complete = True
                    changed = True
        if changed:
            await self._notify()

    def snapshot(self, creds: StoredCredentials | None = None) -> SessionSnapshot:
        creds = creds or load_credentials()
        org_slug = human_org_label(self.org_slug, creds.org_slug)
        workspace_id = self.workspace_id or org_slug
        authenticated = self.authenticated or bool(creds.token)
        return SessionSnapshot(
            authenticated=authenticated,
            org_slug=org_slug,
            org_name=org_slug,
            workspace_id=workspace_id,
            app_version=__version__,
            account_url=f"{Settings().app_url.rstrip('/')}/app/account",
            support_url=f"{Settings().app_url.rstrip('/')}/app/overview?support=1",
            project_path=self.project_path,
            project_id=self.project_id,
            project_slug=self.project_slug,
            project_display_name=self.project_display_name,
            snapshot_saved=self.snapshot_saved,
            graph_error=self.graph_error,
            graph_stream_available=self.snapshot_saved or self.graph_stream_connected,
            graph_bootstrap_complete=self.graph_bootstrap_complete,
            graph_nodes_received=self.graph_nodes_received,
            sync_phase=_phase_to_wire(self.sync_phase),
            sync_session_id=self.sync_session_id,
            graph_version=self.graph_version,
            coverage_pct=self.display_progress(time.time()),
            sync_progress_label=self.visible_progress_label(),
            sync_upload_mode=self.sync_upload_mode,
            live_sync_enabled=self.live_sync_enabled,
            watch_status=self.watch_status,
            watch_error=self.watch_error,
            last_synced_at=self.last_synced_at,
        )

    def subscribe(self) -> asyncio.Queue[SessionSnapshot | None]:
        queue: asyncio.Queue[SessionSnapshot | None] = asyncio.Queue(maxsize=8)
        self._listeners.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[SessionSnapshot | None]) -> None:
        if queue in self._listeners:
            self._listeners.remove(queue)

    async def _notify(self) -> None:
        snap = self.snapshot()
        dead: list[asyncio.Queue[SessionSnapshot | None]] = []
        for queue in self._listeners:
            try:
                queue.put_nowait(snap)
            except asyncio.QueueFull:
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
                try:
                    queue.put_nowait(snap)
                except asyncio.QueueFull:
                    dead.append(queue)
        for queue in dead:
            self.unsubscribe(queue)


_STORE: SessionStore | None = None


def get_session_store() -> SessionStore:
    global _STORE
    if _STORE is None:
        _STORE = SessionStore()
    return _STORE
