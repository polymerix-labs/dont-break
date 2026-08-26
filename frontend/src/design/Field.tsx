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

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (<input ref={ref} className={cn("h-8 w-full rounded border border-line bg-inset px-2.5 text-sm text-foreground", "placeholder:text-faint", "transition-colors duration-fast focus:border-primary/60 focus:outline-none", "disabled:cursor-not-allowed disabled:opacity-40", className)} {...props}/>));
Input.displayName = "Input";
export function Field({ label, hint, error, children, className, }: {
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (<label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
      {error ? (<span className="mt-1 block text-xs text-danger">{error}</span>) : hint ? (<span className="mt-1 block text-xs text-faint">{hint}</span>) : null}
    </label>);
}
