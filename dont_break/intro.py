# Copyright 2026 Polymerix
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

import sys
import time

FRAMES = [
    "fn authenticate() { return token; }",
    "fn authenticate() { → graph.build() }",
    "graph { nodes: 42, edges: 128 }",
    "    ●───●───●───●",
    "  ●───●───●───●───●",
    "    ●───●───●───●",
]


def play_intro() -> None:
    for frame in FRAMES:
        sys.stdout.write("\r\x1b[2K" + frame)
        sys.stdout.flush()
        time.sleep(0.35)
    sys.stdout.write("\n")
