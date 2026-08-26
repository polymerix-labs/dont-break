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

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, "../src/i18n/locales");
const SENTENCES = {
    "fr-FR": {
        "overview.sentence.healthy": "Base solide. Tes règles sont appliquées à chaque édition d'agent.",
        "overview.sentence.healthy.tech": "Structure saine. Les règles actives sont appliquées à chaque check_change.",
        "overview.sentence.healthy.none": "Base solide, mais rien n'est encore protégé. Crée ta première règle.",
        "overview.sentence.healthy.none.tech": "Structure saine, aucune contrainte active. Épingle un nœud ou protège un chemin.",
        "overview.sentence.caution": "Certaines zones sont fragiles. Regarde les actions ci-dessous.",
        "overview.sentence.caution.tech": "Zones fragiles détectées. Passe en revue les actions de refactor ci-dessous.",
        "overview.sentence.caution.none": "Certaines zones sont fragiles et rien n'est protégé. Commence par une règle.",
        "overview.sentence.caution.none.tech": "Zones fragiles, aucune contrainte active. Protège d'abord les chemins à fort fan-in.",
        "overview.sentence.critical": "La structure est en danger. Attaque les actions ci-dessous.",
        "overview.sentence.critical.tech": "Risque structurel. Priorise les actions pour réduire le couplage.",
        "overview.sentence.critical.none": "La structure est en danger et rien n'est protégé. Protège d'abord les zones critiques.",
        "overview.sentence.critical.none.tech": "Risque structurel, aucune contrainte active. Protège les zones critiques avant que les agents n'éditent.",
        "overview.sentence.unknown": "Pas encore assez de données. Synchronise le projet pour obtenir un verdict.",
        "overview.sentence.unknown.tech": "Pas encore de snapshot d'architecture. Lance une sync pour calculer les scores.",
    },
    "de-DE": {
        "overview.sentence.healthy": "Solide Basis. Deine Regeln greifen bei jeder Agenten-Änderung.",
        "overview.sentence.healthy.tech": "Gesunde Struktur. Aktive Regeln greifen bei jedem check_change.",
        "overview.sentence.healthy.none": "Solide Basis, aber noch nichts geschützt. Erstelle deine erste Regel.",
        "overview.sentence.healthy.none.tech": "Gesunde Struktur, keine aktiven Constraints. Pinne einen Knoten oder schütze einen Pfad.",
        "overview.sentence.caution": "Einige Zonen sind fragil. Sieh dir die Aktionen unten an.",
        "overview.sentence.caution.tech": "Fragile Zonen erkannt. Prüfe die Refactor-Aktionen unten.",
        "overview.sentence.caution.none": "Einige Zonen sind fragil und nichts ist geschützt. Beginne mit einer Regel.",
        "overview.sentence.caution.none.tech": "Fragile Zonen, keine aktiven Constraints. Schütze zuerst die Pfade mit hohem Fan-in.",
        "overview.sentence.critical": "Die Struktur ist gefährdet. Geh die Top-Aktionen unten an.",
        "overview.sentence.critical.tech": "Strukturelles Risiko. Priorisiere die Aktionen, um Kopplung abzubauen.",
        "overview.sentence.critical.none": "Die Struktur ist gefährdet und nichts ist geschützt. Schütze zuerst die kritischen Zonen.",
        "overview.sentence.critical.none.tech": "Strukturelles Risiko, keine aktiven Constraints. Schütze kritische Zonen, bevor Agenten editieren.",
        "overview.sentence.unknown": "Noch nicht genug Daten. Synchronisiere das Projekt für ein Verdict.",
        "overview.sentence.unknown.tech": "Noch kein Architektur-Snapshot. Starte eine Sync, um die Scores zu berechnen.",
    },
    "es-ES": {
        "overview.sentence.healthy": "Base sólida. Tus reglas se aplican en cada edición del agente.",
        "overview.sentence.healthy.tech": "Estructura sana. Las reglas activas se aplican en cada check_change.",
        "overview.sentence.healthy.none": "Base sólida, pero nada está protegido aún. Crea tu primera regla.",
        "overview.sentence.healthy.none.tech": "Estructura sana, sin restricciones activas. Fija un nodo o protege una ruta.",
        "overview.sentence.caution": "Algunas zonas son frágiles. Mira las acciones de abajo.",
        "overview.sentence.caution.tech": "Zonas frágiles detectadas. Revisa las acciones de refactor de abajo.",
        "overview.sentence.caution.none": "Algunas zonas son frágiles y nada está protegido. Empieza con una regla.",
        "overview.sentence.caution.none.tech": "Zonas frágiles, sin restricciones activas. Protege primero las rutas con mayor fan-in.",
        "overview.sentence.critical": "La estructura está en riesgo. Ataca las acciones de abajo.",
        "overview.sentence.critical.tech": "Riesgo estructural. Prioriza las acciones para reducir el acoplamiento.",
        "overview.sentence.critical.none": "La estructura está en riesgo y nada está protegido. Protege primero las zonas críticas.",
        "overview.sentence.critical.none.tech": "Riesgo estructural, sin restricciones activas. Protege las zonas críticas antes de que los agentes editen.",
        "overview.sentence.unknown": "Aún no hay datos suficientes. Sincroniza el proyecto para obtener un veredicto.",
        "overview.sentence.unknown.tech": "Aún no hay snapshot de arquitectura. Ejecuta una sync para calcular las puntuaciones.",
    },
};
function formatBlock(entries) {
    return Object.entries(entries)
        .map(([k, v]) => `  "${k}":\n    ${JSON.stringify(v)},`)
        .join("\n");
}
const enContent = readFileSync(join(localesDir, "en.ts"), "utf8");
const EN_KEY_RE = /"(overview\.sentence\.[^"]+)":\s*\n?\s*("(?:[^"\\]|\\.)*")\s*,/g;
const enEntries = {};
for (const m of enContent.matchAll(EN_KEY_RE)) {
    enEntries[m[1]] = JSON.parse(m[2]);
}
if (Object.keys(enEntries).length !== 14) {
    console.error(`expected 14 EN sentence keys, got ${Object.keys(enEntries).length}`);
    process.exit(1);
}
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    content = content.replace(/[ \t]*"overview\.sentence\.[^"]+":\s*\n?\s*"(?:[^"\\]|\\.)*",\n/g, "");
    const block = formatBlock(SENTENCES[code] ?? enEntries);
    content = content.replace(/\n};\n\nexport default messages;/, `\n${block}\n};\n\nexport default messages;`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
