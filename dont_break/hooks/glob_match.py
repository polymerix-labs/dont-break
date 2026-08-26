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

"""Path glob matcher matching viewer-api `glob_match`.

`**` crosses directory separators; `*` and `?` stay within one segment.
No character classes. Recursion is over path segments of one file vs one
pattern, never over the file set.
"""

from __future__ import annotations


def glob_match(pattern: str, path: str) -> bool:
    return _match_segments(pattern.split("/"), path.split("/"))


def _match_segments(pattern: list[str], path: list[str]) -> bool:
    if not pattern:
        return not path
    if pattern[0] == "**":
        if _match_segments(pattern[1:], path):
            return True
        if not path:
            return False
        return _match_segments(pattern, path[1:])
    if not path:
        return False
    return _match_one_segment(pattern[0], path[0]) and _match_segments(
        pattern[1:], path[1:]
    )


def _match_one_segment(pattern: str, text: str) -> bool:
    if not pattern:
        return not text
    if pattern[0] == "*":
        if _match_one_segment(pattern[1:], text):
            return True
        if not text:
            return False
        return _match_one_segment(pattern, text[1:])
    if pattern[0] == "?":
        return bool(text) and _match_one_segment(pattern[1:], text[1:])
    return bool(text) and pattern[0] == text[0] and _match_one_segment(
        pattern[1:], text[1:]
    )
