# Scoring Model

This repository ships a deterministic v0 scorer. It is intentionally simple, auditable, and suitable for transcript-only data. It is not a validated final instrument.

## Overall Formula

```text
KAIROS score =
  0.18 * Knowledge Grounding
+ 0.18 * Agency Design
+ 0.20 * Instrumented Execution
+ 0.18 * Reflexive Calibration
+ 0.14 * Outcome Integration
+ 0.12 * Social and Affective Stance
```

Weights are starting values. They reflect three design choices:

- Tool-connected, evidence-backed work matters, so Instrumented Execution receives the highest weight.
- Context, agency, and calibration map strongly to existing AI literacy and fluency literature.
- Social/affective stance matters, but it is inference-sensitive, so it should not dominate until validated.

## Confidence

The scorer reports confidence separately from the score.

Confidence increases with:

- Enough human turns.
- Assistant context.
- Timestamps.
- Tool or artifact evidence.
- Low truncation.

Transcript-only data can still receive useful scores, but workflow dimensions should be interpreted cautiously.

## Opportunity Adjustment

Not every conversation offers the same chance to show every behavior.

Examples:

- A quick factual question may not need artifact production.
- A coding session should usually show verification.
- A personal reflection conversation may show strong social stance and calibration without tool use.

The reference scorer reports both:

- `kairos_score`
- `opportunity_adjusted_score`

## ORBIT Interpretation

The scorer treats directness as neutral by default.

Positive pattern:

```text
high agency + clear scope + evidence + repair + responsibility
```

Negative pattern:

```text
high dominance + contempt + no evidence + no repair path
```

The scorer does not diagnose hidden affect. It counts observable language markers and repair patterns.
