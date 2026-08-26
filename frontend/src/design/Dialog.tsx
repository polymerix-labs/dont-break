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

import * as RadixDialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "./cn";
export function Dialog({ open, onOpenChange, title, description, children, width = "md", }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    width?: "md" | "lg";
}) {
    return (<RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in"/>
        <RadixDialog.Content className={cn("fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2", "max-h-[85vh] w-[90vw] overflow-y-auto rounded-lg border border-line bg-surface p-5", width === "lg" ? "max-w-2xl" : "max-w-md")}>
          <RadixDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </RadixDialog.Title>
          {description ? (<RadixDialog.Description className="mt-1 text-sm text-muted">
              {description}
            </RadixDialog.Description>) : null}
          <div className="mt-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>);
}
