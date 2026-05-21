# Scoring Model

This repository ships a deterministic reference scorer. It is intentionally
simple, auditable, and suitable for transcript-only data. It is not a validated
final instrument, and it should be described as auditing observable workflow
evidence rather than measuring hidden cognitive fluency.

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
- Social/affective stance matters when it changes workflow quality, but it is inference-sensitive, so it should not dominate until validated.

## Confidence

The scorer reports confidence separately from the score.

Confidence increases with:

- Enough human turns.
- Assistant context.
- Timestamps.
- Tool or artifact evidence.
- Low truncation.

Transcript-only data can still receive useful scores, but workflow dimensions should be interpreted cautiously.

Lite guardrail: missing transcript-visible verification, tool use, or outcome
integration should be treated as missing evidence, not proof that the operator
failed to verify or integrate the work. The reference report surfaces this as a
data-gap warning and lowers confidence when out-of-band actions are unobserved.

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

The scorer treats directness as neutral by default and can score terse,
high-density operational commands positively when they include scope, evidence,
repair, or next-action control. It does not reward warmth or politeness as an
end in itself.

Positive pattern:

```text
high agency + clear scope + evidence + repair + responsibility
```

Negative pattern:

```text
high dominance + contempt + no evidence + no repair path
```

The scorer does not diagnose hidden affect. It counts observable language
markers and repair patterns. Affect friction is interpreted as an operational
breakdown risk when it is not paired with evidence, verification, or a repair
path.

## Fuzzy Marker Matching And Gaming Resistance

The reference scorer does not rely on exact string equality alone. Marker
matching uses capped phrase detection, light stemming, and fuzzy token matching
so reasonable variants such as "validated", "verifying", or "implementation"
can be detected without requiring a single magic word.

This is only basic gaming resistance. It reduces brittle regex behavior and
caps repeated markers, but it is not equivalent to semantic embedding
validation. Reports should still be treated as exploratory, especially if the
input appears to be a scoring-template exercise rather than natural work.
