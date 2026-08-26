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

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, useToast } from "../../design";
import { useDeleteRule, useUpdateRule } from "../../hooks/useDashboardQueries";
import { useT } from "../../i18n";
import { useUiStore } from "../../shell/uiStore";
import { useViewerOverlays } from "../../viewer/useViewerOverlays";
export function ZonePreviewBanner() {
    const preview = useUiStore((s) => s.pendingRulePreview);
    const setPreview = useUiStore((s) => s.setPendingRulePreview);
    const overlays = useViewerOverlays();
    const deleteRule = useDeleteRule();
    const updateRule = useUpdateRule();
    const navigate = useNavigate();
    const toast = useToast();
    const t = useT();
    const [busy, setBusy] = useState(false);
    if (!preview)
        return null;
    function finish(clearOverlay: boolean) {
        if (clearOverlay)
            overlays.clear();
        setPreview(null);
    }
    async function handleKeep() {
        toast({ title: t("banner.ruleKept"), detail: preview!.name, tone: "ok" });
        finish(false);
    }
    async function handleRevert() {
        setBusy(true);
        try {
            if (preview!.revert.kind === "delete") {
                await deleteRule.mutateAsync(preview!.ruleId);
                toast({ title: t("banner.ruleDiscarded"), tone: "neutral" });
            }
            else {
                const original = preview!.revert.rule;
                await updateRule.mutateAsync({ ruleId: preview!.ruleId, input: original });
                toast({ title: t("banner.reverted"), tone: "neutral" });
            }
            finish(true);
            void navigate({ to: "/rules" });
        }
        catch (err) {
            toast({
                title: t("banner.revertFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    return (<div className="pointer-events-auto fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-overlay px-4 py-2.5">
      <Badge tone="zone-core">{t("banner.zonePreview")}</Badge>
      <span className="max-w-64 truncate text-sm text-foreground">{preview.name}</span>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => void handleRevert()}>
          {preview.revert.kind === "delete" ? t("banner.discardRule") : t("banner.revertChanges")}
        </Button>
        <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleKeep()}>
          {t("banner.keep")}
        </Button>
      </div>
    </div>);
}
