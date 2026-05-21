---
name: kairos-orbit-lite
description: Run KAIROS-ORBIT Lite on local AI conversation exports and generate an operator fluency report.
---

# KAIROS-ORBIT Lite

Use this skill when the user wants to analyze AI conversation history,
understand AI operator fluency, run KAIROS-ORBIT Lite, or generate a
transcript-only KAIROS-ORBIT report.

## Safety Rules

- Keep raw transcript data local.
- Do not upload transcript text to external services.
- Do not commit raw exports or normalized transcript files.
- Prefer output names ending in `.jsonl.private` for normalized transcript data.
- Ask before scanning broad directories outside the current project or common
  export locations.
- Treat scores as exploratory evidence, not a grade, diagnosis, ranking, or
  employment assessment.

## Procedure

1. Locate the KAIROS-ORBIT repository.
   - If the current project contains `package.json` with name `kairos-orbit`,
     use it.
   - Otherwise, if allowed, clone `https://github.com/niclydon/kairos-orbit.git`
     into a temporary or user-approved directory.

2. Build the tools:

   ```bash
   npm install
   npm run build
   ```

3. Discover candidate transcript/export files before reading contents:

   ```bash
   node scripts/collect-lite-input.mjs --discover-only
   ```

   If the user supplied specific folders, use them:

   ```bash
   node scripts/collect-lite-input.mjs \
     --discover-only \
     --roots ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions
   ```

4. Normalize approved candidates to private JSONL:

   ```bash
   node scripts/collect-lite-input.mjs \
     --roots ~/Downloads ~/Desktop ~/.claude/projects ~/.codex/sessions \
     --out kairos-lite-input.jsonl.private
   ```

5. Generate the report:

   ```bash
   node dist/cli.js report kairos-lite-input.jsonl.private --output kairos-lite-report.md
   ```

6. Summarize results to the user:
   - conversations scored;
   - sources and date range;
   - Operator Index;
   - average confidence;
   - strongest and softest dimensions;
   - interaction signals;
   - data gaps and caveats;
   - paths to the private JSONL and Markdown report.

## What The Collector Understands

The collector can normalize:

- KAIROS-compatible JSONL;
- ChatGPT-style `conversations.json`;
- generic JSON exports with `messages`;
- JSONL logs with `role`, `type`, `message`, `content`, or `text`;
- Markdown/text transcripts with `User:` and `Assistant:` style role labels.

If the collector finds no useful conversations, ask the user for an export
directory or a JSONL file matching `schemas/message.schema.json`.

## Interpretation Guidance

Lite mode measures transcript-visible behavior. It can credibly describe
context provision, delegation clarity, verification requests, repair patterns,
and interaction tone. It cannot prove that work shipped, tests passed, tools
ran, or outputs were accepted outside the conversation.

For implementation details, read:

- `docs/coding-cli-integration.md`
- `docs/lite.md`
- `docs/data-requirements.md`
- `docs/reporting-guide.md`
- `docs/privacy.md`
