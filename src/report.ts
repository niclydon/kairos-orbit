import type { KairosConversationScore, KairosSubscores, ScoreSummary } from "./types.js";

const DIMENSION_LABELS: Record<keyof KairosSubscores, string> = {
  knowledge_grounding: "Knowledge Grounding",
  agency_design: "Agency Design",
  instrumented_execution: "Instrumented Execution",
  reflexive_calibration: "Reflexive Calibration",
  outcome_integration: "Outcome Integration",
  social_affective_stance: "Social and Affective Stance",
};

const SIGNALS = [
  {
    key: "verification_event_rate",
    label: "Verification events",
    description: "Conversations with evidence checks, tests, validation, or explicit verification requests.",
    predicate: (c: KairosConversationScore) =>
      count(c, "verification_markers") + count(c, "verification_events") > 0,
  },
  {
    key: "artifact_rate",
    label: "Artifacts",
    description: "Conversations that produce durable outputs such as code, docs, reports, tickets, or plans.",
    predicate: (c: KairosConversationScore) =>
      count(c, "artifact_markers") + count(c, "artifacts_created") > 0,
  },
  {
    key: "correction_rate",
    label: "Corrections",
    description: "Conversations where the operator repairs, redirects, or challenges the AI output.",
    predicate: (c: KairosConversationScore) => count(c, "correction_markers") > 0,
  },
  {
    key: "correction_with_verification_rate",
    label: "Corrections with verification",
    description: "Corrections paired with verification, testing, evidence, or validation.",
    predicate: (c: KairosConversationScore) =>
      count(c, "correction_markers") > 0
      && count(c, "verification_markers") + count(c, "verification_events") > 0,
  },
  {
    key: "affect_friction_rate",
    label: "Affect friction",
    description: "Conversations with observable frustration, sharpness, impatience, or morale pressure.",
    predicate: (c: KairosConversationScore) => count(c, "affect_friction_markers") > 0,
  },
] as const;

export interface MarkdownReportOptions {
  title?: string;
  generatedAt?: string;
}

export function generateMarkdownReport(
  summary: ScoreSummary,
  options: MarkdownReportOptions = {},
): string {
  const title = options.title ?? "KAIROS-ORBIT Operator Fluency Report";
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const conversations = summary.conversations;
  const n = conversations.length;
  const dateRange = conversationDateRange(conversations);
  const sourcePlatforms = [...new Set(conversations.map((c) => c.source_platform))].sort();
  const modeCounts = countBy(conversations, (c) => c.mode);
  const fullEvidenceCount = conversations.filter((c) => c.feature_flags.has_full_evidence === true).length;
  const timestampCount = conversations.filter((c) => c.conversation_started_at || c.conversation_ended_at).length;
  const dimensionRows = dimensionAverages(conversations);
  const sortedDimensions = [...dimensionRows].sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1),
  );
  const signalRows = SIGNALS.map((signal) => ({
    ...signal,
    rate: rate(conversations, signal.predicate),
  }));
  const dataGaps = inferDataGaps({
    conversations,
    fullEvidenceCount,
    timestampCount,
    sourcePlatforms,
  });

  const lines: string[] = [
    `# ${title}`,
    "",
    "A longitudinal view of how effectively the operator collaborates with AI systems across planning, execution, verification, repair, and outcome integration.",
    "",
    "## Summary",
    "",
    `- Framework version: \`${summary.framework_version}\``,
    `- Generated at: ${generatedAt}`,
    `- Conversations scored: ${n}`,
    `- Date range: ${dateRange ?? "not available"}`,
    `- Sources: ${sourcePlatforms.length > 0 ? sourcePlatforms.join(", ") : "not available"}`,
    `- Mode mix: ${formatModeCounts(modeCounts)}`,
    `- Overall KAIROS score: ${formatScore(summary.aggregate.avg_kairos_score)}`,
    `- Opportunity-adjusted score: ${formatScore(summary.aggregate.avg_opportunity_adjusted_score)}`,
    `- Operator Index: ${formatIndex(summary.aggregate.avg_opportunity_adjusted_score)}`,
    `- Average confidence: ${formatScore(summary.aggregate.avg_confidence)}`,
    "",
    "Scores are exploratory and should be read as structured evidence, not as a grade or validated psychometric diagnosis.",
    "",
    "## Dimension Profile",
    "",
    "| Dimension | Average score | What it reflects |",
    "| --- | ---: | --- |",
    ...dimensionRows.map((row) =>
      `| ${row.label} | ${formatScore(row.score)} | ${row.description} |`,
    ),
    "",
    "## Interaction Signals",
    "",
    "| Signal | Rate | What it reflects |",
    "| --- | ---: | --- |",
    ...signalRows.map((row) =>
      `| ${row.label} | ${formatPercent(row.rate)} | ${row.description} |`,
    ),
    "",
    "## Highlights",
    "",
    `- Strongest observed dimension: ${formatHighlight(sortedDimensions[0])}`,
    `- Softest observed dimension: ${formatHighlight(sortedDimensions[sortedDimensions.length - 1])}`,
    `- Full workflow evidence available for ${formatPercent(n === 0 ? null : fullEvidenceCount / n)} of conversations.`,
    `- Timestamp coverage: ${formatPercent(n === 0 ? null : timestampCount / n)}.`,
    "",
    "## Data Gaps And Caveats",
    "",
    ...dataGaps.map((gap) => `- ${gap}`),
    "",
    "## Interpretation Notes",
    "",
    "- Compare this report primarily against the same operator's prior reports, not against other people.",
    "- Compare Lite and Full results carefully; Full data can observe tool use and outcomes that transcript-only data must infer.",
    "- Treat affect and tone signals as observable language patterns, not as claims about personality, mental health, or moral character.",
    "- Inspect low-confidence conversations before making substantive conclusions.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function dimensionAverages(conversations: KairosConversationScore[]) {
  return (Object.keys(DIMENSION_LABELS) as Array<keyof KairosSubscores>).map((key) => ({
    key,
    label: DIMENSION_LABELS[key],
    score: weightedAverage(conversations.map((c) => [c.subscores[key], c.confidence])),
    description: dimensionDescription(key),
  }));
}

