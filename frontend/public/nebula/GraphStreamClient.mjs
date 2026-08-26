/**
 * Copyright 2026 Polymerix
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GraphStreamDefaults, GraphStreamErrorCode, GraphStreamInboundType, GraphStreamOutboundType, GraphStreamPhase, } from './wire/graphStream.mjs';
const PROTOCOL_VERSION = GraphStreamDefaults.PROTOCOL_VERSION;
const VIEW_DEBOUNCE_MS = GraphStreamDefaults.VIEW_DEBOUNCE_MS;
const DEFAULT_MAX_NODES = GraphStreamDefaults.DEFAULT_MAX_NODES;
const DEFAULT_MAX_EDGES = GraphStreamDefaults.DEFAULT_MAX_EDGES;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 4000;
const MAX_RECONNECT_ATTEMPTS = 5;
export class GraphStreamClient {
    constructor(url, handlers = {}) {
        this.url = url;
        this.handlers = handlers;
        this.ws = null;
        this.bootstrapComplete = false;
        this.viewSeq = 0;
        this._viewTimer = null;
        this._pendingVisible = null;
        this._scope = null;
        this._intentionalClose = false;
        this._reconnectAttempt = 0;
        this._reconnectTimer = null;
    }
    connect(scope) {
        this._scope = scope;
        this._intentionalClose = false;
        this._clearReconnectTimer();
        this._openSocket();
    }
    close() {
        this._intentionalClose = true;
        this._clearReconnectTimer();
        if (this._viewTimer)
            clearTimeout(this._viewTimer);
        this.ws?.close();
        this.ws = null;
    }
    forceReconnect() {
        this._intentionalClose = false;
        this.bootstrapComplete = false;
        this._reconnectAttempt = 0;
        this._clearReconnectTimer();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        else if (this._scope) {
            this._openSocket();
        }
    }
    sendView(visibleIds) {
        if (!this.bootstrapComplete || !this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        this._pendingVisible = visibleIds;
        if (this._viewTimer)
            clearTimeout(this._viewTimer);
        this._viewTimer = setTimeout(() => {
            this._viewTimer = null;
            const ids = this._pendingVisible ?? [];
            this._pendingVisible = null;
            this.viewSeq += 1;
            this._send({
                t: GraphStreamOutboundType.VIEW,
                seq: this.viewSeq,
                visible_ids: ids,
                hop: 1,
                max_nodes: DEFAULT_MAX_NODES,
                max_edges: DEFAULT_MAX_EDGES,
            });
        }, VIEW_DEBOUNCE_MS);
    }
    _clearReconnectTimer() {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }
    _openSocket() {
        if (this._intentionalClose || !this._scope)
            return;
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            this._reconnectAttempt = 0;
            this.handlers.onConnection?.(true);
            const scope = this._scope;
            if (!scope)
                return;
            const hello = {
                t: GraphStreamOutboundType.HELLO,
                v: PROTOCOL_VERSION,
                workspace: scope.workspace,
                project_slug: scope.project_slug,
                ...(scope.sync_session_id
                    ? {
                        sync_session_id: scope.sync_session_id,
                        resume_from_version: GraphStreamDefaults.RESUME_FROM_VERSION,
                    }
                    : {}),
            };
            this._send(hello);
        };
        this.ws.onclose = () => {
            this.ws = null;
            this.handlers.onConnection?.(false);
            if (!this._intentionalClose)
                this._scheduleReconnect();
        };
        this.ws.onerror = () => {
            this.handlers.onError?.({
                t: GraphStreamInboundType.ERROR,
                code: GraphStreamErrorCode.SOCKET_ERROR,
                message: 'WebSocket error',
            });
        };
        this.ws.onmessage = (ev) => {
            let msg;
            try {
                msg = JSON.parse(String(ev.data));
            }
            catch {
                this.handlers.onError?.({
                    t: GraphStreamInboundType.ERROR,
                    code: GraphStreamErrorCode.BAD_JSON,
                    message: 'Invalid server JSON',
                });
                return;
            }
            this._dispatch(msg);
        };
    }
    _scheduleReconnect() {
        if (!this._scope)
            return;
        if (this._reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
            this.handlers.onReconnectGaveUp?.(MAX_RECONNECT_ATTEMPTS);
            return;
        }
        this._reconnectAttempt += 1;
        this.bootstrapComplete = false;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** (this._reconnectAttempt - 1), RECONNECT_MAX_MS);
        this.handlers.onReconnecting?.(this._reconnectAttempt, MAX_RECONNECT_ATTEMPTS);
        this._reconnectTimer = setTimeout(() => {
            this._reconnectTimer = null;
            if (!this._intentionalClose && this._scope)
                this._openSocket();
        }, delay);
    }
    _send(obj) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(obj));
        }
    }
    _dispatch(msg) {
        try {
            this._dispatchInner(msg);
        }
        catch (err) {
            console.error('graph stream handler failed:', msg?.t, err);
            this.handlers.onError?.({
                t: GraphStreamInboundType.ERROR,
                code: GraphStreamErrorCode.HANDLER_FAILED,
                message: `viewer handler failed on '${msg?.t}': ${err?.message || err}`,
            });
        }
    }
    _dispatchInner(msg) {
        switch (msg?.t) {
            case GraphStreamInboundType.READY:
                this.handlers.onReady?.(msg);
                break;
            case GraphStreamInboundType.NODES:
                this.handlers.onNodes?.(msg);
                break;
            case GraphStreamInboundType.EDGES:
                this.handlers.onEdges?.(msg);
                break;
            case GraphStreamInboundType.VIEW_DELTA:
                this.handlers.onViewDelta?.(msg);
                break;
            case GraphStreamInboundType.GRAPH_DELTA:
                this.handlers.onGraphDelta?.(msg);
                break;
            case GraphStreamInboundType.GRAPH_UPGRADED:
                this.handlers.onGraphUpgraded?.(msg);
                break;
            case GraphStreamInboundType.COMPLETE:
                if (msg.phase === GraphStreamPhase.BOOTSTRAP)
                    this.bootstrapComplete = true;
                this.handlers.onComplete?.(msg);
                break;
            case GraphStreamInboundType.ERROR:
                this.handlers.onError?.(msg);
                break;
            default:
                break;
        }
    }
}
