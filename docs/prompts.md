# Data Collection Prompts

These prompts help someone prepare data for KAIROS-ORBIT. They are designed to avoid asking people to paste sensitive transcripts into a chat assistant unless they explicitly choose to.

## Inventory Prompt

```text
I want to analyze my AI collaboration habits over time using KAIROS-ORBIT.

Do not score me yet. First, help me inventory what data I have and what level of analysis is possible.

Ask me:
- Which AI assistants or agents I use.
- Whether I can export conversations.
- Whether exports include timestamps, message roles, conversation IDs, and text.
- Whether I have tool logs, commands, file edits, test results, documents, tickets, or other workflow evidence.
- Whether I want transcript-only Lite analysis or workflow-aware Full analysis.
- What date range I want.
- What privacy constraints apply.

Then produce a table:
- Source
- Export method
- Required fields available
- Optional Full-mode fields available
- Privacy risks
- Lite or Full suitability
- KAIROS dimensions supported
- Gaps to fill manually

Do not ask me to paste sensitive transcripts. If data is missing, mark confidence lower rather than guessing.
```

## Normalization Prompt

```text
I will provide a small synthetic or redacted sample of AI conversation export data.

Transform it into KAIROS-ORBIT normalized JSONL. Do not score it.

Return one JSON object per message with:
- source_platform
- conversation_id
- turn_id
- turn_index
- timestamp
- role
- content_text
- is_synthetic_or_system_context
- tool_names
- has_tool_use
- tool_result_status
- files_referenced
- artifacts_created
- verification_events
- downstream_links
- human_feedback
- metadata

Rules:
- Do not invent missing values.
- Use null or empty arrays for unknown values.
- Redact secrets and private third-party details.
- Mark system/developer/context messages clearly.
- Do not merge separate conversations.
```

## Interpretation Prompt

```text
I have KAIROS-ORBIT scores for my conversations.

Help me interpret them cautiously.

Requirements:
- Separate score from confidence.
- State whether this is Lite or Full mode.
- Identify strongest and weakest dimensions.
- Explain any data gaps.
- Avoid psychological diagnosis.
- Treat sentiment as observable language evidence only.
- Focus on practical behavior changes I can try next.
```
