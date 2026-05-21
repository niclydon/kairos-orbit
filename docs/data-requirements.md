# Data Requirements

KAIROS-ORBIT can be useful even when someone only has one AI conversation source, such as ChatGPT export history. The framework degrades by confidence: transcript-only data supports a narrower analysis, while workflow telemetry supports fuller applied fluency analysis.

## Minimum Data

Each message should include:

| Field | Required | Description |
|---|---:|---|
| `source_platform` | yes | Generic source label such as `chat_export`, `assistant_a`, `assistant_b`, or `workflow_agent` |
| `conversation_id` | yes | Stable conversation/thread/session ID |
| `turn_id` | yes | Stable message ID |
| `turn_index` | yes | Message order inside the conversation |
| `timestamp` | recommended | ISO timestamp if available |
| `role` | yes | `human`, `assistant`, `system`, or `tool` |
| `content_text` | yes | Message text |
| `metadata` | no | Extra platform-specific metadata |

With only these fields, KAIROS-ORBIT Lite can measure:

- Knowledge Grounding.
- Agency Design.
- Reflexive Calibration.
- Social and Affective Stance.
- Some inferred Instrumented Execution.
- Some inferred Outcome Integration.
- Trends over time if timestamps exist.

## Recommended Workflow Data

Full mode benefits from:

| Field | Description |
|---|---|
| `tool_names` | Names of tools/functions/commands used |
| `has_tool_use` | Whether a message involved tool use |
| `tool_result_status` | Success, failure, skipped, blocked |
| `files_referenced` | Files, documents, URLs, datasets, schemas |
| `artifacts_created` | Code, docs, reports, tickets, migrations |
| `verification_events` | Tests, smoke checks, citations, row counts |
| `downstream_links` | Commits, PRs, issues, deployments, documents |
| `human_feedback` | Accepted, rejected, revised, deferred |

## Single-Source Use

If a person only has ChatGPT or Claude data, the framework is still useful. It should be described as **KAIROS-ORBIT Lite**.

Lite mode can answer:

- Am I giving more context over time?
- Do I clarify goals or just issue fragments?
- Do I ask for verification?
- Do I catch wrong assumptions?
- Do I repair productively after bad answers?
- Is my interaction style becoming more frustrated, terse-but-effective, repair-oriented, or calibrated?
- Are my AI conversations becoming more outcome-oriented?

Lite mode should not overclaim:

- It cannot prove work shipped.
- It cannot prove tests passed.
- It cannot fully measure tool use unless tool details appear in the transcript.
- It cannot determine hidden emotion or intent.

## Suggested JSONL Format

See [schemas/message.schema.json](../schemas/message.schema.json).

One message per line:

```json
{"source_platform":"chatgpt","conversation_id":"demo-1","turn_id":"1","turn_index":0,"timestamp":"2026-01-01T12:00:00Z","role":"human","content_text":"I need a concise plan. Include risks and verification steps.","metadata":{}}
```

## Time Trends

Timestamps enable:

- Daily scores.
- 7-day rolling windows.
- 30-day current profile.
- 90-day baseline.
- All-time archive.

If timestamps are missing, the framework can still score conversations but cannot produce meaningful time trends.
