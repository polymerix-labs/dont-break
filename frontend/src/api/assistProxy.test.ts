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

import { parseSseChunk, type AssistEvent } from "./assistProxy";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
{
    const events: AssistEvent[] = [];
    const rest = parseSseChunk('event: run_started\ndata: {"run_id":"r1","provider":"scripted"}\n\n' +
        'event: stage\ndata: {"stage":"planning"}\n\n', (e) => events.push(e));
    check("two frames parsed", events.length === 2);
    check("event names ordered", events[0].event === "run_started" && events[1].event === "stage");
    check("payload decoded", events[0].event === "run_started" && events[0].data.run_id === "r1");
    check("buffer drained", rest === "");
}
{
    const events: AssistEvent[] = [];
    const rest = parseSseChunk('event: stage\ndata: {"stage":"draft"}\n\nevent: draft\ndata: {"ru', (e) => events.push(e));
    check("complete frame emitted", events.length === 1);
    check("partial frame kept", rest === 'event: draft\ndata: {"ru');
    const events2: AssistEvent[] = [];
    const rest2 = parseSseChunk(rest + 'le":{}}\n\n', (e) => events2.push(e));
    check("resumed frame emitted", events2.length === 1 && events2[0].event === "draft");
    check("buffer drained after resume", rest2 === "");
}
{
    const events: AssistEvent[] = [];
    parseSseChunk("event: broken\ndata: {nope\n\n" + 'event: final\ndata: {"status":"draft_ready"}\n\n', (e) => events.push(e));
    check("malformed skipped", events.length === 1);
    check("stream continues", events[0].event === "final");
}
{
    const events: AssistEvent[] = [];
    parseSseChunk('data: {"orphan":true}\n\nevent: nameless\n\n', (e) => events.push(e));
    check("unnamed and dataless frames ignored", events.length === 0);
}
{
    const events: AssistEvent[] = [];
    parseSseChunk('event: stage\ndata: {"stage":\ndata: "simulation"}\n\n', (e) => events.push(e));
    check("multi-line data joined", events.length === 1 && events[0].event === "stage" && events[0].data.stage === "simulation");
}
if (failures > 0) {
    console.error(`${failures} assistProxy test(s) failed`);
    process.exit(1);
}
console.log("assistProxy tests passed");
