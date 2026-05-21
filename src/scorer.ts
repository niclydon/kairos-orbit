import { MARKERS, countMarkers } from "./lexicon.js";
import type { KairosConversationScore, KairosMessage, Mode, ScoreSummary } from "./types.js";

export const FRAMEWORK_VERSION = "kairos-orbit-v0.1";

const WEIGHTS = {
  knowledge: 0.18,
  agency: 0.18,
  execution: 0.20,
  calibration: 0.18,
  outcome: 0.14,
  stance: 0.12,
};

export function scoreMessages(messages: KairosMessage[]): ScoreSummary {
  const grouped = groupByConversation(messages);
  const conversations = Array.from(grouped.values()).map(scoreConversation);
  return {
    framework_version: FRAMEWORK_VERSION,
    conversations,
    aggregate: {
      conversation_count: conversations.length,
      avg_kairos_score: average(conversations.map((c) => c.kairos_score)),
      avg_opportunity_adjusted_score: average(conversations.map((c) => c.opportunity_adjusted_score)),
      avg_confidence: average(conversations.map((c) => c.confidence)),
    },
  };
}

export function scoreConversation(messages: KairosMessage[]): KairosConversationScore {
  const sorted = [...messages].sort((a, b) => a.turn_index - b.turn_index);
  const first = sorted[0];
  if (!first) throw new Error("Cannot score an empty conversation");

  const human = sorted.filter((m) => m.role === "human" && !m.is_synthetic_or_system_context);
  const assistant = sorted.filter((m) => m.role === "assistant");
  const allText = human.map((m) => m.content_text).join("\n");

  const counts = {
    human_turns: human.length,
    assistant_turns: assistant.length,
    context_markers: countMarkers(allText, MARKERS.context),
    example_markers: countMarkers(allText, MARKERS.examples),
    format_markers: countMarkers(allText, MARKERS.format),
    goal_markers: countMarkers(allText, MARKERS.goal),
    preference_markers: countMarkers(allText, MARKERS.preferences),
    verification_markers: countMarkers(allText, MARKERS.verification) + sumArrayLengths(sorted, "verification_events"),
    correction_markers: countMarkers(allText, MARKERS.correction),
    boundary_markers: countMarkers(allText, MARKERS.boundary),
    execution_markers: countMarkers(allText, MARKERS.execution),
    artifact_markers: countMarkers(allText, MARKERS.artifact) + sumArrayLengths(sorted, "artifacts_created"),
    provenance_markers: countMarkers(allText, MARKERS.provenance),
    collegial_markers: countMarkers(allText, MARKERS.collegial),
    affect_friction_markers: countMarkers(allText, MARKERS.affectFriction),
    tool_calls: sorted.reduce((acc, m) => acc + (m.has_tool_use ? 1 : 0) + (m.tool_names?.length ?? 0), 0),
    files_referenced: sumArrayLengths(sorted, "files_referenced"),
    artifacts_created: sumArrayLengths(sorted, "artifacts_created"),
    verification_events: sumArrayLengths(sorted, "verification_events"),
    downstream_links: sumArrayLengths(sorted, "downstream_links"),
    accepted_feedback: sorted.filter((m) => m.human_feedback === "accepted").length,
    failed_tool_results: sorted.filter((m) => m.tool_result_status === "failure").length,
    successful_tool_results: sorted.filter((m) => m.tool_result_status === "success").length,
  };

  const mode: Mode = hasFullEvidence(sorted) ? "full" : "lite";
  const correctionWithVerification = counts.correction_markers > 0 && counts.verification_markers > 0;
  const lowContempt = clamp(1 - counts.affect_friction_markers / 3);
  const repairQuality = counts.correction_markers === 0
    ? 0.75
    : correctionWithVerification
      ? 1
      : 0.35;

  const knowledge = weighted([
    [0.30, bool(counts.context_markers)],
    [0.20, bool(counts.example_markers)],
    [0.15, bool(counts.format_markers)],
    [0.20, bool(counts.files_referenced + counts.provenance_markers)],
    [0.15, bool(counts.boundary_markers)],
  ]);

  const agency = weighted([
    [0.30, bool(counts.goal_markers)],
    [0.20, bool(counts.preference_markers)],
    [0.20, bool(counts.boundary_markers)],
    [0.15, bool(counts.verification_markers)],
    [0.15, bool(counts.execution_markers)],
  ]);

  const execution = weighted([
    [0.25, bool(counts.tool_calls + counts.execution_markers)],
    [0.20, bool(counts.artifact_markers + counts.artifacts_created)],
    [0.20, bool(counts.verification_markers + counts.verification_events)],
    [0.15, bool(counts.files_referenced)],
    [0.10, bool(counts.downstream_links)],
    [0.10, human.length >= 3 && assistant.length >= 2 ? 1 : 0],
  ]);

  const calibration = weighted([
    [0.25, bool(counts.verification_markers)],
    [0.20, bool(counts.correction_markers)],
    [0.20, repairQuality],
    [0.20, bool(counts.boundary_markers)],
    [0.15, bool(counts.failed_tool_results + counts.successful_tool_results)],
  ]);

  const outcome = weighted([
    [0.25, bool(counts.accepted_feedback)],
    [0.20, bool(counts.downstream_links)],
    [0.20, bool(counts.artifacts_created + counts.artifact_markers)],
    [0.20, bool(counts.provenance_markers + counts.verification_events)],
    [0.15, bool(counts.boundary_markers)],
  ]);

  const stance = weighted([
    [0.20, scaled(counts.collegial_markers, 2)],
    [0.20, lowContempt],
    [0.20, repairQuality],
    [0.15, bool(counts.execution_markers + counts.boundary_markers) ? lowContempt : 0.7],
    [0.15, counts.affect_friction_markers === 0 ? 1 : correctionWithVerification ? 0.7 : 0.3],
    [0.10, bool(counts.boundary_markers)],
  ]);

  const kairos = weighted([
    [WEIGHTS.knowledge, knowledge],
    [WEIGHTS.agency, agency],
    [WEIGHTS.execution, execution],
    [WEIGHTS.calibration, calibration],
    [WEIGHTS.outcome, outcome],
    [WEIGHTS.stance, stance],
  ]);

  const executionOpportunity = mode === "full"
    || counts.execution_markers > 0
    || counts.artifact_markers > 0
    || counts.verification_markers > 0;
  const opportunityPairs: Array<[number, number]> = [
    [WEIGHTS.knowledge, knowledge],
    [WEIGHTS.agency, agency],
    [WEIGHTS.calibration, calibration],
    [WEIGHTS.stance, stance],
  ];
  if (executionOpportunity) {
    opportunityPairs.push([WEIGHTS.execution, execution], [WEIGHTS.outcome, outcome]);
  }

  const confidence = clamp(
    0.18
    + (human.length >= 3 ? 0.18 : human.length > 0 ? 0.08 : 0)
    + (assistant.length > 0 ? 0.14 : 0)
    + (hasTimestamp(sorted) ? 0.12 : 0)
    + (mode === "full" ? 0.22 : 0.08)
    + (allText.length > 200 ? 0.10 : 0)
    + (counts.verification_markers > 0 ? 0.08 : 0),
  );

  return {
    source_platform: first.source_platform,
    conversation_id: first.conversation_id,
    mode,
    conversation_started_at: minTimestamp(sorted),
    conversation_ended_at: maxTimestamp(sorted),
    kairos_score: round(kairos),
    opportunity_adjusted_score: round(weighted(opportunityPairs, true)),
    confidence: round(confidence),
    subscores: {
      knowledge_grounding: round(knowledge),
      agency_design: round(agency),
      instrumented_execution: round(execution),
      reflexive_calibration: round(calibration),
      outcome_integration: round(outcome),
      social_affective_stance: round(stance),
    },
    counts,
    feature_flags: {
      has_full_evidence: mode === "full",
      correction_with_verification: correctionWithVerification,
      low_contempt: lowContempt >= 0.67,
      repair_quality: round(repairQuality),
      execution_opportunity: executionOpportunity,
    },
  };
}

