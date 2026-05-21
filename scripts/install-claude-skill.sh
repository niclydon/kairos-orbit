#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/.claude/skills/kairos-orbit-lite"
target_dir="${1:-$HOME/.claude/skills/kairos-orbit-lite}"

if [[ ! -f "$source_dir/SKILL.md" ]]; then
  echo "Cannot find skill source at $source_dir" >&2
  exit 1
fi

mkdir -p "$target_dir"
cp -R "$source_dir"/. "$target_dir"/

echo "Installed KAIROS-ORBIT Lite skill to $target_dir"
