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
import { useEffect, useState, type ReactNode } from "react";
import { createProject, fetchFactsExtractStatus, linkProject, listProjects, saveLockdownPolicy, fetchWriteMode, saveWriteMode, type WriteModeStatus, syncProject, updateFactsExtract, type FactsExtractStatus, type LockdownStatus, type RegisteredProject, } from "../api/client";
import { Button, Card, CardHeader, Reveal, useToast } from "../design";
import { LockdownPolicySelects, useLockdownStatus } from "../shell/LockdownBanner";
import { LOCALES, setLocale, setVoice, useLocale, useT, useVoice, type LocaleCode, type Voice, } from "../i18n";
import { useProjectPick } from "../shell/AppShell";
import { humanName } from "../api/session";
import { useSessionContext } from "../shell/SessionContext";
import { syncStatusLabel } from "../wire/syncProgress";
function SettingsIllustration({ className }: {
    className?: string;
}) {
    return (<svg viewBox="0 0 170 110" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      
      <g stroke="var(--db-faint)">
        <path d="M24 40h24l7 8h41a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V46a6 6 0 0 1 6-6Z"/>
        <path d="M18 60h84" opacity="0.5"/>
      </g>
      
      <g stroke="var(--db-primary)">
        <path d="M124 46a22 22 0 0 1 22 21"/>
        <path d="M146 82a22 22 0 0 1-21 5" strokeDasharray="3 5"/>
        <path d="M141 62l5 5 5-5"/>
      </g>
      
      <g stroke="var(--db-primary)">
        <path d="M60 56l9 3.5v6c0 5.5-4 9.5-9 11.5-5-2-9-6-9-11.5v-6L60 56Z"/>
      </g>
    </svg>);
}
function Row({ label, value, mono, action, }: {
    label: string;
    value: string;
    mono?: boolean;
    action?: ReactNode;
}) {
    return (<div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="shrink-0 text-xs text-muted">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className={mono
            ? "truncate font-mono text-xs text-foreground"
            : "truncate text-sm text-foreground"}>
          {value || "--"}
        </span>
        {action}
      </span>
    </div>);
}
function FactsExtractSupportRow() {
    const t = useT();
    const toast = useToast();
    const [status, setStatus] = useState<FactsExtractStatus | null>(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        void fetchFactsExtractStatus().then(setStatus);
    }, []);
    const apply = async () => {
        if (busy || status?.overridden)
            return;
        setBusy(true);
        try {
            const next = await updateFactsExtract();
            setStatus(next);
            toast({ title: t("header.extractUpdated"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("header.extractUpdateFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    };
    return (<Row label={t("settings.factsExtract")} value={status?.installed || "--"} mono action={status?.overridden ? null : (<Button size="sm" variant="secondary" disabled={busy} onClick={() => void apply()}>
            {busy ? t("settings.factsExtractUpdating") : t("settings.factsExtractUpdate")}
          </Button>)}/>);
}
function LanguageSelect() {
    const locale = useLocale();
    const t = useT();
    return (<div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted">{t("settings.language")}</p>
        <p className="mt-0.5 text-xs text-faint">{t("settings.languageHint")}</p>
      </div>
      <select value={locale} onChange={(e) => void setLocale(e.target.value as LocaleCode)} aria-label={t("settings.language")} className="shrink-0 rounded border border-line bg-inset px-2.5 py-1.5 text-sm text-foreground transition-colors duration-fast focus:border-primary/60 focus:outline-none">
        {LOCALES.map((l) => (<option key={l.code} value={l.code}>
            {l.label}
          </option>))}
      </select>
    </div>);
}
function VoiceSelect() {
    const voice = useVoice();
    const t = useT();
    const options: {
        value: Voice;
        label: string;
    }[] = [
        { value: "simple", label: t("settings.voiceSimple") },
        { value: "technical", label: t("settings.voiceTechnical") },
    ];
    return (<div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted">{t("settings.voice")}</p>
        <p className="mt-0.5 text-xs text-faint">{t("settings.voiceHint")}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {options.map((opt) => (<button key={opt.value} type="button" onClick={() => setVoice(opt.value)} className={voice === opt.value
                ? "rounded border border-primary/60 bg-primary-subtle px-2.5 py-1.5 text-sm text-foreground"
                : "rounded border border-line bg-inset px-2.5 py-1.5 text-sm text-muted transition-colors duration-fast hover:border-line-strong"}>
            {opt.label}
          </button>))}
      </div>
    </div>);
}
function WriteModeCard() {
    const t = useT();
    const toast = useToast();
    const [status, setStatus] = useState<WriteModeStatus | null>(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        void fetchWriteMode().then(setStatus).catch(() => setStatus(null));
    }, []);
    async function setMode(mode: "watch" | "hard") {
        setBusy(true);
        try {
            setStatus(await saveWriteMode(mode));
            toast({ title: t("hard.saved"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("hard.failed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    return (<Card>
      <CardHeader title={t("hard.title")}/>
      <div className="space-y-2.5 border-b border-line px-4 py-3">
        <p className="text-xs text-muted">{t("hard.intro")}</p>
        <dl className="space-y-1.5">
          <ModeLine term={t("hard.modeWatch")} description={t("hard.watchLine")}/>
          <ModeLine term={t("hard.modeHard")} description={t("hard.hardLine")}/>
        </dl>
        <p className="text-xs text-faint">{t("hard.limits")}</p>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <p className="min-w-0 text-xs text-faint">{t("hard.scope")}</p>
        <div className="flex shrink-0 gap-1.5">
          {(["watch", "hard"] as const).map((mode) => (<button key={mode} type="button" disabled={busy || !status} onClick={() => void setMode(mode)} className={status?.mode === mode
                ? "rounded border border-primary/60 bg-primary-subtle px-2.5 py-1.5 text-sm text-foreground"
                : "rounded border border-line bg-inset px-2.5 py-1.5 text-sm text-muted"}>
              {t(mode === "hard" ? "hard.modeHard" : "hard.modeWatch")}
            </button>))}
        </div>
      </div>
    </Card>);
}
function ModeLine({ term, description }: {
    term: string;
    description: string;
}) {
    return (<div className="flex gap-2.5 text-xs">
      <dt className="w-12 shrink-0 font-medium text-foreground">{term}</dt>
      <dd className="min-w-0 text-muted">{description}</dd>
    </div>);
}
function LockdownPolicyCard() {
    const t = useT();
    const toast = useToast();
    const { status, setStatus, busy, setBusy } = useLockdownStatus(null);
    async function handlePolicy(patch: Partial<LockdownStatus["policy"]>) {
        if (!status)
            return;
        setBusy(true);
        try {
            const next = await saveLockdownPolicy({ ...status.policy, ...patch });
            setStatus(next);
            toast({ title: t("lockdown.policySaved"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("lockdown.policyFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    return (<Card>
      <CardHeader title={t("lockdown.policy")}/>
      <div className="space-y-1 border-b border-line px-4 py-3">
        <p className="text-xs text-muted">{t("lockdown.policyHint")}</p>
        <p className="text-xs text-faint">{t("lockdown.policyNote")}</p>
      </div>
      {status ? (<div className="flex items-center justify-end gap-2 px-4 py-2.5">
          <LockdownPolicySelects status={status} busy={busy} onPolicy={(patch) => void handlePolicy(patch)}/>
        </div>) : null}
    </Card>);
}
export function SettingsPage() {
    const { session, refresh } = useSessionContext();
    const toast = useToast();
    const t = useT();
    const navigate = useNavigate();
    const { pick, picking } = useProjectPick();
    const [syncing, setSyncing] = useState(false);
    const [projects, setProjects] = useState<RegisteredProject[]>([]);
    const [projectName, setProjectName] = useState("");
    const [linking, setLinking] = useState(false);
    useEffect(() => {
        if (!session?.project_path || session.project_id)
            return;
        const suggested = session.project_slug ||
            session.project_path.replace(/[/\\]+$/, "").split(/[/\\]/).pop() ||
            "";
        setProjectName((current) => current || suggested);
        void listProjects().then(setProjects).catch(() => setProjects([]));
    }, [session?.project_path, session?.project_id, session?.project_slug]);
    async function afterLinked() {
        await refresh();
        void navigate({ to: "/graph" });
        try {
            await syncProject();
        }
        catch (err) {
            toast({
                title: t("settings.syncFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            await refresh();
        }
    }
    async function selectProject(project: RegisteredProject) {
        setLinking(true);
        try {
            await linkProject(project);
            await afterLinked();
        }
        catch (err) {
            toast({
                title: t("agents.mintFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setLinking(false);
        }
    }
    async function makeProject() {
        if (!projectName.trim())
            return;
        setLinking(true);
        try {
            await createProject(projectName.trim());
            await afterLinked();
        }
        catch (err) {
            toast({
                title: t("settings.syncFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setLinking(false);
        }
    }
    async function handleResync() {
        setSyncing(true);
        try {
            await syncProject();
            toast({ title: t("settings.syncStarted"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("settings.syncFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setSyncing(false);
            await refresh();
        }
    }
    return (<div className="mx-auto max-w-3xl space-y-5 overflow-hidden px-8 py-10">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <h1 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
            {t("nav.settings")}
          </h1>
          <SettingsIllustration className="hidden h-20 w-auto sm:block"/>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
      <Card>
        <CardHeader title={t("settings.project")} actions={<div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => void pick()} disabled={picking}>
                {picking ? t("settings.choosing") : t("settings.changeFolder")}
              </Button>
              <Button size="sm" onClick={handleResync} disabled={syncing || !session?.project_id}>
                {syncing ? t("settings.syncing") : t("settings.resync")}
              </Button>
            </div>}/>
        <p className="border-b border-line px-4 py-2.5 text-xs text-muted">
          {t("settings.projectHint")}
        </p>
        <div className="divide-y divide-line">
          <Row label={t("settings.path")} value={session?.project_path ?? ""} mono/>
          
          <Row label={t("settings.syncPhase")} value={syncStatusLabel(session)}/>
          {session?.graph_error ? (<Row label={t("settings.lastError")} value={session.graph_error}/>) : null}
        </div>
        {session?.project_path && !session.project_id ? (<div className="space-y-3 border-t border-line p-4">
            <p className="text-sm text-muted">
              {t("agents.pickProjectFirst")}
            </p>
            {projects.length ? (<select className="w-full rounded border border-line bg-inset px-2.5 py-2 text-sm text-foreground" defaultValue="" disabled={linking} onChange={(event) => {
                    const selected = projects.find((project) => (project.id || project.project_id) === event.target.value);
                    if (selected)
                        void selectProject(selected);
                }}>
                <option value="">{t("agents.project")}</option>
                {projects.map((project) => (<option key={project.id || project.project_id} value={project.id || project.project_id}>
                    {project.display_name || project.displayName || project.slug || project.id}
                  </option>))}
              </select>) : null}
            <div className="flex gap-2">
              <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder={t("settings.project")} className="min-w-0 flex-1 rounded border border-line bg-inset px-2.5 py-2 text-sm text-foreground"/>
              <Button size="sm" onClick={() => void makeProject()} disabled={linking || !projectName.trim()}>
                {t("common.save")}
              </Button>
            </div>
          </div>) : null}
      </Card>
      </Reveal>

      <Reveal delay={0.14}>
        <WriteModeCard />
      </Reveal>
      <Reveal delay={0.16}>
        <LockdownPolicyCard />
      </Reveal>

      <Reveal delay={0.18}>
      <Card>
        <CardHeader title={t("settings.language")}/>
        <div className="divide-y divide-line">
          <LanguageSelect />
          <VoiceSelect />
        </div>
      </Card>
      </Reveal>

      
      <Reveal delay={0.22}>
        <details className="group">
          <summary className="cursor-pointer list-none text-sm text-muted transition-colors duration-fast hover:text-foreground">
            <span aria-hidden className="mr-2 inline-block text-[10px] text-faint transition-transform duration-fast group-open:rotate-90">
              ▶
            </span>
            {t("settings.supportInfo")}
          </summary>
          <Card className="mt-3">
            <p className="border-b border-line px-4 py-2.5 text-xs text-faint">
              {t("settings.supportHint")}
            </p>
            <div className="divide-y divide-line">
              <Row label={t("settings.organization")} value={humanName(session?.org_name) || humanName(session?.org_slug)}/>
              <Row label={t("settings.project")} value={humanName(session?.project_display_name) ||
            humanName(session?.project_slug)}/>
              <Row label={t("settings.authenticated")} value={session?.authenticated ? t("common.yes") : t("common.no")}/>
              <Row label={t("settings.snapshotSaved")} value={session?.snapshot_saved ? t("common.yes") : t("common.no")}/>
              <Row label={t("settings.appVersion")} value={session?.app_version || ""} mono/>
              <FactsExtractSupportRow />
            </div>
          </Card>
        </details>
      </Reveal>
    </div>);
}
