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

import { CONNECTION_LOST, FAILURE_REPORT_HINT, GRAPH_NOT_DRAWN, NO_SNAPSHOT_YET, SESSION_UNREADABLE, VIEWER_FAILURE_UNNAMED, graphNotDrawnNotice, graphStreamErrorNotice, sessionUnreadableNotice, } from './wire/graphSessionPolicy.mjs';
import { GraphStreamErrorCode } from './wire/graphStream.mjs';
let failures = 0;
function check(name, cond) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
{
    const notice = graphStreamErrorNotice({
        t: 'error',
        code: GraphStreamErrorCode.GRAPH_UNAVAILABLE,
        message: 'graph unavailable for project pokedex',
    });
    check('an unbuilt graph never mentions docker', !/docker/i.test(notice.text));
    check('an unbuilt graph says what to do instead', /run a sync/i.test(notice.text));
    check('an unbuilt graph is not dressed up as an error', notice.kind === 'warn');
    check('an unbuilt graph offers a sync from the same chip', notice.action === 'sync');
    check('the same situation reads the same wherever it is noticed', notice.text === NO_SNAPSHOT_YET);
    check('the wire message stays out of it', !notice.text.includes('graph unavailable for project pokedex'));
}
{
    const notice = graphStreamErrorNotice({
        code: GraphStreamErrorCode.PROXY_FAILED,
        message: "[Errno 61] Connection refused: ws://127.0.0.1:4040/ws/graph",
    });
    check('a dead relay reads as a lost connection', notice.text === CONNECTION_LOST);
    check('no errno on screen', !/Errno/.test(notice.text));
    check('no internal address on screen', !notice.text.includes('127.0.0.1'));
    check('a blip the client is retrying is not red', notice.kind === 'warn');
}
{
    const notice = graphStreamErrorNotice({
        code: GraphStreamErrorCode.SOCKET_ERROR,
        message: 'WebSocket error',
    });
    check('a socket error reads as a lost connection too', notice.text === CONNECTION_LOST);
    check('the word WebSocket never reaches the user', !/WebSocket/i.test(notice.text));
}
{
    const notice = graphStreamErrorNotice({
        code: GraphStreamErrorCode.HANDLER_FAILED,
        message: "viewer handler failed on 'nodes': Cannot read properties of undefined",
    });
    check('an unnamed failure admits it', notice.text.startsWith(VIEWER_FAILURE_UNNAMED));
    check('an unnamed failure invents no cause', !/connection|sync|docker/i.test(notice.text));
    check('the detail survives, labelled as something to send us', notice.text.includes(FAILURE_REPORT_HINT) &&
        notice.text.includes('Cannot read properties of undefined'));
}
{
    const notice = graphStreamErrorNotice({ code: 'quota_exceeded', message: 'E_QUOTA' });
    check('an unknown code still gets a sentence', notice.text.startsWith(VIEWER_FAILURE_UNNAMED));
    check('an unknown code keeps its detail', notice.text.includes('E_QUOTA'));
}
{
    const notice = graphStreamErrorNotice({ code: 'constructor', message: 'x' });
    check('a prototype key is not a known code', notice.text.startsWith(VIEWER_FAILURE_UNNAMED));
    check('a prototype key still yields a string', typeof notice.text === 'string');
}
{
    const notice = graphStreamErrorNotice({ code: 'bad_json' });
    check('no detail means no dangling colon', !notice.text.includes(FAILURE_REPORT_HINT));
    check('no detail still says something', notice.text === VIEWER_FAILURE_UNNAMED);
    const empty = graphStreamErrorNotice(null);
    check('a missing message object does not crash', empty.text === VIEWER_FAILURE_UNNAMED);
    const useless = graphStreamErrorNotice({ code: 'x', message: {} });
    check('"[object Object]" is never shown', !useless.text.includes('[object Object]'));
}
{
    const long = 'x'.repeat(500);
    const notice = graphStreamErrorNotice({ code: 'x', message: long });
    check('a long detail is bounded', notice.text.length < 400);
    check('a bounded detail says it was cut', notice.text.endsWith('…'));
}
{
    const notice = graphNotDrawnNotice(new Error('worker terminated'));
    check('a failed layout is not called a layout', !/layout/i.test(notice.text));
    check('a failed layout says what the user lost', notice.text.startsWith(GRAPH_NOT_DRAWN));
    check('a failed layout keeps the cause reportable', notice.text.includes('worker terminated'));
    check('a failed layout is an error', notice.kind === 'err');
}
{
    const notice = sessionUnreadableNotice(new TypeError('Failed to fetch'));
    check('a dead local client is named as such', notice.text.startsWith(SESSION_UNREADABLE));
    check('a dead local client says what to check', /still running/.test(notice.text));
    check('a dead local client keeps the cause', notice.text.includes('Failed to fetch'));
}
if (failures > 0) {
    console.error(`${failures} viewer notice test(s) failed`);
    process.exit(1);
}
console.log('viewer notice tests passed');
