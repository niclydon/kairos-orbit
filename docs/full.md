# KAIROS-ORBIT Full

KAIROS-ORBIT Full extends transcript analysis with workflow evidence. It is intended for coding agents, research assistants, enterprise copilots, workflow automations, or any environment where chat turns can be joined to tools, artifacts, verification, and outcomes.

Full mode measures applied AI workflow maturity more directly than Lite mode.

## Additional Evidence

Full mode can use:

- Tool calls.
- Tool results.
- Commands.
- Test results.
- File edits.
- Generated documents.
- Tickets or issues.
- Commits or change requests.
- Deployment checks.
- Citations or source links.
- Human accept/reject/revise decisions.

## What Full Can Measure Better Than Lite

Full mode improves confidence for:

- Instrumented Execution.
- Outcome Integration.
- Real verification.
- Repair after tool failures.
- Evidence-backed trust calibration.
- Whether an AI conversation became durable work.

## Full Message Extensions

The message schema supports optional workflow fields:

```json
{
  "tool_names": ["read_file", "run_tests"],
  "has_tool_use": true,
  "tool_result_status": "success",
  "files_referenced": ["src/example.ts"],
  "artifacts_created": ["docs/report.md"],
  "verification_events": ["unit tests passed"],
  "downstream_links": ["change-request-123"],
  "human_feedback": "accepted"
}
```

These values should be factual metadata, not inferred decorations.

## Full Score Interpretation

A high Full score means:

> The conversation and surrounding workflow show strong evidence of grounded, instrumented, verified, integrated AI collaboration.

This is still not a diagnosis of the person. It is a structured description of observed behavior and workflow evidence.

## Full Limitations

Full mode depends on logging quality. If the workflow telemetry is incomplete, the score may undercount execution and outcome integration.

Full mode should report:

- Data coverage.
- Source freshness.
- Missing tool telemetry.
- Missing outcome telemetry.
- Confidence.

## Privacy Boundary

Full telemetry can be more sensitive than chat text because it may reveal repository names, internal documents, user identities, infrastructure details, customer names, or credentials.

Before publication or sharing:

- Replace real paths with synthetic paths.
- Replace real links with synthetic IDs.
- Remove third-party names.
- Remove credentials.
- Remove private hostnames and internal network details.
