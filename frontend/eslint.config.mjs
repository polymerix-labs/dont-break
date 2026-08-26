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

import globals from "globals";
const identityRules = {
    "no-undef": "error",
    "no-redeclare": "error",
    "no-const-assign": "error",
    "no-func-assign": "error",
    "no-import-assign": "error",
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-unreachable": "error",
    "no-unused-vars": ["warn", { args: "none" }],
};
const WORKERS = "public/nebula/workers/**/*.mjs";
const TESTS = "public/nebula/**/*.test.mjs";
export default [
    {
        files: ["public/nebula/**/*.mjs"],
        languageOptions: { ecmaVersion: 2023, sourceType: "module" },
        rules: identityRules,
    },
    {
        files: ["public/nebula/**/*.mjs"],
        ignores: [WORKERS, TESTS],
        languageOptions: { globals: globals.browser },
    },
    {
        files: [WORKERS],
        languageOptions: { globals: globals.worker },
    },
    {
        files: [TESTS],
        languageOptions: { globals: globals.node },
    },
];
