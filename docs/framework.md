# KAIROS-ORBIT Framework Specification

**Status:** public draft, v0.2
**Purpose:** audit observable structural compliance with AI workflow best practices from conversation and workflow data
**Primary modes:** transcript-only Lite mode and workflow-aware Full mode

## Summary

KAIROS-ORBIT is a candidate framework for auditing observable operator workflow patterns: how a person defines work for AI systems, supplies context, delegates tasks, verifies outputs, repairs errors, integrates results, and maintains operationally useful interaction under pressure.

The framework should not be read as a direct measure of hidden cognition,
personality, or general intelligence. The public reference engine is a
deterministic structural scorer. Its strongest claim is that the available data
shows more or less evidence of workflow practices associated with effective AI
collaboration.

The framework is a synthesis. The name is new, but the underlying constructs are grounded in established research areas:

- AI literacy and fluency.
- Human factors and trust calibration.
- Situation awareness.
- Conversation repair.
- Computational politeness.
- Emotion and valence/arousal/dominance analysis.
- Dialogue emotion and intention datasets.
- Psychological safety and learning behavior.

KAIROS-ORBIT is not currently a validated psychometric instrument. It should be used as an exploratory, auditable measurement model until validation studies are completed.

## KAIROS Dimensions

### Knowledge Grounding

Measures whether the operator gives the AI relevant background, constraints, examples, sources, files, schemas, logs, or domain context.

Typical evidence:

- "Use this schema."
- "The audience is..."
- "Here is an example of what good looks like."
- "Do not use external APIs."
- "Base this on the attached export."

### Agency Design

Measures whether the operator defines what role the AI should play and how much autonomy it has.

Typical evidence:

- Clear goal.
- Role framing: reviewer, researcher, implementation agent, critic.
- Scope and non-goals.
- Success criteria.
- Explicit collaboration style.

### Instrumented Execution

Measures whether the conversation connects to real actions, tools, artifacts, or verification mechanisms.

Typical evidence:

- Commands, tools, tests, file edits, queries, scripts.
- Generated code, docs, reports, tickets, migrations, plans.
- Verification requests or results.

In Lite mode this dimension is lower-confidence because chat exports often do not contain actual tool telemetry.

### Reflexive Calibration

Measures whether the operator challenges, corrects, verifies, or recalibrates trust in the AI.

Typical evidence:

- "Check that against the source."
- "That assumption is wrong."
- "What evidence supports that?"
- "Rerun the test."
- "We need to verify before using this."

### Outcome Integration

Measures whether AI output becomes accountable real-world work.

Typical evidence:

- Human review or decision boundary.
- Commit, pull request, document, ticket, report, deployment, or accepted plan.
- Provenance or traceability.
- Explicit final decision.

In Lite mode this is often inferred from language and should be reported with lower confidence.

### Social And Affective Stance

Measures whether the operator's interaction style helps or hurts the workflow:
directness, friction, escalation, correction utility, repair style,
responsibility language, and trust posture.

This dimension does not claim to know the user's hidden emotional state. It
does not reward politeness for its own sake, and it should not penalize terse,
high-density operational commands. Frustration is treated as a possible
workflow-breakdown signal only when it is not paired with useful repair,
evidence, or next-step control.

## ORBIT Submodel

ORBIT means **Operator Relational Bearing and Interaction Tone**.

It expands Social and Affective Stance into operationally useful signals:

- Friction: observable frustration, escalation, or morale pressure.
- Directiveness / agency: clear control of scope and next action.
- Command density: terse but information-rich instructions.
- Correction style: evidence-backed repair versus contemptuous correction.
- Repair quality: what happens after trouble.
- Trust calibration: neither blind trust nor blanket hostility.
- Moral / responsibility frame: privacy, safety, ownership, approval, and boundaries.

## Lite And Full Modes

### KAIROS-ORBIT Lite

Works from a single chat export such as ChatGPT or Claude.

Useful for:

- Prompting and context habits.
- Goal clarity.
- Verification requests.
- Iteration and correction.
- Social/affective stance in language.
- Trends over time.

Weak for:

- Actual tool execution.
- Whether outputs were used.
- Whether tests passed.
- Whether work shipped.

Lite mode must include an epistemic guardrail: absence of transcript-visible
verification, fact-checking, or outcome evidence is not evidence that those
actions did not happen. They may have occurred in another browser tab, terminal,
document, meeting, or review process. Lite reports should lower confidence and
state this gap explicitly rather than treating missing evidence as missing skill.

### KAIROS-ORBIT Full

Uses transcripts plus workflow telemetry.

Additional evidence:

- Tool calls.
- Tool results.
- File edits.
- Commands and tests.
- Commits, PRs, tickets, docs.
- Deployment or runtime checks.
- Human accept/reject decisions.

Full mode can measure applied workflow maturity more credibly than transcript-only mode.

## Research Lineage

Suggested sources for grounding and citation:

- Dakan and Feller / Anthropic AI Fluency Framework.
- Long and Magerko, "What is AI Literacy? Competencies and Design Considerations."
- UNESCO AI competency frameworks.
- Endsley, situation awareness in dynamic systems.
- Lee and See, trust in automation and appropriate reliance.
- Schegloff, Jefferson, and Sacks, repair in conversation.
- Danescu-Niculescu-Mizil et al., computational politeness.
- GoEmotions.
- DailyDialog.
- EmpatheticDialogues.
- NRC Valence, Arousal, Dominance Lexicon.
- Edmondson, psychological safety and learning behavior.

See [validation-protocol.md](validation-protocol.md) for how to move from framework proposal to validated instrument.
