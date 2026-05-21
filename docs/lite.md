# KAIROS-ORBIT Lite

KAIROS-ORBIT Lite is the transcript-only version of the framework. It is for people who can export conversations from a chat assistant but do not have tool logs, file histories, commits, tickets, deployments, or workflow telemetry.

Lite mode is useful. It is simply narrower than Full mode.

## Suitable Data

Lite mode works with:

- Chat export JSON.
- CSV exports.
- Markdown transcript archives.
- Manually normalized JSONL.
- Any source that can provide conversation IDs, message roles, ordering, timestamps if available, and text.

It can work with one source. A person with only one chat history can still analyze how their interaction habits changed over time.

## What Lite Can Measure Well

Lite mode can credibly measure:

- Goal clarity.
- Context provision.
- Example provision.
- Format and style requests.
- Scope and boundary setting.
- Iteration and refinement.
- Verification requests.
- Corrections and missing-context detection.
- Conversational repair after wrong or incomplete answers.
- Social and affective stance in language.
- Trend changes over time, if timestamps exist.

## What Lite Measures Weakly

Lite mode has lower confidence for:

- Whether work actually shipped.
- Whether a test passed.
- Whether a tool really ran.
- Whether a file was edited.
- Whether a ticket, document, or deployment was created.
- Whether the user accepted or rejected the final result outside the chat.

Lite reports these as lower-confidence or inferred signals.

## Epistemic Guardrail

Lite mode must not treat absence of transcript evidence as evidence of absence.
A user may verify claims in a separate browser tab, run tests in another
terminal, check a source document, or integrate an output after the chat ends.
Those actions are invisible to transcript-only analysis unless the transcript
mentions them.

Therefore Lite reports should say:

> Missing verification, tool, artifact, or outcome evidence may reflect
> out-of-band work rather than absence of the behavior.

The reference reporter includes this caveat whenever Full-mode workflow
evidence is missing or partial.

## Lite Score Interpretation

A high Lite score means:

> The transcript shows strong observable compliance with AI workflow practices.

It does not necessarily mean:

> The work was successful in the outside world.

That distinction matters. Lite is a strong model for **conversation habits** and a weaker model for **workflow maturity**.

## Minimum JSONL

```json
{"source_platform":"chat_export","conversation_id":"demo-1","turn_id":"1","turn_index":0,"timestamp":"2026-01-01T12:00:00Z","role":"human","content_text":"I need a concise plan. Include risks and verification steps.","metadata":{}}
```

## Recommended Lite Workflow

1. Export conversations from one or more assistants.
2. Normalize into the message schema.
3. Run the scorer.
4. Review confidence and coverage.
5. Look at trends by month or quarter.
6. Use examples for reflection, not judgment.

For local coding agents, see [Agent quickstart](agent-quickstart.md). For a
Claude-compatible skill workflow, see [Claude skill](claude-skill.md).

## Lite Limitations

- It cannot infer hidden emotional state.
- It should not be used for employment decisions.
- It should not compare people unless data coverage is similar.
- It should not be treated as a validated psychometric score.
