import type { KairosMessage } from "../types.js";
import {
  compactObject,
  extractContent,
  inferSourcePlatform,
  normalizeRole,
  normalizeTimestamp,
  optionalWorkflowFields,
  safeId,
  type ParsedConversationInput,
} from "./shared.js";

export function isClaudeExport(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.messages)
    || Array.isArray(record.chat_messages)
    || Array.isArray(record.conversations)
    || Array.isArray(record.chats);
}

export function parseClaudeExport(value: unknown, input: ParsedConversationInput): KairosMessage[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const conversations = asArray(record.conversations ?? record.chats);
  if (conversations.length > 0) {
    return conversations.flatMap((conversation, index) => parseClaudeConversation(conversation, input, index));
  }
  return parseClaudeConversation(record, input, 0);
}

function parseClaudeConversation(
  conversation: unknown,
  input: ParsedConversationInput,
  conversationIndex: number,
): KairosMessage[] {
  if (!conversation || typeof conversation !== "object") return [];
  const record = conversation as Record<string, unknown>;
  const messages = asArray(record.messages ?? record.chat_messages);
  if (messages.length === 0) return [];
  const conversationId = safeId(
    record.uuid
    ?? record.id
    ?? record.conversation_id
    ?? record.name
    ?? record.title
    ?? `${input.file}:${conversationIndex}`,
  );
  const source = input.sourcePlatform ?? inferSourcePlatform(input.file, "claude");
  return messages.map((message, index): KairosMessage | null => {
    if (!message || typeof message !== "object") return null;
    const item = message as Record<string, unknown>;
    const role = normalizeRole(item.role ?? item.sender ?? item.type ?? item.author);
    const content = extractContent(item.content ?? item.text ?? item.message);
    if (!role || !content) return null;
    return {
      source_platform: source,
      conversation_id: conversationId,
      turn_id: String(item.uuid ?? item.id ?? `${conversationId}:${index}`),
      turn_index: Number.isFinite(Number(item.turn_index)) ? Number(item.turn_index) : index,
      timestamp: normalizeTimestamp(item.created_at ?? item.createdAt ?? item.timestamp),
      role,
      content_text: content,
      ...optionalWorkflowFields(item),
      metadata: compactObject({
        file: input.file,
        title: record.name ?? record.title,
      }),
    };
  }).filter((message): message is KairosMessage => Boolean(message));
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
