# Research Basis

KAIROS-ORBIT is a synthesis, not a claim of a newly validated instrument. This document lists the main research traditions that inform it and explains how they map to the framework.

## AI Literacy And AI Fluency

AI literacy research frames effective use of AI as more than technical prompting. It includes understanding what AI systems can do, communicating with them, evaluating outputs, and using them responsibly.

Relevant sources:

- Long, D., and Magerko, B. "What is AI Literacy? Competencies and Design Considerations." CHI 2020.
- UNESCO AI competency frameworks.
- Anthropic / Dakan / Feller AI Fluency Framework.

Framework mapping:

- Knowledge Grounding.
- Agency Design.
- Reflexive Calibration.
- Outcome Integration.

## Human Factors And Trust Calibration

Human factors research on automation emphasizes appropriate reliance. Good operators neither blindly trust nor reflexively reject automated systems. They calibrate trust based on task risk, system performance, and available evidence.

Relevant sources:

- Endsley, M. R. "Toward a Theory of Situation Awareness in Dynamic Systems."
- Lee, J. D., and See, K. A. "Trust in Automation: Designing for Appropriate Reliance."

Framework mapping:

- Instrumented Execution.
- Reflexive Calibration.
- Outcome Integration.

## Conversation Repair

Conversation analysis studies how people recover from trouble in interaction. AI collaboration often includes trouble sources: misunderstanding, missing context, incorrect output, failed tool calls, or overconfident claims.

Relevant source:

- Schegloff, E. A., Jefferson, G., and Sacks, H. "The Preference for Self-Correction in the Organization of Repair in Conversation."

Framework mapping:

- Reflexive Calibration.
- ORBIT Correction Style.
- ORBIT Repair Quality.

## Politeness, Power, And Social Stance

Computational politeness and interpersonal stance research provide ways to
study observable relational language: directness, deference, dominance, repair,
and social power. KAIROS-ORBIT uses this literature cautiously. The public
reference scorer does not treat warmth or politeness as inherently better than
terse operational command language.

Relevant sources:

- Danescu-Niculescu-Mizil et al. "A Computational Approach to Politeness with Application to Social Factors."
- Interpersonal circumplex literature on agency/dominance and communion/warmth.

Framework mapping:

- Social and Affective Stance.
- ORBIT Dominance / Agency.
- ORBIT Operational Friction.
- ORBIT Repair Utility.

## Emotion And Dialogue Corpora

Emotion and dialogue datasets provide useful caution: affect can be studied from language, but it is noisy and context-sensitive. KAIROS-ORBIT therefore treats sentiment as observable language evidence, not hidden emotion.

Relevant sources:

- GoEmotions.
- DailyDialog.
- EmpatheticDialogues.
- NRC Valence, Arousal, Dominance Lexicon.
- LIWC-related work.

Framework mapping:

- ORBIT Valence.
- ORBIT Arousal.
- Social and Affective Stance.

## Psychological Safety And Learning Behavior

Psychological safety research is not directly about AI tools, but it is useful by analogy: productive systems make it possible to surface errors, learn, and repair. KAIROS-ORBIT uses this carefully, without pretending an AI assistant is a human teammate.

Relevant source:

- Edmondson, A. "Psychological Safety and Learning Behavior in Work Teams."

Framework mapping:

- Reflexive Calibration.
- Social and Affective Stance.
- Outcome Integration.

## Important Boundary

KAIROS-ORBIT should be validated empirically before use in high-stakes settings. The current reference scorer is a transparent starting point for research, personal reflection, and tool-building.
