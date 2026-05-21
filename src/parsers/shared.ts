import type { KairosMessage, Role } from "../types.js";

export interface ParsedConversationInput {
  file: string;
  sourcePlatform?: string;
}

export function normalizeRole(value: unknown): Role | null {
  const role = String(value ?? "").toLowerCase();
  if (["human", "user"].includes(role)) return "human";
  if (["assistant", "claude", "chatgpt", "codex", "model"].includes(role)) return "assistant";
  if (["system", "developer"].includes(role)) return "system";
  if (["tool", "function"].includes(role)) return "tool";
  return null;
}

export function normalizeTimestamp(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function extractContent(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map(extractContent).filter(Boolean).join("\n").trim();
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.parts)) return record.parts.map(extractContent).filter(Boolean).join("\n").trim();
    if (Array.isArray(record.content)) return record.content.map(extractContent).filter(Boolean).join("\n").trim();
    if (typeof record.text === "string") return record.text.trim();
    if (typeof record.value === "string") return record.value.trim();
  }
  return "";
}

export function inferSourcePlatform(file: string, fallback = "chat_export"): string {
  const lower = file.toLowerCase();
  if (lower.includes("chatgpt") || lower.includes("openai")) return "chatgpt";
  if (lower.includes("claude")) return "claude";
  if (lower.includes("codex")) return "codex";
  return fallback;
}

export function safeId(value: unknown): string {
  return String(value ?? "conversation").replace(/\s+/g, "-").slice(0, 160);
}

export function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      entry != null
      && entry !== ""
      && (!Array.isArray(entry) || entry.length > 0),
    ),
  ) as Partial<T>;
}

export function optionalWorkflowFields(record: Record<string, unknown>): Partial<KairosMessage> {
  return compactObject({
    tool_names: arrayOrUndefined(record.tool_names ?? record.tools),
    has_tool_use: typeof record.has_tool_use === "boolean" ? record.has_tool_use : undefined,
    tool_result_status: record.tool_result_status,
    files_referenced: arrayOrUndefined(record.files_referenced ?? record.files),
    artifacts_created: arrayOrUndefined(record.artifacts_created ?? record.artifacts),
    verification_events: arrayOrUndefined(record.verification_events ?? record.verifications),
    downstream_links: arrayOrUndefined(record.downstream_links ?? record.links),
    human_feedback: record.human_feedback,
  }) as Partial<KairosMessage>;
}

export function arrayOrUndefined(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length > 0 ? out : undefined;
}

export function messageFromRecord(
  record: Record<string, unknown>,
  input: ParsedConversationInput,
  fallbackIndex: number,
  conversationFallback: unknown = input.file,
): KairosMessage | null {
  const nested = record.message && typeof record.message === "object"
    ? record.message as Record<string, unknown>
    : {};
  const role = normalizeRole(record.role ?? record.type ?? nested.role ?? nested.type ?? getAuthorRole(record));
  const content = extractContent(
    record.content_text
    ?? record.content
    ?? record.text
    ?? nested.content_text
    ?? nested.content
    ?? nested.text,
  );
  if (!role || !content) return null;
  const conversationId = safeId(
    record.conversation_id
    ?? record.conversationId
    ?? record.session_id
    ?? record.sessionId
    ?? record.thread_id
    ?? record.chat_id
    ?? record.conversation_title
    ?? conversationFallback,
  );
  return {
    source_platform: String(record.source_platform ?? record.platform ?? input.sourcePlatform ?? inferSourcePlatform(input.file)),
    conversation_id: conversationId,
    turn_id: String(record.turn_id ?? record.id ?? nested.id ?? `${conversationId}:${fallbackIndex}`),
    turn_index: Number.isFinite(Number(record.turn_index)) ? Number(record.turn_index) : fallbackIndex,
    timestamp: normalizeTimestamp(record.timestamp ?? record.created_at ?? record.createdAt ?? nested.timestamp),
    role,
    content_text: content,
    ...optionalWorkflowFields(record),
    metadata: compactObject({
      file: input.file,
      title: record.title ?? record.conversation_title,
    }),
  };
}

function getAuthorRole(record: Record<string, unknown>): unknown {
  const author = record.author;
  if (author && typeof author === "object") return (author as Record<string, unknown>).role;
  return undefined;
}
