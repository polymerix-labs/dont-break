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

import { useEffect, useMemo, useState } from "react";
import type { AssistCandidate, AssistCoverage } from "../../../api/assistProxy";
import { Card, Disclosure } from "../../../design";
import { useT } from "../../../i18n";
import { useUiStore } from "../../../shell/uiStore";
import { deriveContract, TOGGLABLE_KINDS } from "./ContractPanel";
import type { StudioEvent } from "./studioStore";
import { useStudioStore } from "./studioStore";
export function deriveCoverage(events: readonly StudioEvent[]): AssistCoverage | null {
    for (let i = events.length - 1; i >= 0; i--) {
        const { ev } = events[i];
        if (ev.event === "coverage")
            return ev.data;
    }
    return null;
}
const LIST_LIMIT = 8;
function NodeList({ items, renderSuffix, }: {
    items: {
        id: string;
        name: string;
        fqn: string;
        distance?: number;
    }[];
    renderSuffix?: (item: {
        distance?: number;
    }) => string | null;
}) {
    const t = useT();
    return (<ul className="space-y-0.5">
      {items.slice(0, LIST_LIMIT).map((item) => (<li key={item.id} title={item.fqn || item.name} className="flex items-baseline gap-2 truncate font-mono text-xs text-muted">
          <span className="truncate">{item.name || item.id}</span>
          {renderSuffix?.(item) ? (<span className="shrink-0 text-[10px] text-faint">
              {renderSuffix(item)}
            </span>) : null}
        </li>))}
      {items.length > LIST_LIMIT ? (<li className="text-xs text-faint">
          {t("studio.coverage.more", { count: items.length - LIST_LIMIT })}
        </li>) : null}
    </ul>);
}
export function CoveragePanel() {
    const events = useStudioStore((s) => s.events);
    const t = useT();
    const coverage = useMemo(() => deriveCoverage(events), [events]);
    const contract = useMemo(() => deriveContract(events), [events]);
    const [added, setAdded] = useState<ReadonlySet<string>>(new Set());
    useEffect(() => setAdded(new Set()), [coverage]);
    if (!coverage)
        return null;
    const blindSpots = coverage.opacity?.unresolved_refs ?? 0;
    const canProtect = contract != null && TOGGLABLE_KINDS.has(contract.kind);
    function protectAlso(candidate: AssistCandidate) {
        useUiStore.getState().setGraphSelection({
            nodeId: candidate.id,
            name: candidate.name,
            nodeType: candidate.node_type ?? "",
        });
        setAdded((prev) => {
            const next = new Set(prev);
            if (next.has(candidate.id))
                next.delete(candidate.id);
            else
                next.add(candidate.id);
            return next;
        });
    }
    return (<Card className="shrink-0">
      <div className="border-b border-line px-4 py-2.5">
        <p className="text-xs font-medium text-foreground">
          {t("studio.coverage.title")}
        </p>
        {coverage.computed ? null : (<p className="mt-0.5 text-xs text-warn">
            {t("studio.coverage.notComputed")}
          </p>)}
      </div>

      
      <div className="space-y-3 p-4">
        {blindSpots > 0 ? (<div className="rounded border border-warn/40 bg-warn-subtle px-3 py-2">
            <p className="text-xs text-warn">
              {t("studio.coverage.opacity", {
                count: blindSpots,
                nodes: coverage.opacity?.nodes_with_unresolved ?? 0,
            })}
            </p>
          </div>) : null}
        <Disclosure summary={coverage.computed
            ? t("studio.coverage.summary", {
                core: coverage.core.length,
                halo: coverage.halo.length,
            })
            : t("studio.frontier.title")} bodyClassName="space-y-3">
        {coverage.computed ? (<div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-zone-core"/>
                {t("studio.coverage.coreGroup")}
              </p>
              <NodeList items={coverage.core}/>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-zone-halo"/>
                {t("studio.coverage.haloGroup")}
              </p>
              <NodeList items={coverage.halo} renderSuffix={(item) => item.distance != null
                ? t("studio.coverage.distance", { distance: item.distance })
                : null}/>
            </div>
          </div>) : null}
        {coverage.truncated ? (<p className="text-xs text-faint">{t("studio.coverage.truncated")}</p>) : null}

        <div className="rounded border border-line px-3 py-2.5">
          <p className="text-xs font-medium text-foreground">
            {t("studio.frontier.title")}
          </p>
          {coverage.frontier.length === 0 ? (<p className="mt-1 text-xs text-muted">
              {t("studio.frontier.empty")}
            </p>) : (<>
              <p className="mt-1 text-xs text-muted">
                {t("studio.frontier.note")}
              </p>
              <ul className="mt-2 space-y-1">
                {coverage.frontier.map((candidate) => (<li key={candidate.id} className="flex items-center justify-between gap-2">
                    <span title={candidate.fqn} className="truncate font-mono text-xs text-warn">
                      {candidate.name || candidate.id}
                    </span>
                    {canProtect ? (<button type="button" onClick={() => protectAlso(candidate)} className={added.has(candidate.id)
                        ? "shrink-0 rounded border border-line px-2 py-0.5 text-[11px] text-muted transition-colors duration-fast hover:border-line-strong hover:text-foreground"
                        : "shrink-0 rounded border border-line-strong px-2 py-0.5 text-[11px] text-foreground transition-colors duration-fast hover:bg-surface-2"}>
                        {added.has(candidate.id)
                        ? t("studio.frontier.added")
                        : t("studio.frontier.protectAlso")}
                      </button>) : null}
                  </li>))}
              </ul>
            </>)}
        </div>
        </Disclosure>
      </div>
    </Card>);
}
