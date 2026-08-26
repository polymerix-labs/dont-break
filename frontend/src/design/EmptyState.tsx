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
export function EmptyState({ title, detail, action, className, }: {
    title: string;
    detail?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (<div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-10 text-center", className)}>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {detail ? <p className="mt-1 max-w-sm text-xs text-muted">{detail}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>);
}
