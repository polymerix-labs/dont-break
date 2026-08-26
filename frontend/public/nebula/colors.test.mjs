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

import { adaptiveEdgeOpacity, groupColor, isHoverFocusNode, isHoverFocusEdge, } from './colors.mjs';
import { communityKey, assignGroups } from './GraphData.mjs';
let failures = 0;
function check(label, ok, extra = '') {
    const mark = ok ? 'ok' : 'FAIL';
    if (!ok)
        failures += 1;
    console.log(`${mark} ${label}${extra ? ` ${extra}` : ''}`);
}
{
    check('adaptiveEdgeOpacity empty → max', adaptiveEdgeOpacity(0) === 0.35);
    check('adaptiveEdgeOpacity tiny graph at max', adaptiveEdgeOpacity(100) === 0.35);
    const mid = adaptiveEdgeOpacity(20000);
    const denser = adaptiveEdgeOpacity(100000);
    check('adaptiveEdgeOpacity decreases with density', denser < mid && mid < 0.35);
    check('adaptiveEdgeOpacity floor', adaptiveEdgeOpacity(1e9) === 0.06);
    const expected100k = Math.max(0.06, Math.min(0.35, 40 / Math.sqrt(100000)));
    check('adaptiveEdgeOpacity formula at E=100000', Math.abs(adaptiveEdgeOpacity(100000) - expected100k) < 1e-9);
}
{
    const a = groupColor(0);
    const b = groupColor(0);
    check('groupColor stable', a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
    const c1 = groupColor(1);
    const c7 = groupColor(7);
    const dist = Math.abs(c1[0] - c7[0]) + Math.abs(c1[1] - c7[1]) + Math.abs(c1[2] - c7[2]);
    check('groupColor distinct across ids', dist > 0.2);
    check('groupColor in 0..1', a.every((v) => v >= 0 && v <= 1) && c1.every((v) => v >= 0 && v <= 1));
}
{
    const adj = [[1, 2], [0], [0, 3], [2]];
    check('hover focus all lit when null', isHoverFocusNode(null, adj, 3) === true);
    check('hover focus self lit', isHoverFocusNode(0, adj, 0) === true);
    check('hover focus neighbour lit', isHoverFocusNode(0, adj, 1) === true);
    check('hover focus far node dimmed', isHoverFocusNode(0, adj, 3) === false);
    check('hover edge self', isHoverFocusEdge(0, 0, 1) === true);
    check('hover edge far', isHoverFocusEdge(0, 2, 3) === false);
    check('hover edge all when null', isHoverFocusEdge(null, 2, 3) === true);
}
{
    check('communityKey dotted fqn drops symbol, caps prefix', communityKey({ fqn: 'com.skydoves.pokedex.core.network.service.PokedexClient.fetchPokemonInfo' }) ===
        'com.skydoves.pokedex.core.network');
    check('communityKey external lib groups by package', communityKey({ fqn: 'androidx.lifecycle.Lifecycle' }) === 'androidx.lifecycle');
    check('communityKey JVM file path joins its package', communityKey({ fqn: 'app/src/main/kotlin/com/skydoves/pokedex/ui/main/presentation/PokemonAdapter.kt' }) ===
        'com.skydoves.pokedex.ui.main');
    check('communityKey plain file path groups by directory', communityKey({ fqn: 'src/pokedex/api.py' }) === 'src/pokedex');
    check('communityKey metadata wins over fqn', communityKey({ metadata: { relative_path: 'src/app/main.py' }, fqn: 'a.b.c' }) === 'src/app');
    check('communityKey fallback', communityKey({}) === 'misc');
}
{
    const nodes = [
        { fqn: 'com.a.x.One' },
        { fqn: 'com.a.x.Two' },
        { fqn: 'com.b.y.Three' },
        { fqn: 'com.c.z.Four' },
    ];
    const { groupId, groupCount } = assignGroups(nodes);
    check('assignGroups counts used communities', groupCount === 3);
    check('assignGroups ids stay below groupCount', Array.from(groupId).every((g) => g >= 0 && g < groupCount));
    check('assignGroups same community shares id', groupId[0] === groupId[1]);
    check('assignGroups distinct communities differ', groupId[1] !== groupId[2]);
}
if (failures > 0) {
    console.error(`${failures} colors test(s) failed`);
    process.exit(1);
}
console.log('colors tests passed');