function groupByConversation(messages: KairosMessage[]): Map<string, KairosMessage[]> {
  const grouped = new Map<string, KairosMessage[]>();
  for (const message of messages) {
    const key = `${message.source_platform}:${message.conversation_id}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(message);
    grouped.set(key, bucket);
  }
  return grouped;
}

function hasFullEvidence(messages: KairosMessage[]): boolean {
  return messages.some((m) =>
    Boolean(m.has_tool_use)
    || Boolean(m.tool_names?.length)
    || Boolean(m.files_referenced?.length)
    || Boolean(m.artifacts_created?.length)
    || Boolean(m.verification_events?.length)
    || Boolean(m.downstream_links?.length)
    || Boolean(m.human_feedback && m.human_feedback !== "unknown")
    || Boolean(m.tool_result_status && m.tool_result_status !== "unknown"),
  );
}

function hasTimestamp(messages: KairosMessage[]): boolean {
  return messages.some((m) => Boolean(m.timestamp));
}

function minTimestamp(messages: KairosMessage[]): string | null {
  const values = messages.map((m) => m.timestamp).filter((v): v is string => Boolean(v)).sort();
  return values[0] ?? null;
}

function maxTimestamp(messages: KairosMessage[]): string | null {
  const values = messages.map((m) => m.timestamp).filter((v): v is string => Boolean(v)).sort();
  return values[values.length - 1] ?? null;
}

function sumArrayLengths<T extends keyof KairosMessage>(messages: KairosMessage[], key: T): number {
  return messages.reduce((acc, m) => {
    const value = m[key];
    return acc + (Array.isArray(value) ? value.length : 0);
  }, 0);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return round(values.reduce((a, b) => a + b, 0) / values.length);
}

function weighted(pairs: Array<[number, number]>, normalize = false): number {
  const den = normalize ? pairs.reduce((acc, [w]) => acc + w, 0) : 1;
  if (den === 0) return 0;
  return clamp(pairs.reduce((acc, [w, value]) => acc + w * clamp(value), 0) / den);
}

function scaled(value: number, cap: number): number {
  return clamp(value / cap);
}

function bool(value: number | boolean): number {
  return value ? 1 : 0;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(clamp(value) * 1000) / 1000;
}
