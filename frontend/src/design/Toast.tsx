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

import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "./cn";
type ToastTone = "neutral" | "ok" | "danger";
type ToastItem = {
    id: number;
    title: string;
    detail?: string;
    tone: ToastTone;
};
const ToastContext = createContext<(t: Omit<ToastItem, "id">) => void>(() => { });
export function useToast() {
    return useContext(ToastContext);
}
const TONE_BAR: Record<ToastTone, string> = {
    neutral: "bg-primary",
    ok: "bg-ok",
    danger: "bg-danger",
};
export function ToastProvider({ children }: {
    children: ReactNode;
}) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const push = useCallback((toast: Omit<ToastItem, "id">) => {
        setItems((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
    }, []);
    return (<ToastContext.Provider value={push}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (<RadixToast.Root key={item.id} onOpenChange={(open) => {
                if (!open)
                    setItems((prev) => prev.filter((t) => t.id !== item.id));
            }} className="flex items-stretch gap-3 overflow-hidden rounded-lg border border-line bg-overlay">
            <div className={cn("w-0.5 shrink-0", TONE_BAR[item.tone])}/>
            <div className="py-2.5 pr-3">
              <RadixToast.Title className="text-sm font-medium text-foreground">
                {item.title}
              </RadixToast.Title>
              {item.detail ? (<RadixToast.Description className="mt-0.5 text-xs text-muted">
                  {item.detail}
                </RadixToast.Description>) : null}
            </div>
          </RadixToast.Root>))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"/>
      </RadixToast.Provider>
    </ToastContext.Provider>);
}
