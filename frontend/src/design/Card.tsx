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

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (<div className={cn("rounded-lg border border-line bg-surface", className)} {...props}/>);
}
export function CardHeader({ title, actions, className, }: {
    title: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (<div className={cn("flex items-center justify-between border-b border-line px-4 py-2.5", className)}>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>);
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-4", className)} {...props}/>;
}
