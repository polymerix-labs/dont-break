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

import { create } from "zustand";
import type { Rule } from "../api/dashboard";
export type GraphSelection = {
    nodeId: string;
    name: string;
    nodeType: string;
} | null;
export type PendingRulePreview = {
    ruleId: string;
    name: string;
    revert: {
        kind: "delete";
    } | {
        kind: "restore";
        rule: Rule;
    };
} | null;
type UiState = {
    graphSelection: GraphSelection;
    setGraphSelection: (selection: GraphSelection) => void;
    paletteOpen: boolean;
    setPaletteOpen: (open: boolean) => void;
    activeOverlay: string | null;
    setActiveOverlay: (overlayId: string | null) => void;
    pendingRulePreview: PendingRulePreview;
    setPendingRulePreview: (preview: PendingRulePreview) => void;
};
export const useUiStore = create<UiState>((set) => ({
    graphSelection: null,
    setGraphSelection: (graphSelection) => set({ graphSelection }),
    paletteOpen: false,
    setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    activeOverlay: null,
    setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
    pendingRulePreview: null,
    setPendingRulePreview: (pendingRulePreview) => set({ pendingRulePreview }),
}));
