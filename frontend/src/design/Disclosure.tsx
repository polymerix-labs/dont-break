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

import { useId, useState } from "react";
import { cn } from "./cn";
export function Disclosure({ summary, children, defaultOpen = false, maxBodyHeight = "max-h-[45vh]", className, bodyClassName, "data-testid": testId, }: {
    summary: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    maxBodyHeight?: string;
    className?: string;
    bodyClassName?: string;
    "data-testid"?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const bodyId = useId();
    return (<div className={cn("min-w-0", className)} data-testid={testId}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open} aria-controls={bodyId} className="flex w-full items-center justify-between gap-3 rounded py-1.5 text-left transition-colors duration-fast hover:text-foreground">
        <span className="min-w-0 text-[11px] text-muted">{summary}</span>
        <span aria-hidden className={cn("shrink-0 text-[10px] text-faint transition-transform duration-fast", open && "rotate-180")}>
          {"▼"}
        </span>
      </button>
      {open ? (<div id={bodyId} className={cn("overflow-y-auto border-t border-line pt-3", maxBodyHeight, bodyClassName)}>
          {children}
        </div>) : null}
    </div>);
}
