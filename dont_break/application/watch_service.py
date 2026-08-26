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

"""Filesystem watcher driving live incremental sync.

Watches the linked project folder and turns bursts of file events into at most one
delta sync at a time:

- **debounce + coalescing**: events are absorbed until the tree settles (editors save
  atomically as create+rename; both collapse into one relative path);
- **single-flight + one-pending**: changes arriving during a sync accumulate into the
  next (single) batch;
- **minimum interval** between sync starts, to stay well under gateway rate limits;
- **burst guard**: past `WatchTuning.BURST_HINT_LIMIT` changed files (branch checkout),
  the per-path hint is dropped and the sync's stat heuristic + delta threshold decide;
- **backoff**: network failures retry exponentially, the pending batch is kept.

The watcher filters events with the exact same rules as `_discover_source_files`, so it
can never sync a file the manifest would not contain.
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
import time
from pathlib import Path
from typing import Any, AsyncIterator, Awaitable, Callable, Iterable, Optional, Set

from dont_break.application.session_store import SessionStore
from dont_break.application.sync_service import (
    _DISCOVER_EXCLUDED_DIRS,
    _DISCOVER_EXTENSIONS,
)
from dont_break.domain.wire import (
    WATCH_FAILURE_STOPPED,
    WatchStatus,
    WatchTuning,
    humanize_sync_exception,
)

logger = logging.getLogger(__name__)


SyncRunner = Callable[[Optional[Set[str]]], Awaitable[Any]]

WatchFactory = Callable[[Path, "asyncio.Event"], AsyncIterator[Iterable[Any]]]


def _default_watch_factory(repo_root: Path, stop_event: asyncio.Event):
    from watchfiles import awatch

    return awatch(
        repo_root,
        stop_event=stop_event,
        debounce=WatchTuning.DEBOUNCE_MS,
        recursive=True,
    )


def filter_changed_paths(repo_root: Path, changes: Iterable[Any]) -> set[str]:
    """Maps raw watch events to repo-relative source paths the sync pipeline cares about.

    Accepts watchfiles tuples ``(Change, path)`` or bare path strings. Deletions pass
    through on purpose: a deleted file must trigger a sync so the next manifest omits it
    and the seal rebuilds the graph without its nodes.
    """
    out: set[str] = set()
    root = repo_root.resolve()
    for item in changes:
        raw = item[1] if isinstance(item, tuple) and len(item) >= 2 else str(item)
        try:
            rel = Path(raw).resolve().relative_to(root)
        except (OSError, ValueError):
            continue
        if any(part in _DISCOVER_EXCLUDED_DIRS for part in rel.parts):
            continue
        if rel.suffix.lower() not in _DISCOVER_EXTENSIONS:
            continue
        out.add(rel.as_posix())
    return out


class WatchService:
    """Owns the watch task for the currently linked project folder."""

    def __init__(
        self,
        store: SessionStore,
        sync_runner: SyncRunner,
        *,
        watch_factory: WatchFactory | None = None,
        debounce_ms: float | None = None,
        min_interval_s: float | None = None,
        burst_hint_limit: int | None = None,
        backoff_base_s: float | None = None,
        backoff_max_s: float | None = None,
    ) -> None:
        self._store = store
        self._sync_runner = sync_runner
        self._watch_factory = watch_factory or _default_watch_factory
        self._debounce_s = (
            debounce_ms if debounce_ms is not None else WatchTuning.DEBOUNCE_MS
        ) / 1000.0
        self._min_interval_s = (
            min_interval_s if min_interval_s is not None else WatchTuning.MIN_SYNC_INTERVAL_S
        )
        self._burst_hint_limit = (
            burst_hint_limit if burst_hint_limit is not None else WatchTuning.BURST_HINT_LIMIT
        )
        self._backoff_base_s = (
            backoff_base_s if backoff_base_s is not None else WatchTuning.BACKOFF_BASE_S
        )
        self._backoff_max_s = (
            backoff_max_s if backoff_max_s is not None else WatchTuning.BACKOFF_MAX_S
        )
        self.repo_root: Path | None = None
        self.sync_count = 0
        self._task: asyncio.Task | None = None
        self._stop_event: asyncio.Event | None = None
        self._dirty: asyncio.Event | None = None
        self._pending: set[str] = set()
        self._pending_full = False
        self._last_sync_start = 0.0

    @property
    def running(self) -> bool:
        return self._task is not None and not self._task.done()

    async def start(self, repo_root: Path) -> None:
        await self.stop()
        self.repo_root = Path(repo_root).resolve()
        self._stop_event = asyncio.Event()
        self._dirty = asyncio.Event()
        self._pending = set()
        self._pending_full = False
        self._task = asyncio.create_task(self._run())
        await self._store.set_watch_status(WatchStatus.WATCHING.value)
        logger.info("live sync watching %s", self.repo_root)

    async def stop(self) -> None:
        if self._stop_event is not None:
            self._stop_event.set()
        task, self._task = self._task, None
        if task is not None:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
            await self._store.set_watch_status("")

    async def _run(self) -> None:
        collector = asyncio.create_task(self._collect())
        try:
            await self._schedule()
        finally:
            collector.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await collector

    async def _collect(self) -> None:
        assert self.repo_root is not None and self._stop_event is not None
        try:
            async for changes in self._watch_factory(self.repo_root, self._stop_event):
                filtered = filter_changed_paths(self.repo_root, changes)
                if not filtered:
                    continue
                self._absorb(filtered)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("filesystem watcher crashed; live sync paused")



            await self._store.set_watch_status(
                WatchStatus.ERROR.value, error=WATCH_FAILURE_STOPPED
            )

    def _absorb(self, filtered: set[str]) -> None:
        assert self._dirty is not None
        if self._pending_full:
            pass
        else:
            self._pending |= filtered
            if len(self._pending) > self._burst_hint_limit:
                self._pending_full = True
                self._pending.clear()
        self._dirty.set()

    def _take_batch(self) -> tuple[set[str], bool]:
        batch, full = set(self._pending), self._pending_full
        self._pending.clear()
        self._pending_full = False
        return batch, full

    async def _schedule(self) -> None:
        assert self._stop_event is not None and self._dirty is not None
        backoff = self._backoff_base_s
        while not self._stop_event.is_set():
            await self._wait_dirty_or_stop()
            if self._stop_event.is_set():
                return

            while True:
                self._dirty.clear()
                if not await self._wait_dirty(self._debounce_s):
                    break

            wait = self._min_interval_s - (time.monotonic() - self._last_sync_start)
            if wait > 0:
                await self._interruptible_sleep(wait)
            if self._stop_event.is_set():
                return
            batch, full = self._take_batch()
            if not batch and not full:
                continue
            self._last_sync_start = time.monotonic()
            await self._store.set_watch_status(WatchStatus.SYNCING.value)
            try:
                await self._sync_runner(None if full else batch)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                logger.warning("live sync failed (will retry): %s", exc)

                if full:
                    self._pending_full = True
                    self._pending.clear()
                elif not self._pending_full:
                    self._pending |= batch
                self._dirty.set()
                await self._store.set_watch_status(
                    WatchStatus.ERROR.value, error=humanize_sync_exception(exc)
                )
                await self._interruptible_sleep(backoff)
                backoff = min(backoff * 2, self._backoff_max_s)
                continue
            backoff = self._backoff_base_s
            self.sync_count += 1
            await self._store.mark_watch_synced()

    async def _wait_dirty_or_stop(self) -> None:
        assert self._stop_event is not None and self._dirty is not None
        stop_t = asyncio.ensure_future(self._stop_event.wait())
        dirty_t = asyncio.ensure_future(self._dirty.wait())
        try:
            await asyncio.wait({stop_t, dirty_t}, return_when=asyncio.FIRST_COMPLETED)
        finally:
            for t in (stop_t, dirty_t):
                t.cancel()

    async def _wait_dirty(self, timeout: float) -> bool:
        assert self._dirty is not None
        try:
            await asyncio.wait_for(self._dirty.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            return False

    async def _interruptible_sleep(self, seconds: float) -> None:
        assert self._stop_event is not None
        with contextlib.suppress(asyncio.TimeoutError):
            await asyncio.wait_for(self._stop_event.wait(), timeout=seconds)
