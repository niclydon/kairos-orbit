export type Role = "human" | "assistant" | "system" | "tool";
export type Mode = "lite" | "full";

export interface KairosMessage {
  source_platform: string;
  conversation_id: string;
  turn_id: string;
  turn_index: number;
  timestamp?: string | null;
  role: Role;
  content_text: string;
  is_synthetic_or_system_context?: boolean;
  tool_names?: string[];
  has_tool_use?: boolean;
  tool_result_status?: "success" | "failure" | "blocked" | "skipped" | "unknown" | null;
  files_referenced?: string[];
  artifacts_created?: string[];
  verification_events?: string[];
  downstream_links?: string[];
  human_feedback?: "accepted" | "rejected" | "revised" | "deferred" | "unknown" | null;
  metadata?: Record<string, unknown>;
}

export interface KairosSubscores {
  knowledge_grounding: number;
  agency_design: number;
  instrumented_execution: number;
  reflexive_calibration: number;
  outcome_integration: number;
  social_affective_stance: number;
}

export interface KairosConversationScore {
  source_platform: string;
  conversation_id: string;
  mode: Mode;
  conversation_started_at: string | null;
  conversation_ended_at: string | null;
  kairos_score: number;
  opportunity_adjusted_score: number;
  confidence: number;
  subscores: KairosSubscores;
  counts: Record<string, number>;
  feature_flags: Record<string, boolean | number | string>;
}

export interface ScoreSummary {
  framework_version: string;
  conversations: KairosConversationScore[];
  aggregate: {
    conversation_count: number;
    avg_kairos_score: number | null;
    avg_opportunity_adjusted_score: number | null;
    avg_confidence: number | null;
  };
}
