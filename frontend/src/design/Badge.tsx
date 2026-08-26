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

import type { ReactNode } from "react";
import { cn } from "./cn";
export type BadgeTone = "neutral" | "primary" | "ok" | "warn" | "danger" | "zone-core" | "zone-halo";
const TONE: Record<BadgeTone, string> = {
    neutral: "bg-overlay text-muted",
    primary: "bg-primary-subtle text-primary",
    ok: "bg-ok-subtle text-ok",
    warn: "bg-warn-subtle text-warn",
    danger: "bg-danger-subtle text-danger",
    "zone-core": "bg-zone-core-subtle text-zone-core",
    "zone-halo": "bg-zone-halo-subtle text-zone-halo",
};
export function Badge({ tone = "neutral", children, className, }: {
    tone?: BadgeTone;
    children: ReactNode;
    className?: string;
}) {
    return (<span className={cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-px text-xs font-medium", TONE[tone], className)}>
      {children}
    </span>);
}
export function verdictTone(verdict: string): BadgeTone {
    if (verdict === "ok" || verdict === "healthy")
        return "ok";
    if (verdict === "warn" || verdict === "caution")
        return "warn";
    if (verdict === "block" || verdict === "critical")
        return "danger";
    return "neutral";
}
