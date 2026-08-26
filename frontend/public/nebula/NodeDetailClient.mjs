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

export async function fetchNodeDetail(nodeId, layers = 'arch,cfg,resolved') {
    const url = `/nebula/nodes/${encodeURIComponent(nodeId)}/detail?layers=${encodeURIComponent(layers)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) {
        throw new Error('Node not found in snapshot index');
    }
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}
export async function fetchViewerMeta() {
    try {
        const res = await fetch('/nebula/snapshot/meta', { cache: 'no-store' });
        if (!res.ok)
            return null;
        return res.json();
    }
    catch {
        return null;
    }
}
