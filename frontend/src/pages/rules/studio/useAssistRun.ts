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

import { useCallback, useEffect, useRef } from "react";
import { streamAssistRules } from "../../../api/assistProxy";
import { useStudioStore } from "./studioStore";
export function useAssistRun() {
    const abortRef = useRef<AbortController | null>(null);
    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);
    const start = useCallback(async () => {
        const { prompt, contextSeed, status, begin, append, finish } = useStudioStore.getState();
        if (status === "running" || !prompt.trim())
            return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        begin();
        let finalStatus: "done" | "failed" = "done";
        let failureReason: string | undefined;
        try {
            await streamAssistRules({
                prompt: prompt.trim(),
                context_seed: contextSeed ?? undefined,
            }, (event) => {
                append(event);
                if (event.event === "final" && event.data.status === "failed") {
                    finalStatus = "failed";
                    failureReason = event.data.reason;
                }
            }, controller.signal);
            finish(finalStatus, failureReason);
        }
        catch (err) {
            if (controller.signal.aborted) {
                useStudioStore.getState().reset();
                return;
            }
            finish("failed", err instanceof Error ? err.message : String(err));
        }
    }, []);
    const cancel = useCallback(() => {
        abortRef.current?.abort();
    }, []);
    return { start, cancel };
}
