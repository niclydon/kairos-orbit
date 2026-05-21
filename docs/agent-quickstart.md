# Agent Quickstart

This page is written for coding agents and agent-like CLIs. If you are Codex,
Claude Code, another terminal agent, or an assistant operating in a local
workspace, follow this workflow to run **KAIROS-ORBIT Lite** for a user.

## Goal

Generate a local Markdown **KAIROS-ORBIT Operator Fluency Report** from AI
conversation transcripts the user can provide or that the agent can inspect with
permission.

Lite mode is transcript-only. It is useful for analyzing conversation habits,
but it does not prove that work shipped, tests passed, files changed, or
downstream outcomes happened.

## Minimal Agent Workflow

```bash
git clone https://github.com/niclydon/kairos-orbit.git
cd kairos-orbit
npm install
npm run build
```

If the user already has normalized KAIROS JSONL:

```bash
node dist/cli.js report path/to/messages.jsonl --output kairos-lite-report.md
```

If the user has local exports or transcript archives:

```bash
node scripts/collect-lite-input.mjs --discover-only
node dist/cli.js normalize \
  ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions \
  --output kairos-lite-input.jsonl.private
node dist/cli.js report kairos-lite-input.jsonl.private --output kairos-lite-report.md
```

## User Permission Script

Before scanning broadly, say something like:

```text
KAIROS-ORBIT Lite needs transcript data. I can inspect common local export
locations such as Downloads, Desktop, Claude Code project transcripts, and Codex
session archives, but those files may contain private content. I will first run
a discovery-only pass that lists candidate files without generating a report
from their contents. Then I will normalize only the approved candidates into a
private ignored JSONL file.
```

## What To Report Back

After the run, answer with:

```text
KAIROS-ORBIT Lite report generated.

Files:
- Normalized private input: kairos-lite-input.jsonl.private
- Markdown report: kairos-lite-report.md

Coverage:
- Candidate files scanned: <n>
- Conversations scored: <n>
- Sources: <source list>
- Date range: <date range or unavailable>

Results:
- Operator Index: <score>
- Average confidence: <confidence>
- Strongest dimension: <dimension>
- Softest dimension: <dimension>

Caveats:
- <data gap>
- <interpretation warning>
```

## Data Sources The Collector Can Handle

The collector is intentionally conservative and dependency-free. It can
normalize:

- KAIROS-compatible JSONL.
- ChatGPT-style `conversations.json`.
- Generic JSON files with top-level `messages` arrays.
- JSONL logs with common fields such as `role`, `content`, `text`, `message`,
  `conversation_id`, or `thread_id`.
- Plain text or Markdown transcripts using role prefixes like `User:` and
  `Assistant:`.

When optional workflow evidence fields are already present, the collector
preserves them:

- `tool_names`
- `has_tool_use`
- `tool_result_status`
- `files_referenced`
- `artifacts_created`
- `verification_events`
- `downstream_links`
- `human_feedback`

## Privacy Rules

- Do not upload raw transcript data.
- Do not commit normalized transcript files.
- Use `*.jsonl.private` for normalized transcript output.
- Keep raw exports in ignored folders such as `private/`, `exports/`, `data/`,
  or `tmp/`.
- If the user wants to publish results, publish only the report or aggregate
  scores after they review them.

## If The Report Looks Wrong

Check these first:

1. Were user and assistant roles parsed correctly?
2. Did the collector group messages into real conversations?
3. Were timestamps present?
4. Was the input transcript-only, causing Full-mode evidence to be absent?
5. Did the user provide only a small or narrow sample?

If parsing is wrong, create a small normalized JSONL file manually using
`schemas/message.schema.json`, run the report again, and tell the user which
source format needs a better adapter.
