# Implementation Guide

This guide explains how to implement KAIROS-ORBIT without relying on any private infrastructure.

## Architecture

A simple implementation has four layers:

1. **Raw export**
   - Original chat export or workflow export.
   - Kept local and private.

2. **Normalized messages**
   - JSONL matching `schemas/message.schema.json`.
   - One row per message.
   - Optional Full-mode fields for tools, artifacts, and outcomes.

3. **Conversation scores**
   - JSON matching `schemas/conversation-score.schema.json`.
   - One score per `(source_platform, conversation_id)`.

4. **Trend rollups**
   - Daily, weekly, monthly, 30-day, 90-day, or all-time aggregates.

## Lite Pipeline

```text
chat export -> normalize messages -> score conversations -> aggregate trends
```

Lite needs only transcript text and roles. It is the recommended default for public adoption because it matches what most people can actually export.

Use the native parser CLI when possible:

```bash
node dist/cli.js normalize path/to/export-or-folder --output kairos-lite-input.jsonl.private
```

The parser modules live under `src/parsers/` and provide deterministic adapters
for ChatGPT-style exports, Claude-like JSON exports, generic JSON/JSONL rows,
and role-prefixed Markdown/text transcripts. Do not rely on an LLM to invent a
new mapping at runtime unless these deterministic adapters fail and the user has
approved a new adapter design.

## Full Pipeline

```text
chat/tool/workflow export -> normalize messages -> attach workflow evidence -> score conversations -> aggregate trends
```

Full mode should only use factual telemetry. Do not invent tool use from language alone.

## Normalization Rules

- Preserve message order.
- Preserve roles.
- Exclude or mark system/developer messages.
- Do not merge unrelated conversations.
- Do not invent timestamps.
- Use generic source labels when publishing examples.
- Redact secrets and private third-party information.

## Trend Rollups

Recommended windows:

- 7 days.
- 30 days.
- 90 days.
- All-time.

Recommended aggregate:

```text
window_score =
  sum(conversation_score * confidence)
  / sum(confidence)
```

For research, also report unweighted means and sample size.

## Minimum Report

A useful report should include:

- Overall KAIROS score.
- Opportunity-adjusted score.
- Confidence.
- Six dimension scores.
- Lite or Full coverage label.
- Conversation count.
- Date range.
- Strongest dimensions.
- Weakest dimensions.
- Cautions about missing data.

## Public Deployment Checklist

Before publishing results:

- Remove raw transcripts.
- Remove private names and identifiers.
- Replace real platform labels with generic labels if needed.
- Report aggregate statistics.
- Use synthetic examples.
- Include limitations.
- State whether the analysis is Lite or Full.
