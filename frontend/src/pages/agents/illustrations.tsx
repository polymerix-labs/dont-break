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

import { cn } from "../../design";
type SceneProps = {
    className?: string;
};
const scene = (viewBox: string, paths: React.ReactNode) => function Scene({ className }: SceneProps) {
    return (<svg viewBox={viewBox} fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
        {paths}
      </svg>);
};
export const HeroIllustration = scene("0 0 230 150", <>
    
    <g stroke="var(--db-faint)">
      <rect x="16" y="56" width="40" height="30" rx="7"/>
      <path d="M36 56v-9M30 47h12"/>
      <circle cx="28" cy="70" r="1.6" fill="var(--db-faint)" stroke="none"/>
      <circle cx="44" cy="70" r="1.6" fill="var(--db-faint)" stroke="none"/>
      <path d="M62 66h34" strokeDasharray="3 5"/>
      <path d="M62 80c14 10 24 16 34 20" strokeDasharray="3 5"/>
    </g>
    
    <g stroke="var(--db-primary)">
      <path d="M130 30l26 10v19c0 15-11 26-26 32-15-6-26-17-26-32V40l26-10Z"/>
      <path d="M119 60l8 8 15-15"/>
    </g>
    
    <g stroke="var(--db-zone-core)">
      <path d="M100 96l6-4M98 104l7-1"/>
    </g>
    
    <g stroke="var(--db-faint)">
      <circle cx="186" cy="52" r="5.5"/>
      <circle cx="208" cy="78" r="4.5"/>
      <circle cx="184" cy="104" r="5"/>
      <circle cx="207" cy="120" r="3.5"/>
      <path d="M190 56l14 18M204 82l-16 18M189 108l14 10"/>
      <path d="M158 52h22M158 78h45" strokeDasharray="2 4"/>
    </g>
  </>);
export const ProtectScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <rect x="18" y="14" width="44" height="60" rx="4"/>
      <path d="M26 26h28M26 34h28M26 42h18"/>
      <circle cx="32" cy="58" r="7"/>
      <path d="M29 58h6M32 55v6"/>
      <path d="M138 20c-8 5-13 9-18 14" strokeDasharray="3 4"/>
      <path d="M124 30l-4 4 5.5-.5"/>
    </g>
    <g stroke="var(--db-primary)">
      <path d="M96 22l24 9v16c0 14-10 23-24 28-14-5-24-14-24-28V31l24-9Z"/>
      <path d="M85 46l8 8 15-16"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <path d="M116 44l6-3M117 52l6 1"/>
    </g>
  </>);
export const DangerScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <circle cx="40" cy="68" r="6"/>
      <circle cx="78" cy="74" r="6"/>
      <circle cx="114" cy="66" r="6"/>
      <path d="M68 42 44 63M76 44l2 24M82 42l28 20"/>
      <path d="M16 84h118" strokeDasharray="2 5"/>
    </g>
    <g stroke="var(--db-primary)">
      <circle cx="75" cy="32" r="12"/>
      <path d="M70 27l5 6-4 5M78 26l2 5"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <path d="M116 14l9 16h-18l9-16Z"/>
      <path d="M116 20v5"/>
      <circle cx="116" cy="27.6" r="0.5" fill="var(--db-zone-core)" stroke="none"/>
    </g>
  </>);
export const ImpactScene = scene("0 0 150 90", <>
    <g stroke="var(--db-primary)">
      <circle cx="75" cy="45" r="5"/>
      <circle cx="75" cy="45" r="1" fill="var(--db-primary)" stroke="none"/>
      <circle cx="75" cy="45" r="16"/>
    </g>
    <g stroke="var(--db-faint)">
      <circle cx="75" cy="45" r="28" opacity="0.8"/>
      <circle cx="75" cy="45" r="40" strokeDasharray="4 6" opacity="0.6"/>
      <circle cx="117" cy="30" r="5"/>
      <circle cx="34" cy="60" r="5"/>
      <circle cx="106" cy="72" r="4.5"/>
      <path d="M92 39l18-7M60 52l-19 6M87 58l13 10"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <path d="M122 18l4-4M126 22l4-1"/>
    </g>
  </>);
export const MapScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <path d="M22 22l34-9 32 9 36-9v56l-36 9-32-9-34 9V22Z"/>
      <path d="M56 13v56M88 22v56" opacity="0.5"/>
    </g>
    <g stroke="var(--db-primary)">
      <path d="M32 62c14-16 28 2 42-12 9-9 20-8 34-18" strokeDasharray="4 5"/>
      <circle cx="32" cy="62" r="2.4" fill="var(--db-primary)" stroke="none"/>
      <path d="M104 26l8 8M112 26l-8 8"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <circle cx="74" cy="50" r="4"/>
    </g>
  </>);
