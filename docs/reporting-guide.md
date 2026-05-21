# Reporting Guide

KAIROS-ORBIT reports should be clear about what was measured and what was not measured.

## Reference Report Generator

The public package includes a deterministic Markdown report generator:

```bash
npm run build
node dist/cli.js report examples/synthetic-chat.jsonl --output report.md
```

The command reads the same JSONL message input as the scorer, scores the conversations, and writes a human-readable report. If `--output` is omitted, the Markdown report is printed to stdout.

Supported format:

```bash
node dist/cli.js report examples/synthetic-chat.jsonl --format markdown
```

The report generator is intentionally conservative. It summarizes observable scores, confidence, coverage, interaction signals, and data gaps. It does not attempt psychological diagnosis or unsupported causal interpretation.

## Required Report Metadata

Every report should state:

- Framework version.
- Scorer version.
- Lite or Full mode.
- Number of conversations.
- Date range.
- Source count.
- Whether timestamps were available.
- Whether tool/workflow telemetry was available.
- Confidence.

## Suggested Report Sections

### Summary

Short description of overall score, confidence, and coverage.

### Dimension Profile

Show six dimension scores:

- Knowledge Grounding.
- Agency Design.
- Instrumented Execution.
- Reflexive Calibration.
- Outcome Integration.
- Social and Affective Stance.

### ORBIT Notes

Discuss:

- Operational friction markers.
- Correction style.
- Repair quality.
- Boundary/responsibility language.
- Whether terse commands are high-density and useful rather than merely abrupt.

Avoid psychological diagnosis. Keep language observational.

### Trends

If timestamps exist, include:

- Daily or weekly score chart.
- 30-day score.
- 90-day baseline.
- All-time archive.

Explain platform/source mix changes when relevant.

### Data Gaps

Examples:

- No tool telemetry.
- No downstream outcome evidence.
- Missing timestamps.
- Small sample size.
- One source only.
- Lite-only out-of-band uncertainty: verification may have happened elsewhere.

## Labeling Guidance

Avoid turning the score into a moral grade.

Better labels:

- Sparse evidence.
- Transcript-only.
- Contextual collaborator.
- Instrumented operator.
- Calibrated operator.

Use provisional labels until validation studies exist.

## Comparison Guidance

Safe comparisons:

- A person's current 30-day score versus their prior 90-day baseline.
- A person's transcript-only score before and after training.
- Dimension movement over time.

Risky comparisons:

- Comparing two people with different data coverage.
- Comparing transcript-only data to workflow telemetry.
- Comparing terse professional workflows to reflective personal chats without adjustment.
