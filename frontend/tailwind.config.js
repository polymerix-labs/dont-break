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

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "var(--db-background)",
                surface: "var(--db-surface)",
                overlay: "var(--db-overlay)",
                inset: "var(--db-inset)",
                line: "var(--db-border)",
                "line-strong": "var(--db-border-strong)",
                foreground: "var(--db-foreground)",
                muted: "var(--db-muted)",
                faint: "var(--db-faint)",
                primary: {
                    DEFAULT: "var(--db-primary)",
                    hover: "var(--db-primary-hover)",
                    active: "var(--db-primary-active)",
                    subtle: "var(--db-primary-subtle)",
                },
                ok: { DEFAULT: "var(--db-ok)", subtle: "var(--db-ok-subtle)" },
                warn: { DEFAULT: "var(--db-warn)", subtle: "var(--db-warn-subtle)" },
                danger: { DEFAULT: "var(--db-danger)", subtle: "var(--db-danger-subtle)" },
                "zone-core": { DEFAULT: "var(--db-zone-core)", subtle: "var(--db-zone-core-subtle)" },
                "zone-halo": { DEFAULT: "var(--db-zone-halo)", subtle: "var(--db-zone-halo-subtle)" },
                accent: "var(--db-primary)",
                accent2: "var(--db-ok)",
            },
            borderRadius: {
                sm: "var(--db-radius-sm)",
                DEFAULT: "var(--db-radius)",
                lg: "var(--db-radius-lg)",
            },
            transitionDuration: {
                fast: "120ms",
                DEFAULT: "160ms",
                slow: "200ms",
            },
            transitionTimingFunction: {
                DEFAULT: "cubic-bezier(0.25, 0.6, 0.3, 1)",
            },
            fontFamily: {
                sans: [
                    "Inter Variable",
                    "Inter",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "sans-serif",
                ],
                display: [
                    "Space Grotesk Variable",
                    "Space Grotesk",
                    "Inter Variable",
                    "sans-serif",
                ],
                mono: [
                    "SF Mono",
                    "JetBrains Mono",
                    "ui-monospace",
                    "Menlo",
                    "monospace",
                ],
            },
            fontSize: {
                xs: ["12px", { lineHeight: "17px" }],
                sm: ["13.5px", { lineHeight: "20px" }],
                base: ["15px", { lineHeight: "22px" }],
                lg: ["18px", { lineHeight: "26px" }],
                xl: ["26px", { lineHeight: "32px" }],
            },
        },
    },
    plugins: [],
};