export const HealthScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <rect x="26" y="14" width="98" height="56" rx="6"/>
      <path d="M64 70l-4 10M86 70l4 10M52 80h46"/>
      <path d="M34 24h20" opacity="0.6"/>
    </g>
    <g stroke="var(--db-primary)">
      <path d="M34 50h16l7-17 10 28 8-20 5 9h34"/>
    </g>
    <g stroke="var(--db-ok)">
      <path d="M108 24c2.6-3 7-1.6 7 1.8 0 2.7-3.5 5-7 7.6-3.5-2.6-7-4.9-7-7.6 0-3.4 4.4-4.8 7-1.8Z"/>
    </g>
  </>);
export const FixesScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <path d="M28 74h94M28 74V22"/>
      <path d="M40 56c16-10 34-18 58-24" strokeDasharray="3 5"/>
      <path d="M92 30l6 2 .5 6"/>
    </g>
    <g stroke="var(--db-primary)">
      <rect x="42" y="56" width="14" height="18" rx="2"/>
      <rect x="68" y="44" width="14" height="30" rx="2"/>
      <rect x="94" y="30" width="14" height="44" rx="2"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <path d="M101 14v10M96 19h10"/>
    </g>
  </>);
export const PrecommitScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <rect x="18" y="16" width="114" height="58" rx="6"/>
      <path d="M18 28h114" opacity="0.6"/>
      <circle cx="26" cy="22" r="1.3"/>
      <circle cx="33" cy="22" r="1.3"/>
      <circle cx="40" cy="22" r="1.3"/>
      <path d="M28 42h34M28 52h22" opacity="0.7"/>
    </g>
    <g stroke="var(--db-primary)">
      <path d="M96 34l16 6v11c0 9-6.5 15-16 19-9.5-4-16-10-16-19V40l16-6Z"/>
      <path d="M89 50l5 5 10-10"/>
    </g>
    <g stroke="var(--db-danger)">
      <path d="M56 62h16" strokeDasharray="3 4"/>
      <path d="M66 58l6 4-6 4"/>
    </g>
  </>);
export const PathScene = scene("0 0 150 90", <>
    <g stroke="var(--db-primary)">
      <circle cx="24" cy="62" r="7"/>
      <circle cx="126" cy="28" r="7"/>
      <path d="M31 58c10-4 16-6 26-8M67 46c8-3 14-6 22-9M99 34c7-2 12-3 20-5"/>
      <path d="M52 51l6-1-2 5"/>
      <path d="M85 38l6-2-2 6"/>
    </g>
    <g stroke="var(--db-faint)">
      <circle cx="61" cy="48" r="5"/>
      <circle cx="93" cy="36" r="5"/>
      <path d="M24 40c8 4 14 8 20 14M126 52c-8-4-14-8-20-12" strokeDasharray="2 4" opacity="0.7"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <circle cx="61" cy="48" r="9" strokeDasharray="3 4"/>
    </g>
  </>);
export const ReviewScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <rect x="26" y="14" width="52" height="62" rx="4"/>
      <path d="M34 26h24M34 56h28M34 66h18" opacity="0.7"/>
    </g>
    <g stroke="var(--db-ok)">
      <path d="M34 36h20M31 36v0M30 33v6M27 36h6"/>
    </g>
    <g stroke="var(--db-danger)">
      <path d="M34 46h24M27 46h4"/>
    </g>
    <g stroke="var(--db-primary)">
      <path d="M84 46c10-2 18-4 26-8" strokeDasharray="3 4"/>
      <circle cx="118" cy="34" r="7"/>
      <path d="M111 45a14 14 0 0 0 20-8" opacity="0.8"/>
      <path d="M104 52a24 24 0 0 0 32-12" opacity="0.5"/>
    </g>
  </>);
export const OnboardScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <circle cx="46" cy="70" r="5"/>
      <circle cx="112" cy="66" r="5"/>
      <circle cx="120" cy="22" r="4"/>
      <path d="M51 67l14-8M108 63l-14-6M116 26l-12 10" strokeDasharray="2 4"/>
    </g>
    <g stroke="var(--db-primary)">
      <circle cx="78" cy="42" r="22"/>
      <path d="M78 24v5M78 55v5M60 42h5M91 42h5" opacity="0.8"/>
      <path d="M70 50l6-14 8-4-6 14-8 4Z"/>
    </g>
    <g stroke="var(--db-zone-core)">
      <path d="M46 18v8M42 22h8"/>
    </g>
  </>);
export const CiScene = scene("0 0 150 90", <>
    <g stroke="var(--db-faint)">
      <path d="M12 50h36"/>
      <circle cx="22" cy="50" r="3"/>
      <circle cx="36" cy="50" r="3"/>
      <path d="M104 50h34M132 46l6 4-6 4"/>
    </g>
    <g stroke="var(--db-primary)">
      <rect x="58" y="26" width="36" height="48" rx="5"/>
      <path d="M66 48l8 8 14-16"/>
    </g>
    <g stroke="var(--db-danger)">
      <path d="M48 64c6 8 10 12 16 16" strokeDasharray="3 4"/>
      <path d="M66 78l8 8M74 78l-8 8"/>
    </g>
  </>);