function dimensionDescription(key: keyof KairosSubscores): string {
  switch (key) {
    case "knowledge_grounding":
      return "Context, source material, examples, constraints, and relevant background.";
    case "agency_design":
      return "Role, goal, autonomy, boundaries, sequencing, and success conditions.";
    case "instrumented_execution":
      return "Tools, files, commands, tests, artifacts, and evidence-backed execution.";
    case "reflexive_calibration":
      return "Verification, correction, assumption-checking, and trust adjustment.";
    case "outcome_integration":
      return "Whether outputs become accountable decisions, artifacts, or follow-through.";
    case "social_affective_stance":
      return "Interactional tone, repair quality, frustration, respect, and morale pressure.";
  }
}

function inferDataGaps(input: {
  conversations: KairosConversationScore[];
  fullEvidenceCount: number;
  timestampCount: number;
  sourcePlatforms: string[];
}): string[] {
  const gaps: string[] = [];
  const n = input.conversations.length;
  if (n === 0) return ["No conversations were available to score."];
  if (input.sourcePlatforms.length <= 1) {
    gaps.push("Single-source data limits cross-platform interpretation.");
  }
  if (input.fullEvidenceCount === 0) {
    gaps.push("No Full-mode workflow telemetry was available; execution and outcome signals are transcript-inferred.");
  } else if (input.fullEvidenceCount < n) {
    gaps.push("Workflow telemetry is partial; compare Lite and Full conversations cautiously.");
  }
  if (input.timestampCount === 0) {
    gaps.push("No timestamps were available, so longitudinal trends cannot be generated from this input alone.");
  } else if (input.timestampCount < n) {
    gaps.push("Timestamp coverage is partial; trend analysis may be incomplete.");
  }
  if (n < 20) {
    gaps.push("Small sample size; use the report as a qualitative snapshot rather than a stable trend.");
  }
  if (gaps.length === 0) {
    gaps.push("No major coverage gaps were detected by the reference reporter.");
  }
  return gaps;
}

function conversationDateRange(conversations: KairosConversationScore[]): string | null {
  const timestamps = conversations
    .flatMap((c) => [c.conversation_started_at, c.conversation_ended_at])
    .filter((value): value is string => Boolean(value))
    .sort();
  if (timestamps.length === 0) return null;
  return `${timestamps[0]} to ${timestamps[timestamps.length - 1]}`;
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function formatModeCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  return entries.length === 0
    ? "not available"
    : entries.map(([mode, value]) => `${mode} ${value}`).join(", ");
}

function weightedAverage(pairs: Array<[number | null, number | null]>): number | null {
  let num = 0;
  let den = 0;
  for (const [value, weight] of pairs) {
    if (value == null) continue;
    const w = weight == null || weight <= 0 ? 1 : weight;
    num += value * w;
    den += w;
  }
  return den === 0 ? null : round(num / den);
}

function rate(
  conversations: KairosConversationScore[],
  predicate: (conversation: KairosConversationScore) => boolean,
): number | null {
  if (conversations.length === 0) return null;
  return round(conversations.filter(predicate).length / conversations.length);
}

function count(conversation: KairosConversationScore, key: string): number {
  return conversation.counts[key] ?? 0;
}

function formatScore(value: number | null): string {
  return value == null ? "n/a" : value.toFixed(3);
}

function formatIndex(value: number | null): string {
  return value == null ? "n/a" : (value * 100).toFixed(1);
}

function formatPercent(value: number | null): string {
  return value == null ? "n/a" : `${(value * 100).toFixed(1)}%`;
}

function formatHighlight(
  row: { label: string; score: number | null } | undefined,
): string {
  return !row || row.score == null ? "not available" : `${row.label} (${formatScore(row.score)})`;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
