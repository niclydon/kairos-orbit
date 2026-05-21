# Validation Protocol

KAIROS-ORBIT is a proposed measurement framework. To become a validated instrument, it needs empirical validation.

## Phase 1: Construct Review

Ask reviewers from:

- Human-computer interaction.
- AI literacy or education research.
- Computational linguistics.
- Human factors / automation trust.
- Organizational psychology.
- Applied AI operations.

Questions:

- Are the six KAIROS dimensions distinct?
- Does ORBIT measure observable stance without anthropomorphic overreach?
- Are the weights defensible?
- What important behaviors are missing?

## Phase 2: Annotation Rubric

Create a human annotation guide with:

- Definitions.
- Positive and negative examples.
- Ambiguous cases.
- Platform caveats.
- Opportunity rules.
- Privacy-safe sampling.

## Phase 3: Human Coding

Use multiple annotators and report:

- Cohen's kappa for binary labels.
- Krippendorff's alpha for ordinal scores.
- Disagreement analysis.
- Rubric revisions.

Do not treat model-generated labels as ground truth.

## Phase 4: Feature Calibration

Compare:

- Deterministic features.
- Human annotations.
- Optional model-assisted labels.
- Existing AI fluency scores if available.

Report precision, recall, and calibration error by platform and task type.

## Phase 5: Criterion Validation

Test whether scores predict external outcomes:

- Task completion.
- Lower rework.
- Successful tests.
- Higher quality artifacts.
- Human-rated usefulness.
- Better provenance and review quality.

## Phase 6: Bias And Robustness Checks

Check:

- Platform mix effects.
- Conversation length confounds.
- Terse versus expressive user style.
- Work versus personal conversation differences.
- Recency and source coverage.

Until these studies are complete, scores should be labeled exploratory.
