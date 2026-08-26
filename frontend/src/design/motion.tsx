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

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";
export const EASE = [0.25, 0.6, 0.3, 1] as const;
export function Reveal({ delay = 0, className, children, }: {
    delay?: number;
    className?: string;
    children: React.ReactNode;
}) {
    const reduce = useReducedMotion();
    return (<motion.div className={className} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: EASE }}>
      {children}
    </motion.div>);
}
export function CountUp({ value, decimals = 0, className, }: {
    value: number;
    decimals?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();
    const [text, setText] = useState(() => reduce ? value.toFixed(decimals) : (0).toFixed(decimals));
    useEffect(() => {
        if (reduce) {
            setText(value.toFixed(decimals));
            return;
        }
        const controls = animate(0, value, {
            duration: 0.9,
            ease: EASE,
            onUpdate: (v) => setText(v.toFixed(decimals)),
        });
        return () => controls.stop();
    }, [value, decimals, reduce]);
    return <span className={cn("tabular-nums", className)}>{text}</span>;
}
export function LiveDot() {
    return (<span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 motion-safe:animate-ping"/>
      <span className="relative inline-flex h-2 w-2 rounded-full bg-ok"/>
    </span>);
}
