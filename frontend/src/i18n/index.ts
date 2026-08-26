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

import { useSyncExternalStore } from "react";
import { en, type Messages } from "./locales/en";
export const LOCALES = [
    { code: "en", label: "English" },
    { code: "zh-CN", label: "简体中文" },
    { code: "zh-TW", label: "繁體中文" },
    { code: "ja-JP", label: "日本語" },
    { code: "ko-KR", label: "한국어" },
    { code: "de-DE", label: "Deutsch" },
    { code: "fr-FR", label: "Français" },
    { code: "es-ES", label: "Español" },
    { code: "hi-IN", label: "हिन्दी" },
    { code: "pt-BR", label: "Português" },
    { code: "ru-RU", label: "Русский" },
    { code: "ar-SA", label: "العربية", rtl: true },
    { code: "fa-IR", label: "فارسی", rtl: true },
    { code: "he-IL", label: "עברית", rtl: true },
    { code: "it-IT", label: "Italiano" },
    { code: "pl-PL", label: "Polski" },
    { code: "nl-NL", label: "Nederlands" },
    { code: "tr-TR", label: "Türkçe" },
    { code: "uk-UA", label: "Українська" },
    { code: "vi-VN", label: "Tiếng Việt" },
    { code: "id-ID", label: "Bahasa Indonesia" },
    { code: "sv-SE", label: "Svenska" },
    { code: "el-GR", label: "Ελληνικά" },
    { code: "ro-RO", label: "Română" },
    { code: "cs-CZ", label: "Čeština" },
    { code: "fi-FI", label: "Suomi" },
    { code: "da-DK", label: "Dansk" },
    { code: "no-NO", label: "Norsk" },
    { code: "hu-HU", label: "Magyar" },
    { code: "th-TH", label: "ภาษาไทย" },
    { code: "uz-UZ", label: "Oʻzbekcha" },
    { code: "fil-PH", label: "Filipino" },
] as const;
export type LocaleCode = (typeof LOCALES)[number]["code"];
export type MessageKey = keyof Messages;
export const CATALOG_LOADERS: Record<LocaleCode, () => Promise<Messages>> = {
    en: () => Promise.resolve(en),
    "zh-CN": () => import("./locales/zh-CN").then((m) => m.default),
    "zh-TW": () => import("./locales/zh-TW").then((m) => m.default),
    "ja-JP": () => import("./locales/ja-JP").then((m) => m.default),
    "ko-KR": () => import("./locales/ko-KR").then((m) => m.default),
    "de-DE": () => import("./locales/de-DE").then((m) => m.default),
    "fr-FR": () => import("./locales/fr-FR").then((m) => m.default),
    "es-ES": () => import("./locales/es-ES").then((m) => m.default),
    "hi-IN": () => import("./locales/hi-IN").then((m) => m.default),
    "pt-BR": () => import("./locales/pt-BR").then((m) => m.default),
    "ru-RU": () => import("./locales/ru-RU").then((m) => m.default),
    "ar-SA": () => import("./locales/ar-SA").then((m) => m.default),
    "fa-IR": () => import("./locales/fa-IR").then((m) => m.default),
    "he-IL": () => import("./locales/he-IL").then((m) => m.default),
    "it-IT": () => import("./locales/it-IT").then((m) => m.default),
    "pl-PL": () => import("./locales/pl-PL").then((m) => m.default),
    "nl-NL": () => import("./locales/nl-NL").then((m) => m.default),
    "tr-TR": () => import("./locales/tr-TR").then((m) => m.default),
    "uk-UA": () => import("./locales/uk-UA").then((m) => m.default),
    "vi-VN": () => import("./locales/vi-VN").then((m) => m.default),
    "id-ID": () => import("./locales/id-ID").then((m) => m.default),
    "sv-SE": () => import("./locales/sv-SE").then((m) => m.default),
    "el-GR": () => import("./locales/el-GR").then((m) => m.default),
    "ro-RO": () => import("./locales/ro-RO").then((m) => m.default),
    "cs-CZ": () => import("./locales/cs-CZ").then((m) => m.default),
    "fi-FI": () => import("./locales/fi-FI").then((m) => m.default),
    "da-DK": () => import("./locales/da-DK").then((m) => m.default),
    "no-NO": () => import("./locales/no-NO").then((m) => m.default),
    "hu-HU": () => import("./locales/hu-HU").then((m) => m.default),
    "th-TH": () => import("./locales/th-TH").then((m) => m.default),
    "uz-UZ": () => import("./locales/uz-UZ").then((m) => m.default),
    "fil-PH": () => import("./locales/fil-PH").then((m) => m.default),
};
const STORAGE_KEY = "dont-break.locale";
function isLocaleCode(value: string): value is LocaleCode {
    return LOCALES.some((l) => l.code === value);
}
export type Voice = "simple" | "technical";
const VOICE_STORAGE_KEY = "dont-break.voice";
export function isVoice(value: unknown): value is Voice {
    return value === "simple" || value === "technical";
}
export function detectVoice(): Voice {
    try {
        const saved = window.localStorage.getItem(VOICE_STORAGE_KEY);
        if (saved && isVoice(saved))
            return saved;
    }
    catch {
    }
    return "simple";
}
export function detectLocale(): LocaleCode {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && isLocaleCode(saved))
            return saved;
    }
    catch {
    }
    const candidates = navigator.languages ?? [navigator.language];
    for (const raw of candidates) {
        if (!raw)
            continue;
        const tag = raw.toLowerCase();
        const exact = LOCALES.find((l) => l.code.toLowerCase() === tag);
        if (exact)
            return exact.code;
        const base = tag.split("-")[0];
        if (base === "zh") {
            return tag.includes("tw") || tag.includes("hk") || tag.includes("hant")
                ? "zh-TW"
                : "zh-CN";
        }
        const byBase = LOCALES.find((l) => l.code.toLowerCase().startsWith(`${base}-`));
        if (byBase)
            return byBase.code;
        if (base === "en")
            return "en";
    }
    return "en";
}
type I18nState = {
    locale: LocaleCode;
    messages: Messages;
    voice: Voice;
};
let state: I18nState = { locale: "en", messages: en, voice: "simple" };
const listeners = new Set<() => void>();
function emit() {
    for (const listener of listeners)
        listener();
}
function applyDocumentAttributes(locale: LocaleCode) {
    const meta = LOCALES.find((l) => l.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta && "rtl" in meta && meta.rtl ? "rtl" : "ltr";
}
export async function setLocale(locale: LocaleCode): Promise<void> {
    try {
        window.localStorage.setItem(STORAGE_KEY, locale);
    }
    catch {
    }
    const messages = await CATALOG_LOADERS[locale]();
    state = { ...state, locale, messages };
    applyDocumentAttributes(locale);
    emit();
}
export function setVoice(voice: Voice): void {
    try {
        window.localStorage.setItem(VOICE_STORAGE_KEY, voice);
    }
    catch {
    }
    state = { ...state, voice };
    emit();
}
export function initI18n(): void {
    state = { ...state, voice: detectVoice() };
    const locale = detectLocale();
    if (locale === "en") {
        applyDocumentAttributes("en");
        return;
    }
    void setLocale(locale).catch(() => {
        state = { ...state, locale: "en", messages: en };
        applyDocumentAttributes("en");
        emit();
    });
}
export function getLocale(): LocaleCode {
    return state.locale;
}
export function getVoice(): Voice {
    return state.voice;
}
export function translate(key: MessageKey, params?: Record<string, string | number>): string {
    const techKey = `${key}.tech` as MessageKey;
    const template = (state.voice === "technical"
        ? state.messages[techKey] ?? en[techKey]
        : undefined) ??
        state.messages[key] ??
        en[key];
    if (!params)
        return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match);
}
function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
function getSnapshot(): I18nState {
    return state;
}
export type TFunc = typeof translate;
export function useT(): TFunc {
    useSyncExternalStore(subscribe, getSnapshot);
    return translate;
}
export function useLocale(): LocaleCode {
    return useSyncExternalStore(subscribe, getSnapshot).locale;
}
export function useVoice(): Voice {
    return useSyncExternalStore(subscribe, getSnapshot).voice;
}
