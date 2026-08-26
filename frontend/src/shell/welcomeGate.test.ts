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

import { detectVoice, getVoice, isVoice, setVoice } from "../i18n";
import { dismissWelcome, shouldShowWelcome, WELCOME_FLAG, type KVStore } from "./welcomeGate";
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
function memoryStore(): KVStore & {
    data: Map<string, string>;
} {
    const data = new Map<string, string>();
    return {
        data,
        getItem: (k) => data.get(k) ?? null,
        setItem: (k, v) => void data.set(k, v),
    };
}
{
    const store = memoryStore();
    check("first launch shows the overlay", shouldShowWelcome(store));
    dismissWelcome(store);
    check("flag persisted", store.data.get(WELCOME_FLAG) === "1");
    check("never shows again", !shouldShowWelcome(store));
}
{
    const broken: KVStore = {
        getItem: () => {
            throw new Error("storage unavailable");
        },
        setItem: () => {
            throw new Error("storage unavailable");
        },
    };
    check("broken storage hides the overlay", !shouldShowWelcome(broken));
    let threw = false;
    try {
        dismissWelcome(broken);
    }
    catch {
        threw = true;
    }
    check("dismiss never throws", !threw);
}
check("voice defaults to simple", detectVoice() === "simple");
check("isVoice accepts simple", isVoice("simple"));
check("isVoice accepts technical", isVoice("technical"));
check("isVoice rejects junk", !isVoice("expert"));
setVoice("technical");
check("setVoice switches in-session state", getVoice() === "technical");
setVoice("simple");
check("setVoice switches back", getVoice() === "simple");
if (failures > 0) {
    console.error(`${failures} welcomeGate test(s) failed`);
    process.exit(1);
}
console.log("welcomeGate tests passed");
