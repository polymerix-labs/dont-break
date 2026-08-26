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

import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Dialog, EmptyState, Field, Input, Skeleton, Tabs, ToastProvider, useToast, verdictTone, } from "./index";
function Swatch({ name, cssVar }: {
    name: string;
    cssVar: string;
}) {
    return (<div className="flex items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 rounded border border-line" style={{ background: `var(${cssVar})` }}/>
      <div>
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-faint">{cssVar}</p>
      </div>
    </div>);
}
function Section({ title, children }: {
    title: string;
    children: React.ReactNode;
}) {
    return (<section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{title}</h2>
      {children}
    </section>);
}
function DemoContent() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tab, setTab] = useState("rules");
    const toast = useToast();
    return (<div className="mx-auto max-w-4xl space-y-10 px-8 py-10">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Design system</h1>
        <p className="mt-1 text-sm text-muted">
          Single accent, semantic colors reserved for meaning, 5 type sizes, 4px grid.
        </p>
      </header>

      <Section title="Neutral ladder">
        <div className="grid grid-cols-3 gap-4">
          <Swatch name="Background" cssVar="--db-background"/>
          <Swatch name="Surface" cssVar="--db-surface"/>
          <Swatch name="Overlay" cssVar="--db-overlay"/>
          <Swatch name="Inset" cssVar="--db-inset"/>
          <Swatch name="Border" cssVar="--db-border"/>
          <Swatch name="Border strong" cssVar="--db-border-strong"/>
        </div>
      </Section>

      <Section title="Accent and semantics">
        <div className="grid grid-cols-3 gap-4">
          <Swatch name="Primary (the accent)" cssVar="--db-primary"/>
          <Swatch name="Ok / healthy" cssVar="--db-ok"/>
          <Swatch name="Warn / caution" cssVar="--db-warn"/>
          <Swatch name="Danger / block" cssVar="--db-danger"/>
          <Swatch name="Zone core" cssVar="--db-zone-core"/>
          <Swatch name="Zone halo" cssVar="--db-zone-halo"/>
        </div>
      </Section>

      <Section title="Typography">
        <Card>
          <CardBody className="space-y-2">
            <p className="text-xl text-foreground">Practicability verdict (xl, 24px)</p>
            <p className="text-lg text-foreground">Rule detail heading (lg, 17px)</p>
            <p className="text-base text-foreground">Body text and descriptions (base, 14px)</p>
            <p className="text-sm text-muted">Secondary rows and metadata (sm, 12.5px)</p>
            <p className="text-xs text-faint">Captions and column labels (xs, 11px)</p>
            <p className="font-mono text-sm text-foreground">
              com.skydoves.pokedex.ui.main.MainViewModel
            </p>
            <p className="text-sm tabular-nums text-foreground">
              stability 87.1 · navigability 100.0 · 46 nodes · 532 ms
            </p>
          </CardBody>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Create rule</Button>
          <Button variant="secondary">Show zone</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete rule</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </div>
      </Section>

      <Section title="Badges (verdicts, severities, zones)">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={verdictTone("ok")}>ok</Badge>
          <Badge tone={verdictTone("warn")}>warn</Badge>
          <Badge tone={verdictTone("block")}>block</Badge>
          <Badge tone="zone-core">core</Badge>
          <Badge tone="zone-halo">halo · d2</Badge>
          <Badge tone="primary">protected_path</Badge>
          <Badge tone="neutral">inactive</Badge>
        </div>
      </Section>

      <Section title="Card with header">
        <Card>
          <CardHeader title="UI main screen is protected" actions={<>
                <Badge tone="danger">block</Badge>
                <Button size="sm">Show zone</Button>
              </>}/>
          <CardBody className="space-y-1.5">
            <p className="text-sm text-muted">
              Any edit whose impact reaches this zone within 2 hops is blocked.
            </p>
            <p className="font-mono text-xs text-faint">
              app/src/main/kotlin/com/skydoves/pokedex/ui/main/**
            </p>
          </CardBody>
        </Card>
      </Section>

      <Section title="Tabs">
        <Tabs value={tab} onValueChange={setTab} items={[
            {
                value: "rules",
                label: "Rules",
                content: <p className="text-sm text-muted">3 active rules on this project.</p>,
            },
            {
                value: "violations",
                label: "Violations",
                content: <p className="text-sm text-muted">Last blocked check: 2 minutes ago.</p>,
            },
        ]}/>
      </Section>

      <Section title="Form field">
        <div className="max-w-sm space-y-4">
          <Field label="Rule name" hint="Unique within the project.">
            <Input placeholder="Payment flow is frozen"/>
          </Field>
          <Field label="Path glob" error="No nodes match this glob.">
            <Input defaultValue="src/payments/**" className="font-mono"/>
          </Field>
        </div>
      </Section>

      <Section title="Dialog and toasts">
        <div className="flex gap-3">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => toast({ title: "Rule created", detail: "Zone: 3 core, 46 halo nodes.", tone: "ok" })}>
            Ok toast
          </Button>
          <Button onClick={() => toast({ title: "Check blocked", detail: "1 violation on a protected zone.", tone: "danger" })}>
            Danger toast
          </Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Delete this rule?" description="The protected zone disappears immediately. Checks in flight are unaffected.">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setDialogOpen(false)}>
              Delete
            </Button>
          </div>
        </Dialog>
      </Section>

      <Section title="Loading and empty states">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardBody className="space-y-2">
              <Skeleton className="h-4 w-2/3"/>
              <Skeleton className="h-3 w-full"/>
              <Skeleton className="h-3 w-5/6"/>
            </CardBody>
          </Card>
          <EmptyState title="No rules yet" detail="Protect a path or pin a node to teach agents what must not break." action={<Button variant="primary">Create the first rule</Button>}/>
        </div>
      </Section>
    </div>);
}
export default function DesignDemo() {
    return (<ToastProvider>
      <div className="h-screen overflow-y-auto bg-background">
        <DemoContent />
      </div>
    </ToastProvider>);
}
