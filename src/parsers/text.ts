import type { KairosMessage } from "../types.js";
import {
  compactObject,
  inferSourcePlatform,
  normalizeRole,
  safeId,
  type ParsedConversationInput,
} from "./shared.js";

export function parseTextTranscript(text: string, input: ParsedConversationInput): KairosMessage[] {
  const source = input.sourcePlatform ?? inferSourcePlatform(input.file, "text_export");
  const conversationId = safeId(input.file);
  const messages: KairosMessage[] = [];
  let current: KairosMessage | null = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(user|human|assistant|claude|chatgpt|codex|system|tool)\s*[:：]\s*(.*)$/i);
    if (match) {
      if (current && current.content_text.trim()) messages.push(current);
      const role = normalizeRole(match[1]);
      current = role
        ? {
            source_platform: source,
            conversation_id: conversationId,
            turn_id: `${conversationId}:${messages.length}`,
            turn_index: messages.length,
            timestamp: null,
            role,
            content_text: match[2],
            metadata: compactObject({ file: input.file }),
          }
        : null;
    } else if (current) {
      current.content_text += `\n${line}`;
    }
  }

  if (current && current.content_text.trim()) messages.push(current);
  return messages.length >= 2 ? messages : [];
}
