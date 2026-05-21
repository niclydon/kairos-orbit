# Privacy Guide

AI conversation exports are sensitive. They can contain personal details, work content, names of third parties, credentials, health information, and emotional material.

## Public Use

For public examples:

- Use synthetic data.
- Do not include real transcripts.
- Do not include screenshots of private conversations.
- Do not include names, addresses, API keys, project names, client names, or internal infrastructure.

## Research Use

For research:

- Obtain consent when data includes multiple people.
- De-identify transcripts before sharing.
- Keep raw transcripts separate from derived scores.
- Store evidence references rather than long quoted spans.
- Avoid third-party sentiment/toxicity APIs unless participants explicitly consent.
- Report aggregate statistics where possible.

## Local Analysis

For personal self-analysis:

- Keep exports local.
- Redact secrets before processing.
- Treat the output as reflective evidence, not a psychological diagnosis.
- Delete temporary normalized files if they contain sensitive content.

## Repository Rule

This repository should never contain private exports. The `.gitignore` excludes common local data folders and `*.jsonl.private`, but users are still responsible for reviewing files before committing.
