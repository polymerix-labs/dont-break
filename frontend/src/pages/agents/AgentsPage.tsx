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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAgentSetup, installAgentHook, installAgentSkill, mintAgentToken, regenerateAgentToken, type AgentSetup, type MintedAgentToken, } from "../../api/client";
import { fetchArchStatus } from "../../api/dashboard";
import { Badge, Button, Card, CardBody, CardHeader, Dialog, Reveal, Skeleton, cn, useToast, } from "../../design";
import { useT, useVoice, type MessageKey, type TFunc } from "../../i18n";
import { AGENT_TARGETS, agentTargetById, buildMcpSnippet, setAgentTarget, useChosenAgentTarget, type AgentTarget, } from "./agentTargets";
import { orderedUseCases, type UseCase, type UseCaseId } from "./useCases";
import { TryToBreakIt } from "./TryToBreakIt";
import { hookInstallButtonLabel } from "./hookInstall";
import { CiScene, DangerScene, FixesScene, HealthScene, HeroIllustration, ImpactScene, MapScene, OnboardScene, PathScene, PrecommitScene, ProtectScene, ReviewScene, } from "./illustrations";
const USE_CASE_SCENE: Record<UseCaseId, (p: {
    className?: string;
}) => React.ReactNode> = {
    protect: ProtectScene,
    impact: ImpactScene,
    map: MapScene,
    ci: CiScene,
    danger: DangerScene,
    health: HealthScene,
    fixes: FixesScene,
    precommit: PrecommitScene,
    path: PathScene,
    review: ReviewScene,
    onboard: OnboardScene,
};
const USE_CASE_STORY: Record<UseCaseId, MessageKey> = {
    protect: "useCase.protect.story",
    impact: "useCase.impact.story",
    map: "useCase.map.story",
    ci: "useCase.ci.story",
    danger: "useCase.danger.story",
    health: "useCase.health.story",
    fixes: "useCase.fixes.story",
    precommit: "useCase.precommit.story",
    path: "useCase.path.story",
    review: "useCase.review.story",
    onboard: "useCase.onboard.story",
};
function StatusDot({ ok, label }: {
    ok: boolean;
    label: string;
}) {
    return (<span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-ok" : "bg-faint")}/>
      {label}
    </span>);
}
function CodeBlock({ code, copyKey, t }: {
    code: string;
    copyKey: string;
    t: TFunc;
}) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
        void navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        });
    }, [code]);
    return (<div className="relative" data-copy={copyKey}>
      <pre className="max-h-56 overflow-auto rounded border border-line bg-inset p-3 font-mono text-xs leading-relaxed text-foreground">
        {code}
      </pre>
      <Button size="sm" variant="ghost" className="absolute right-1.5 top-1.5 bg-surface" onClick={copy}>
        {copied ? t("common.copied") : t("common.copy")}
      </Button>
    </div>);
}
function Transcript({ text }: {
    text: string;
}) {
    const lineClass = (line: string): string => {
        if (line.startsWith(">"))
            return "text-primary";
        if (/verdict: block|exit code 1|job failed/.test(line))
            return "text-zone-core";
        if (/witness/.test(line))
            return "text-faint";
        return "text-muted";
    };
    return (<pre className="overflow-auto rounded border border-line bg-inset p-3 font-mono text-xs leading-relaxed">
      {text.split("\n").map((line, i) => (<div key={i} className={lineClass(line)}>
          {line || " "}
        </div>))}
    </pre>);
}
function agentDisplayName(target: AgentTarget, t: TFunc): string {
    return target.label ?? (target.labelKey ? t(target.labelKey) : target.id);
}
function AgentPicker({ chosen, compact, t, }: {
    chosen: string | null;
    compact: boolean;
    t: TFunc;
}) {
    return (<div data-agent-picker className="flex flex-wrap gap-2">
      {AGENT_TARGETS.map((target) => (<button key={target.id} type="button" onClick={() => setAgentTarget(target.id)} className={cn("rounded border transition-colors duration-fast", compact ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm", chosen === target.id
                ? "border-primary/60 bg-primary-subtle text-foreground"
                : "border-line bg-inset text-muted hover:border-line-strong")}>
          {agentDisplayName(target, t)}
        </button>))}
    </div>);
}
function Step({ n, done, title, last, children, }: {
    n: number;
    done: boolean;
    title: string;
    last?: boolean;
    children: React.ReactNode;
}) {
    return (<div className="relative flex gap-4">
      {!last ? (<span aria-hidden className="absolute bottom-0 left-3 top-8 w-px bg-line"/>) : null}
      <span className={cn("relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-slow", done ? "bg-primary text-background" : "bg-overlay text-muted")}>
        {done ? "✓" : n}
      </span>
      <div className={cn("min-w-0 flex-1 space-y-3", last ? "" : "pb-7")}>
        <p className="pt-0.5 text-sm font-medium text-foreground">{title}</p>
        {children}
      </div>
    </div>);
}
function UseCaseTeaser({ useCase, featured, onOpen, t, }: {
    useCase: UseCase;
    featured?: boolean;
    onOpen: () => void;
    t: TFunc;
}) {
    const Scene = USE_CASE_SCENE[useCase.id];
    if (featured) {
        return (<Card data-use-case={useCase.id} className="group h-full overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:border-line-strong">
        <button type="button" onClick={onOpen} className="flex h-full w-full items-stretch text-left">
          <span className="flex w-2/5 shrink-0 items-center justify-center overflow-hidden border-r border-line bg-primary-subtle py-4">
            <Scene className="h-28 w-auto transition-transform duration-slow group-hover:scale-[1.06]"/>
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-5">
            <span className="text-base font-medium leading-snug text-foreground">
              {t(useCase.titleKey)}
            </span>
            <span className="text-xs leading-relaxed text-muted">
              {t(useCase.painKey)}
            </span>
          </span>
        </button>
      </Card>);
    }
    return (<Card data-use-case={useCase.id} className="group h-full overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:border-line-strong">
      <button type="button" onClick={onOpen} className="flex h-full w-full flex-col text-left">
        <span className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden border-b border-line bg-primary-subtle">
          <Scene className="h-[104px] w-auto transition-transform duration-slow group-hover:scale-[1.06]"/>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 p-4">
          <span className="text-sm font-medium leading-snug text-foreground">
            {t(useCase.titleKey)}
          </span>
          <span className="text-xs leading-relaxed text-muted">{t(useCase.painKey)}</span>
        </span>
      </button>
    </Card>);
}
function UseCaseDialog({ useCase, setup, target, connected, open, onOpenChange, onInstallSkill, onGoSetup, t, }: {
    useCase: UseCase;
    setup: AgentSetup;
    target: AgentTarget;
    connected: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInstallSkill: () => void;
    onGoSetup: () => void;
    t: TFunc;
}) {
    const isCli = useCase.configKind === "cli";
    const config = isCli ? useCase.buildPrompt(setup, target) : buildMcpSnippet(setup);
    return (<Dialog open={open} onOpenChange={onOpenChange} title={t(useCase.titleKey)} width="lg">
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          {t(USE_CASE_STORY[useCase.id])}
        </p>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted">{t("agents.transcriptLabel")}</p>
          <Transcript text={useCase.buildTranscript(setup)}/>
          <p className="text-[11px] text-faint">{t("agents.transcriptNote")}</p>
        </div>

        {!isCli ? (<div className="space-y-1.5">
            <p className="text-xs font-medium text-muted">
              {t("agents.promptLabel")}
              <span className="ml-1.5 font-normal text-faint">
                {t(target.promptHintKey)}
              </span>
            </p>
            <CodeBlock code={useCase.buildPrompt(setup, target)} copyKey={`uc-${useCase.id}-prompt`} t={t}/>
          </div>) : null}

        {connected ? (<details className="group/config rounded border border-line">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-muted transition-colors duration-fast hover:text-foreground">
              <span aria-hidden className="mr-2 inline-block text-[10px] text-faint transition-transform duration-fast group-open/config:rotate-90">
                ▶
              </span>
              {t("agents.configLabel")}
              {!isCli && target.mcpConfigPath ? (<span className="ml-1.5 font-mono text-faint">
                  {target.mcpConfigPath}
                </span>) : null}
            </summary>
            <div className="border-t border-line p-3">
              <CodeBlock code={config} copyKey={`uc-${useCase.id}-config`} t={t}/>
            </div>
          </details>) : (<div className="flex flex-wrap items-center justify-between gap-3 rounded border border-primary/30 bg-primary-subtle px-3 py-2.5">
            <p className="min-w-0 text-xs text-muted">{t("agents.setupCtaHint")}</p>
            <Button variant="primary" size="sm" onClick={() => {
                onOpenChange(false);
                onGoSetup();
            }}>
              {t("agents.setupCta")}
            </Button>
          </div>)}

        {useCase.showsSkillInstall && connected ? (<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="max-w-lg text-xs text-muted">{t("agents.skillHint")}</p>
            <Button variant="primary" size="sm" disabled={!setup.project_selected} onClick={onInstallSkill}>
              {t("agents.installSkill")}
            </Button>
          </div>) : null}
      </div>
    </Dialog>);
}
type LiveTest = {
    state: "idle";
} | {
    state: "running";
} | {
    state: "ok";
    ms: number;
    verdict: string;
} | {
    state: "failed";
    message: string;
};
const TOKEN_STORE_PREFIX = "dont-break.agent-token.";
function storedTokenId(projectId: string): string {
    if (!projectId)
        return "";
    try {
        return localStorage.getItem(TOKEN_STORE_PREFIX + projectId) ?? "";
    }
    catch {
        return "";
    }
}
function persistTokenId(projectId: string, tokenId: string) {
    if (!projectId || !tokenId)
        return;
    try {
        localStorage.setItem(TOKEN_STORE_PREFIX + projectId, tokenId);
    }
    catch {
    }
}
const TOKEN_MASK = "<your existing token>";
function maskTokenForDisplay(setup: AgentSetup): AgentSetup {
    const config = JSON.parse(JSON.stringify(setup.mcp_config)) as {
        mcpServers?: Record<string, {
            env?: Record<string, string>;
        }>;
    };
    for (const server of Object.values(config.mcpServers ?? {})) {
        if (server.env && !server.env.DONT_BREAK_TOKEN) {
            server.env.DONT_BREAK_TOKEN = TOKEN_MASK;
        }
    }
    return {
        ...setup,
        mcp_config: config as AgentSetup["mcp_config"],
        cli_snippet: setup.cli_snippet.replace(/DONT_BREAK_TOKEN=".*"/, `DONT_BREAK_TOKEN="${TOKEN_MASK}"`),
    };
}
function applyMintedToken(base: AgentSetup, minted: MintedAgentToken): AgentSetup {
    return {
        ...base,
        has_mcp_secret: true,
        mcp_config: minted.mcp_config,
        cli_snippet: minted.cli_snippet,
        cli_package: minted.cli_package || base.cli_package,
        mcp_package: minted.mcp_package || base.mcp_package,
        api_url: minted.api_url || base.api_url,
    };
}
export function AgentsPage() {
    const [setup, setSetup] = useState<AgentSetup | null>(null);
    const [mintedTokenId, setMintedTokenId] = useState<string>("");
    const [hasSecret, setHasSecret] = useState(false);
    const [minting, setMinting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [liveTest, setLiveTest] = useState<LiveTest>({ state: "idle" });
    const toast = useToast();
    const t = useT();
    const voice = useVoice();
    const chosenAgentId = useChosenAgentTarget();
    const agent = agentTargetById(chosenAgentId ?? "cursor");
    const agentName = agentDisplayName(agent, t);
    const [openUseCase, setOpenUseCase] = useState<string | null>(null);
    const ritualRef = useRef<HTMLDivElement | null>(null);
    const ttbRef = useRef<HTMLDivElement | null>(null);
    const [hookInstalled, setHookInstalled] = useState(false);
    const [hookManual, setHookManual] = useState("");
    useEffect(() => {
        let cancelled = false;
        void fetchAgentSetup()
            .then((data) => {
            if (cancelled || !data)
                return;
            setSetup(data);
            setHasSecret(false);
            const existingId = data.existing_token_id || storedTokenId(data.project_id);
            setMintedTokenId(existingId);
            if (data.existing_token_id)
                persistTokenId(data.project_id, data.existing_token_id);
            setHookInstalled(Boolean(data.hook_installed));
            setHookManual(data.hook_manual ?? "");
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const knownExisting = mintedTokenId !== "" && !hasSecret;
    const connected = hasSecret || knownExisting;
    const displaySetup = useMemo(() => {
        if (!setup)
            return null;
        const base = { ...setup, has_mcp_secret: connected };
        return knownExisting ? maskTokenForDisplay(base) : base;
    }, [setup, connected, knownExisting]);
    async function runLiveTest() {
        setLiveTest({ state: "running" });
        const start = performance.now();
        try {
            const status = await fetchArchStatus();
            setLiveTest({
                state: "ok",
                ms: Math.round(performance.now() - start),
                verdict: status.practicability.verdict,
            });
        }
        catch (err) {
            setLiveTest({
                state: "failed",
                message: err instanceof Error ? err.message : "unknown error",
            });
        }
    }
    function installSkill() {
        void installAgentSkill()
            .then((result) => {
            const verb = result.outcome === "unchanged" ? t("agents.upToDate") : result.outcome;
            toast({ title: `AGENTS.md ${verb}`, detail: result.path, tone: "ok" });
        })
            .catch((err: Error) => toast({ title: t("agents.skillInstallFailed"), detail: err.message, tone: "danger" }));
    }
    function installHook() {
        void installAgentHook()
            .then((result) => {
            setHookInstalled(true);
            setHookManual(result.manual);
            const verb = result.outcome === "updated" ? t("agents.upToDate") : result.outcome;
            toast({ title: `${t("agents.hook")} ${verb}`, detail: result.path, tone: "ok" });
        })
            .catch((err: Error) => toast({ title: t("agents.hookInstallFailed"), detail: err.message, tone: "danger" }));
    }
    async function handleMint() {
        if (!setup)
            return;
        setMinting(true);
        try {
            const minted = await mintAgentToken(agent.id);
            setSetup(applyMintedToken(setup, minted));
            setMintedTokenId(minted.token_id);
            persistTokenId(setup.project_id, minted.token_id);
            setHasSecret(true);
        }
        catch (err) {
            toast({
                title: t("agents.mintFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setMinting(false);
        }
    }
    async function handleRegenerate() {
        if (!setup)
            return;
        if (!window.confirm(t("agents.regenerateConfirm")))
            return;
        setMinting(true);
        try {
            const minted = await regenerateAgentToken(mintedTokenId, agent.id);
            setSetup(applyMintedToken(setup, minted));
            setMintedTokenId(minted.token_id);
            persistTokenId(setup.project_id, minted.token_id);
            setHasSecret(true);
        }
        catch (err) {
            toast({
                title: t("agents.mintFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setMinting(false);
        }
    }
    if (loading) {
        return (<div className="space-y-4 px-8 py-10 lg:px-12">
        <Skeleton className="h-24 w-full"/>
        <Skeleton className="h-48 w-full"/>
      </div>);
    }
    if (!displaySetup) {
        return (<div className="px-8 py-10 lg:px-12">
        <Card>
          <CardBody>
            <p className="text-sm text-muted">{t("agents.setupUnavailable")}</p>
          </CardBody>
        </Card>
      </div>);
    }
    const readyToMint = displaySetup.ready_to_mint ?? displaySetup.ready;
    const mcpJson = JSON.stringify(displaySetup.mcp_config, null, 2);
    const checkCommand = `npx ${displaySetup.cli_package} check --files src/payments/gateway.py\n# exit code 1 when the verdict is "block": wire it as a CI gate`;
    const agentChosen = chosenAgentId !== null;
    const isCiAgent = agent.mcpConfigPath === null;
    return (<div className="flex min-h-full flex-col gap-10 overflow-hidden px-8 py-10 lg:px-12">
      
      <Reveal>
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute -top-44 left-1/2 h-72 w-[560px] max-w-[90vw] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl" style={{
            background: "radial-gradient(closest-side, var(--db-primary), transparent 72%)",
        }}/>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-xl">
              <p className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
                {t("agents.title")}
              </p>
              <h1 className="mt-4 font-display text-[38px] font-semibold leading-[1.08] tracking-tight text-foreground">
                {t("agents.hero")}
              </h1>
              <p className="mt-3 max-w-lg text-sm text-muted">{t("agents.subtitle")}</p>
              
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {agentChosen && connected ? (<Button variant="primary" onClick={() => (ttbRef.current ?? ritualRef.current)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })}>
                    {t("ttb.title")}
                  </Button>) : (<Button variant="primary" onClick={() => ritualRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })}>
                    {t("agents.setupCta")}
                  </Button>)}
                <Button onClick={() => void runLiveTest()} disabled={liveTest.state === "running"}>
                  {liveTest.state === "running"
            ? t("agents.testing")
            : t("agents.testConnection")}
                </Button>
                {liveTest.state === "ok" ? (<span className="text-xs tabular-nums text-ok">
                    {t("agents.live")} · {liveTest.ms} ms · {liveTest.verdict}
                  </span>) : liveTest.state === "failed" ? (<span className="max-w-64 truncate text-xs text-danger">
                    {liveTest.message}
                  </span>) : null}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <StatusDot ok={displaySetup.token_valid} label={t("agents.token")}/>
                <StatusDot ok={Boolean(displaySetup.workspace_id)} label={t("agents.workspace")}/>
                <StatusDot ok={Boolean(displaySetup.project_id) || displaySetup.project_selected} label={t("agents.project")}/>
                <StatusDot ok={hookInstalled} label={t("agents.hook")}/>
              </div>
            </div>
            <div className="hidden shrink-0 lg:block">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </Reveal>

      
      <Reveal delay={0.06}>
        <div className="grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="order-1 space-y-4 lg:order-2" data-use-cases>
          <h2 className="text-sm font-medium text-foreground">{t("agents.useCases")}</h2>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {orderedUseCases(voice).map((useCase, index) => (<Reveal key={useCase.id} delay={0.1 + index * 0.06} className={cn("h-full", index === 0 && "sm:col-span-2 2xl:col-span-3")}>
                <UseCaseTeaser useCase={useCase} featured={index === 0} onOpen={() => setOpenUseCase(useCase.id)} t={t}/>
              </Reveal>))}
          </div>
          {orderedUseCases(voice).map((useCase) => (<UseCaseDialog key={useCase.id} useCase={useCase} setup={displaySetup} target={agent} connected={agentChosen && connected} open={openUseCase === useCase.id} onOpenChange={(isOpen) => {
                if (!isOpen)
                    setOpenUseCase(null);
            }} onInstallSkill={installSkill} onGoSetup={() => ritualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} t={t}/>))}
        </div>

        
        <div className="order-2 flex flex-col gap-8 lg:order-1">
        <Card data-hook-install className="order-2">
          <CardBody className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-lg space-y-1">
              <p className="text-sm font-medium text-foreground">
                {hookInstalled ? t("agents.hookInstalled") : t("agents.hook")}
              </p>
              <p className="text-xs text-muted">{t("agents.hookHint")}</p>
              <p className="text-[11px] text-faint">
                {hookManual ||
            t("agents.hookManual", { command: "./hooks/dont-break-pretooluse.py" })}
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={installHook}>
              {hookInstallButtonLabel(hookInstalled, t)}
            </Button>
          </CardBody>
        </Card>

        
        <div ref={ritualRef} className="order-1 scroll-mt-6">
          <Step n={1} done={agentChosen} title={t("agents.pickAgent")}>
            {!agentChosen ? (<p className="text-xs text-muted">{t("agents.pickAgentHint")}</p>) : null}
            <AgentPicker chosen={chosenAgentId} compact={agentChosen} t={t}/>
          </Step>

          {agentChosen ? (<Step n={2} done={connected} title={t("agents.stepCreateToken")}>
              {!displaySetup.token_valid ? (<p className="text-sm text-warn">{t("agents.mintNeedAuth")}</p>) : !displaySetup.project_id ? (<p className="text-sm text-warn">{t("agents.mintNeedProject")}</p>) : knownExisting ? (<div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-lg space-y-1">
                    <p className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok"/>
                      {t("agents.tokenExists")}
                    </p>
                    <p className="text-xs text-muted">{t("agents.regenerateHint")}</p>
                  </div>
                  <Button size="sm" variant="ghost" disabled={minting} onClick={() => void handleRegenerate()}>
                    {minting ? t("agents.minting") : t("agents.regenerate")}
                  </Button>
                </div>) : (<div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-lg text-xs text-muted">{t("agents.mintHint")}</p>
                  <div className="flex flex-wrap gap-2">
                    {!hasSecret ? (<Button variant="primary" size="sm" disabled={!readyToMint || minting} onClick={() => void handleMint()}>
                        {minting
                        ? t("agents.minting")
                        : t("agents.connectAgent", { name: agentName })}
                      </Button>) : (<Button size="sm" variant="ghost" disabled={minting} onClick={() => void handleRegenerate()}>
                        {minting ? t("agents.minting") : t("agents.regenerate")}
                      </Button>)}
                  </div>
                </div>)}
              {hasSecret ? <p className="text-xs text-warn">{t("agents.mintOnce")}</p> : null}
            </Step>) : null}

          {agentChosen && connected ? (<Step n={3} done={false} title={isCiAgent
                ? t("agents.stepAddConfigCli")
                : t("agents.stepAddConfig", { name: agentName })}>
              {isCiAgent ? (<>
                  <p className="text-xs text-muted">
                    {t("agents.cliHint", { pkg: displaySetup.cli_package })}
                  </p>
                  <CodeBlock code={displaySetup.cli_snippet} copyKey="cli-minted" t={t}/>
                  <p className="text-xs text-muted">{t("agents.ciGateHint")}</p>
                  <CodeBlock code={checkCommand} copyKey="check-minted" t={t}/>
                </>) : (<>
                  <p className="text-xs text-muted">
                    {agent.mcpConfigPath
                    ? t("agents.mcpHintFor", {
                        path: agent.mcpConfigPath,
                        pkg: displaySetup.mcp_package,
                    })
                    : t("agents.mcpHint", { pkg: displaySetup.mcp_package })}
                  </p>
                  <CodeBlock code={mcpJson} copyKey="mcp-minted" t={t}/>
                </>)}
            </Step>) : null}

          {agentChosen && connected && readyToMint ? (<div ref={ttbRef} className="scroll-mt-6">
              <Step n={4} done={false} title={t("agents.stepTryIt")} last>
                <TryToBreakIt setup={displaySetup} target={agent}/>
              </Step>
            </div>) : null}
        </div>
        </div>
        </div>
      </Reveal>

      {agentChosen && connected ? (<details className="group" data-tools-accordion>
          <summary className="cursor-pointer list-none rounded border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors duration-fast hover:border-line-strong">
            <span className="mr-2 inline-block text-xs text-faint group-open:hidden">+</span>
            <span className="mr-2 hidden text-xs text-faint group-open:inline-block">−</span>
            {t("agents.tools8")}
          </summary>
          <div className="mt-3 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title="MCP" actions={<Badge tone="neutral">{agent.label ?? t("agents.otherMcp")}</Badge>}/>
                <CardBody className="space-y-2">
                  <p className="text-xs text-muted">
                    {agent.mcpConfigPath
                ? t("agents.mcpHintFor", {
                    path: agent.mcpConfigPath,
                    pkg: displaySetup.mcp_package,
                })
                : t("agents.mcpHint", { pkg: displaySetup.mcp_package })}
                  </p>
                  <CodeBlock code={mcpJson} copyKey="mcp" t={t}/>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="CLI" actions={<Badge tone="neutral">shells · CI</Badge>}/>
                <CardBody className="space-y-2">
                  <p className="text-xs text-muted">
                    {t("agents.cliHint", { pkg: displaySetup.cli_package })}
                  </p>
                  <CodeBlock code={displaySetup.cli_snippet} copyKey="cli" t={t}/>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title={t("agents.ciGate")} actions={<Badge tone="danger">{t("agents.blockExit")}</Badge>}/>
              <CardBody className="space-y-2">
                <p className="text-xs text-muted">{t("agents.ciGateHint")}</p>
                <CodeBlock code={checkCommand} copyKey="check" t={t}/>
              </CardBody>
            </Card>
          </div>
        </details>) : null}
    </div>);
}
