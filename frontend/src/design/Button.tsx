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

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}
const VARIANT: Record<Variant, string> = {
    primary: "bg-primary text-background font-medium hover:bg-primary-hover active:bg-primary-active disabled:opacity-40",
    secondary: "border border-line bg-surface text-foreground hover:border-line-strong hover:bg-overlay disabled:opacity-40",
    ghost: "text-muted hover:bg-overlay hover:text-foreground disabled:opacity-40",
    danger: "border border-danger/30 bg-danger-subtle text-danger hover:border-danger/60 disabled:opacity-40",
};
const SIZE: Record<Size, string> = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-8 px-3.5 text-sm",
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "secondary", size = "md", className, type, ...props }, ref) => (<button ref={ref} type={type ?? "button"} className={cn("inline-flex select-none items-center justify-center gap-1.5 rounded transition-colors duration-fast", "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", "disabled:cursor-not-allowed", VARIANT[variant], SIZE[size], className)} {...props}/>));
Button.displayName = "Button";
