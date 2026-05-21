import { extname } from "node:path";
import type { KairosMessage } from "../types.js";
import { isChatGptExport, parseChatGptExport } from "./chatgpt.js";
import { isClaudeExport, parseClaudeExport } from "./claude.js";
import { parseGenericJson, parseJsonl } from "./generic.js";
import { type ParsedConversationInput } from "./shared.js";
import { parseTextTranscript } from "./text.js";

export const SUPPORTED_EXTENSIONS = new Set([".json", ".jsonl", ".md", ".txt"]);

export function parseTranscriptFile(file: string, text: string): KairosMessage[] {
  const ext = extname(file).toLowerCase();
  const input: ParsedConversationInput = { file };
  if (ext === ".jsonl") return parseJsonl(text, input);
  if (ext === ".json") {
    const value = JSON.parse(text);
    if (isChatGptExport(value)) return parseChatGptExport(value, input);
    if (isClaudeExport(value)) return parseClaudeExport(value, input);
    return parseGenericJson(value, input);
  }
  return parseTextTranscript(text, input);
}

export * from "./chatgpt.js";
export * from "./claude.js";
export * from "./generic.js";
export * from "./text.js";
