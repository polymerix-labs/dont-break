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

const timers = [];
globalThis.setTimeout = (fn) => {
    timers.push(fn);
    return timers.length;
};
globalThis.clearTimeout = () => { };
class FakeSocket {
    constructor() {
        FakeSocket.opened.push(this);
        this.readyState = 0;
    }
    send() { }
    close() { }
}
FakeSocket.opened = [];
globalThis.WebSocket = FakeSocket;
const { GraphStreamClient } = await import('./GraphStreamClient.mjs');
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
const events = [];
const budgets = [];
const client = new GraphStreamClient('ws://local/ws/graph', {
    onConnection: (connected) => events.push(`connection:${connected}`),
    onReconnecting: (attempt, maxAttempts) => {
        budgets.push(maxAttempts);
        events.push(`reconnecting:${attempt}`);
    },
    onReconnectGaveUp: (attempts) => events.push(`gave-up:${attempts}`),
});
client.connect({ workspace: 'labs', project_slug: 'pokedex' });
for (let i = 0; i < 8; i++) {
    FakeSocket.opened[FakeSocket.opened.length - 1].onclose?.();
    for (const run of timers.splice(0))
        run();
}
const reconnecting = events.filter((e) => e.startsWith('reconnecting:'));
const gaveUp = events.filter((e) => e.startsWith('gave-up:'));
check('it does retry, and a bounded number of times', reconnecting.length === 5);
check('the attempts are counted for the user, in order', reconnecting.join() === 'reconnecting:1,reconnecting:2,reconnecting:3,reconnecting:4,reconnecting:5');
check('the retry budget travels with the attempt, so nothing hardcodes it', budgets.length === 5 && budgets.every((max) => max === 5));
check('it says out loud that it has stopped', gaveUp.length >= 1);
check('and it says how many attempts it made', gaveUp[0] === 'gave-up:5');
check('giving up is the last thing it announces', events.lastIndexOf('reconnecting:5') < events.indexOf('gave-up:5'));
check('no attempt is announced after giving up', events.slice(events.indexOf('gave-up:5')).every((e) => !e.startsWith('reconnecting:')));
check('and no further socket is opened', FakeSocket.opened.length === 6);
{
    const quiet = [];
    const closing = new GraphStreamClient('ws://local/ws/graph', {
        onReconnecting: (a) => quiet.push(`reconnecting:${a}`),
        onReconnectGaveUp: () => quiet.push('gave-up'),
    });
    closing.connect({ workspace: 'labs', project_slug: 'pokedex' });
    closing.close();
    FakeSocket.opened[FakeSocket.opened.length - 1].onclose?.();
    for (const run of timers.splice(0))
        run();
    check('closing the viewer on purpose announces nothing', quiet.length === 0);
}
if (failures > 0) {
    console.error(`${failures} graph stream reconnect test(s) failed`);
    process.exit(1);
}
console.log('graph stream reconnect tests passed');
