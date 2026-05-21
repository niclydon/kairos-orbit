import type { KairosMessage } from "../types.js";
import { messageFromRecord, type ParsedConversationInput } from "./shared.js";

export function parseGenericJson(value: unknown, input: ParsedConversationInput): KairosMessage[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => parseGenericJsonItem(item, input, index));
  }
  return parseGenericJsonItem(value, input, 0);
}

export function parseJsonl(text: string, input: ParsedConversationInput): KairosMessage[] {
  const messages: KairosMessage[] = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const record = JSON.parse(trimmed);
    const message = record && typeof record === "object"
      ? messageFromRecord(record as Record<string, unknown>, input, index)
      : null;
    if (message) messages.push(message);
  }
  return messages;
}

function parseGenericJsonItem(
  item: unknown,
  input: ParsedConversationInput,
  index: number,
): KairosMessage[] {
  if (!item || typeof item !== "object") return [];
  const record = item as Record<string, unknown>;
  if (Array.isArray(record.messages)) {
    return record.messages
      .map((message, turnIndex) => {
        if (!message || typeof message !== "object") return null;
        return messageFromRecord(
          {
            ...message as Record<string, unknown>,
            source_platform: record.source_platform ?? record.platform,
            conversation_id: record.conversation_id ?? record.id ?? record.uuid ?? `${input.file}:${index}`,
            conversation_title: record.title,
          },
          input,
          turnIndex,
          record.id ?? `${input.file}:${index}`,
        );
      })
      .filter((message): message is KairosMessage => Boolean(message));
  }
  const message = messageFromRecord(record, input, index);
  return message ? [message] : [];
}
