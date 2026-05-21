# KAIROS-ORBIT

## KAIROS-ORBIT Operator Fluency Report

A longitudinal view of how effectively the operator collaborates with AI systems across planning, execution, verification, repair, and outcome integration.

KAIROS-ORBIT is a research-grounded framework for analyzing how people collaborate with AI systems over time. It is designed to work at two levels:

- **Lite**: transcript-only analysis for ordinary chat exports.
- **Full**: workflow-aware analysis when transcripts can be joined to tool, artifact, verification, and outcome telemetry.

The framework is intentionally data-agnostic. This repository includes only public documentation, schemas, synthetic examples, and deterministic reference tools. It does not include private transcripts, personal datasets, private infrastructure names, or platform-specific internal system details.

## What It Measures

KAIROS is the full operator fluency model:

- **K**nowledge Grounding: context, examples, sources, constraints.
- **A**gency Design: goals, roles, scope, success criteria.
- **I**nstrumented Execution: tools, artifacts, commands, verification actions.
- **R**eflexive Calibration: correction, fact-checking, missing-context detection, trust calibration.
- **O**utcome Integration: review, provenance, durable decisions or artifacts.
- **S**ocial and Affective Stance: collegiality, frustration, dominance/warmth, repair style, responsibility boundaries.

ORBIT is the social/affective submodel:

**Operator Relational Bearing and Interaction Tone**.

It focuses on observable language and interaction patterns. It is not a diagnosis of personality, mood, morality, or mental health.

## Quick Start

Install dependencies and run the Lite synthetic example:

```bash
npm install
npm run build
npm run score -- examples/synthetic-chat.jsonl
```

Run the Full synthetic example:

```bash
npm run score -- examples/synthetic-full-workflow.jsonl
```

Generate a Markdown report:

```bash
npm run report -- examples/synthetic-chat.jsonl --output report.md
```

Collect local transcript/export files into KAIROS Lite JSONL, then report:

```bash
npm run collect:lite -- --discover-only
npm run collect:lite -- --roots ~/Downloads ~/.claude/projects ~/.codex/sessions --out kairos-lite-input.jsonl.private
npm run report -- kairos-lite-input.jsonl.private --output kairos-lite-report.md
```

The CLI expects JSONL with one message per line. Full-mode fields are optional extensions on the same message schema. See [schemas/message.schema.json](schemas/message.schema.json).

## Input Example

```json
{"source_platform":"chat_export","conversation_id":"demo-1","turn_id":"1","turn_index":0,"timestamp":"2026-01-01T12:00:00Z","role":"human","content_text":"I need a concise plan for migrating this endpoint. Use bullets, call out risks, and include how to verify it.","metadata":{}}
```

## Outputs

The scorer returns conversation-level KAIROS-ORBIT scores:

```json
{
  "conversation_id": "demo-1",
  "kairos_score": 0.61,
  "confidence": 0.74,
  "subscores": {
    "knowledge_grounding": 0.65,
    "agency_design": 0.8,
    "instrumented_execution": 0.45,
    "reflexive_calibration": 0.55,
    "outcome_integration": 0.4,
    "social_affective_stance": 0.82
  }
}
```

Scores are exploratory. Treat them as structured evidence for reflection or research, not as a validated psychometric instrument.

## Report Output

The report generator produces a Markdown KAIROS-ORBIT Operator Fluency Report with:

- summary metadata, mode mix, source count, date range, score, Operator Index, and confidence;
- six-dimension profile with research-facing descriptions;
- interaction signal rates for verification, artifacts, corrections, corrections with verification, and affect friction;
- highlights, data gaps, and interpretation notes.

```bash
npm run build
node dist/cli.js report examples/synthetic-chat.jsonl --output report.md
```

The report is designed for human review. Use the JSON scorer output when you need machine-readable results or downstream analytics.

## Coding CLI And Claude Skill

This repository is designed to be usable by coding CLIs such as Codex and Claude
Code. The integration guide explains how an agent should discover local exports,
normalize transcript data, run the Lite scorer, and explain the resulting report
to the user:

- [Coding CLI integration guide](docs/coding-cli-integration.md)
- [Claude skill installation and usage](docs/claude-skill.md)

The repo also includes a Claude-compatible project skill:

```text
.claude/skills/kairos-orbit-lite/SKILL.md
```

When Claude Code is opened in this repo, the skill can be invoked with:

```text
/kairos-orbit-lite
```

To install it as a personal Claude Code skill:

```bash
npm run skill:install
```

## Documentation

- [Framework specification](docs/framework.md)
- [Data requirements](docs/data-requirements.md)
- [Lite framework](docs/lite.md)
- [Full framework](docs/full.md)
- [Coding CLI integration guide](docs/coding-cli-integration.md)
- [Claude skill guide](docs/claude-skill.md)
- [Scoring model](docs/scoring-model.md)
- [Implementation guide](docs/implementation-guide.md)
- [Reporting guide](docs/reporting-guide.md)
- [Data collection prompts](docs/prompts.md)
- [Research basis](docs/research-basis.md)
- [Framework card](docs/framework-card.md)
- [FAQ](docs/faq.md)
- [Validation protocol](docs/validation-protocol.md)
- [Privacy guide](docs/privacy.md)

## Repository Boundary

This repo is public-safe by design:

- No private transcripts.
- No personal data.
- No credentials.
- No internal platform, host, repository, or infrastructure names.
- Synthetic examples only.
- Deterministic scorer only; no third-party API calls.

## License

MIT. See [LICENSE](LICENSE).
