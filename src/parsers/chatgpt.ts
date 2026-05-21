import type { KairosMessage } from "../types.js";
import {
  compactObject,
  extractContent,
  inferSourcePlatform,
  normalizeRole,
  normalizeTimestamp,
  safeId,
  type ParsedConversationInput,
} from "./shared.js";

export function isChatGptExport(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((item) =>
    item
    && typeof item === "object"
    && "mapping" in item
    && typeof (item as Record<string, unknown>).mapping === "object",
  );
}

export function parseChatGptExport(value: unknown, input: ParsedConversationInput): KairosMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((conversation, index) => parseChatGptConversation(conversation, input, index));
}

function parseChatGptConversation(
  conversation: unknown,
  input: ParsedConversationInput,
  conversationIndex: number,
): KairosMessage[] {
  if (!conversation || typeof conversation !== "object") return [];
  const record = conversation as Record<string, unknown>;
  const mapping = record.mapping;
  if (!mapping || typeof mapping !== "object") return [];
  const source = input.sourcePlatform ?? inferSourcePlatform(input.file, "chatgpt");
  const conversationId = safeId(record.id ?? record.title ?? `${input.file}:${conversationIndex}`);
  const nodes = Object.values(mapping as Record<string, unknown>)
    .map((node) => node && typeof node === "object" ? (node as Record<string, unknown>).message : null)
    .filter((message): message is Record<string, unknown> => Boolean(message))
    .sort((a, b) => Number(a.create_time ?? 0) - Number(b.create_time ?? 0));

  return nodes.map((message, index): KairosMessage | null => {
    const author = message.author && typeof message.author === "object"
      ? message.author as Record<string, unknown>
      : {};
    const role = normalizeRole(author.role);
    const content = extractContent(message.content);
    if (!role || !content) return null;
    return {
      source_platform: source,
      conversation_id: conversationId,
      turn_id: String(message.id ?? `${conversationId}:${index}`),
      turn_index: index,
      timestamp: normalizeTimestamp(message.create_time),
      role,
      content_text: content,
      metadata: compactObject({ file: input.file, title: record.title }),
    };
  }).filter((message): message is KairosMessage => Boolean(message));
}
