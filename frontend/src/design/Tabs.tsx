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

import * as RadixTabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { cn } from "./cn";
export function Tabs({ value, onValueChange, items, className, }: {
    value: string;
    onValueChange: (value: string) => void;
    items: Array<{
        value: string;
        label: string;
        content: ReactNode;
    }>;
    className?: string;
}) {
    return (<RadixTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <RadixTabs.List className="flex gap-1 border-b border-line">
        {items.map((item) => (<RadixTabs.Trigger key={item.value} value={item.value} className={cn("-mb-px border-b-2 border-transparent px-3 py-1.5 text-sm text-muted", "transition-colors duration-fast hover:text-foreground", "data-[state=active]:border-primary data-[state=active]:text-foreground")}>
            {item.label}
          </RadixTabs.Trigger>))}
      </RadixTabs.List>
      {items.map((item) => (<RadixTabs.Content key={item.value} value={item.value} className="pt-4">
          {item.content}
        </RadixTabs.Content>))}
    </RadixTabs.Root>);
}
