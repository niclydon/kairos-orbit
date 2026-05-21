# KAIROS-ORBIT Framework Card

## Intended Use

KAIROS-ORBIT is intended for:

- Personal reflection on AI collaboration habits.
- Research on human-AI interaction.
- Training and coaching analysis.
- Dashboarding AI collaboration trends.
- Comparing transcript-only and workflow-aware evidence coverage.

## Not Intended For

KAIROS-ORBIT is not intended for:

- Psychological diagnosis.
- Moral judgment of a person.
- Employment screening.
- High-stakes evaluation without validation.
- Secret monitoring of people.
- Comparing people with very different data coverage.

## Data Requirements

Lite mode:

- Conversation IDs.
- Message roles.
- Message order.
- Text.
- Timestamps for trends.

Full mode:

- Lite data plus tool calls, tool results, artifacts, verification events, and outcome links.

## Main Risks

- Over-interpreting sentiment markers.
- Treating directness as rudeness.
- Treating missing data as missing skill.
- Comparing transcript-only users to workflow-telemetry users.
- Ignoring source mix changes over time.
- Publishing sensitive transcripts.

## Required Disclosures In Reports

Reports should disclose:

- Lite or Full mode.
- Number of conversations.
- Date range.
- Source count.
- Confidence.
- Missing data.
- Framework version.
- Scorer version.

## Recommended Public Language

Use:

> "The score summarizes observable interaction patterns in the available data."

Avoid:

> "The score proves this person is good or bad at AI."

Use:

> "Social and affective stance is based on language markers and repair patterns."

Avoid:

> "The model knows how the person felt."
