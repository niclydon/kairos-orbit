# Coding CLI Integration Guide

This guide is for coding agents such as Codex, Claude Code, or similar local
developer CLIs. It explains how to run **KAIROS-ORBIT Lite** on accessible AI
conversation data without requiring a private database, workflow platform, or
custom ingestion stack.

KAIROS-ORBIT Lite is transcript-only. It can analyze exported conversations and
local transcript archives, then produce a Markdown operator-fluency report.

## What The Agent Should Do

When a user asks a coding CLI to run KAIROS-ORBIT Lite:

1. Explain that raw transcript data is sensitive and should stay local.
2. Inspect only user-approved directories or common local export locations.
3. Normalize discovered conversations into `schemas/message.schema.json`.
4. Run the deterministic scorer and Markdown reporter.
5. Present the report path, score summary, confidence, and data gaps.
6. Avoid committing raw normalized transcript files.

## Copy-Paste Prompt For Agents

Users can paste this into Codex, Claude Code, or a similar local agent:

```text
Use the KAIROS-ORBIT public repo to run KAIROS-ORBIT Lite on my local AI
conversation history. Start with a discovery-only scan of common export and
agent-history folders, show me the candidate files, then normalize approved
conversations into a private ignored JSONL file and generate a Markdown
Operator Fluency Report. Keep raw transcript data local, do not upload it, and
do not commit the normalized JSONL.
```

## Install

```bash
git clone https://github.com/niclydon/kairos-orbit.git
cd kairos-orbit
npm install
npm run build
```

## Run On Existing JSONL

If the user already has KAIROS-compatible JSONL:

```bash
node dist/cli.js report path/to/messages.jsonl --output kairos-report.md
```

For machine-readable scores:

```bash
node dist/cli.js score path/to/messages.jsonl > kairos-scores.json
```

## Collect And Normalize Local Conversation Data

The repo includes a dependency-free collector that looks for common transcript
and export shapes:

- KAIROS message JSONL.
- ChatGPT-style `conversations.json` exports.
- Generic JSON objects or arrays with `messages`.
- JSONL logs with `role`, `type`, `message`, `content`, or `text` fields.
- Plain text or Markdown transcripts with `User:` / `Assistant:` style role
  labels.

When optional workflow fields are present, the collector preserves them. That
means the same path can produce mostly Lite reports while still retaining Full
evidence for conversations that include tool names, artifacts, verification
events, or downstream links.

First inspect candidates without reading transcript content into the report:

```bash
node scripts/collect-lite-input.mjs --discover-only
```

Or inspect specific roots:

```bash
node scripts/collect-lite-input.mjs \
  --discover-only \
  --roots ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions
```

Then normalize into a private ignored JSONL file:

```bash
node scripts/collect-lite-input.mjs \
  --roots ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions \
  --out kairos-lite-input.jsonl.private
```

Run the report:

```bash
node dist/cli.js report kairos-lite-input.jsonl.private --output kairos-lite-report.md
```

The `.gitignore` excludes `*.jsonl.private`, `exports/`, `data/`, `private/`,
and `tmp/`. Keep raw transcript-derived files in those paths.

## One-Pass Local Command Sequence

For a fast local run after the user has approved common roots:

```bash
npm install
npm run build
node scripts/collect-lite-input.mjs \
  --roots ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions \
  --out kairos-lite-input.jsonl.private
node dist/cli.js report kairos-lite-input.jsonl.private --output kairos-lite-report.md
```

If the user only wants machine-readable scores:

```bash
node dist/cli.js score kairos-lite-input.jsonl.private > kairos-scores.json
```

## Expected Artifacts

The agent should usually create:

| File | Commit? | Purpose |
|---|---:|---|
| `kairos-lite-input.jsonl.private` | no | private normalized transcript messages |
| `kairos-lite-report.md` | user decides | human-readable report |
| `kairos-scores.json` | user decides | machine-readable scores |

Do not commit private normalized transcript files. A user may choose to commit a
sanitized report, but the agent should not assume that is safe.

## Agent Response Template

After running the report, the coding CLI should answer with:

```text
KAIROS-ORBIT Lite report generated.

Input:
- Candidate files scanned: <n>
- Conversations scored: <n>
- Sources: <source list>
- Date range: <range or unavailable>

Result:
- Operator Index: <score>
- Average confidence: <confidence>
- Strongest dimension: <dimension>
- Softest dimension: <dimension>

Artifacts:
- Normalized private JSONL: <path>
- Markdown report: <path>

Caveats:
- <data gap 1>
- <data gap 2>
```

## Implementation Notes

- Lite mode does not prove work shipped, tests passed, files changed, or output
  was accepted outside the conversation.
- Scores are exploratory and should be used for reflection, coaching, or
  longitudinal self-comparison.
- The reference scorer is deterministic and local. It does not call an LLM or
  upload transcript text.
- For Full mode, add workflow telemetry fields listed in
  `docs/data-requirements.md`.

## Troubleshooting

If no conversations are found:

- Ask the user for a ChatGPT or Claude export directory.
- Ask whether the coding agent can inspect `~/Downloads`, `~/Desktop`, or a
  specific archive folder.
- Ask the user to provide JSONL matching `schemas/message.schema.json`.

If scores look too low:

- Check whether the input is transcript-only.
- Check whether timestamps, assistant turns, and user turns were parsed.
- Review the Data Gaps section before interpreting scores.
- Compare against prior reports for the same person rather than against other
  people.

## Implementation Checklist For New Environments

If an organization wants to wire KAIROS-ORBIT Lite into its own environment:

1. Export or collect conversations into the message schema.
2. Preserve stable conversation IDs, message order, role, text, and timestamps.
3. Add optional workflow fields only when they are directly observable.
4. Run `node dist/cli.js score` for JSON output or `report` for Markdown.
5. Store raw transcripts separately from derived scores.
6. Surface confidence and data gaps anywhere scores are displayed.
