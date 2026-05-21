#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { homedir } from "node:os";

const DEFAULT_MAX_FILES = 500;
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const CANDIDATE_EXTENSIONS = new Set([".json", ".jsonl", ".md", ".txt"]);
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".next",
  "target",
  "vendor",
]);

const args = parseArgs(process.argv.slice(2));
const roots = args.roots.length > 0 ? args.roots : defaultRoots();
const candidates = [];

for (const root of roots) {
  const resolved = resolve(expandHome(root));
  if (existsSync(resolved)) {
    collectCandidates(resolved, candidates, args);
  }
}

const limited = candidates.slice(0, args.maxFiles);
if (args.discoverOnly) {
  console.log(JSON.stringify({
    roots,
    candidate_count: candidates.length,
    scanned_count: limited.length,
    candidates: limited.map((file) => ({ file, source_platform: inferSourcePlatform(file) })),
  }, null, 2));
  process.exit(0);
}

if (!args.out) {
  fail("Missing --out <path>. Use --discover-only to inspect candidate files first.");
}

const messages = [];
const errors = [];
for (const file of limited) {
  try {
    messages.push(...parseCandidate(file));
  } catch (err) {
    errors.push({ file, error: err.message });
  }
}

messages.sort((a, b) =>
  `${a.source_platform}:${a.conversation_id}:${String(a.turn_index).padStart(8, "0")}`
    .localeCompare(`${b.source_platform}:${b.conversation_id}:${String(b.turn_index).padStart(8, "0")}`),
);

const output = messages.map((message) => JSON.stringify(message)).join("\n");
mkdirSync(resolve(args.out, ".."), { recursive: true });
writeFileSync(args.out, output ? `${output}\n` : "", "utf8");

console.error(JSON.stringify({
  output: args.out,
  candidate_files: limited.length,
  messages: messages.length,
  conversations: new Set(messages.map((m) => `${m.source_platform}:${m.conversation_id}`)).size,
  parse_errors: errors.length,
  errors: errors.slice(0, 10),
}, null, 2));

function parseArgs(argv) {
  const out = {
    roots: [],
    out: "",
    discoverOnly: false,
    maxFiles: DEFAULT_MAX_FILES,
    maxBytes: DEFAULT_MAX_BYTES,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--roots") {
      i += 1;
      while (i < argv.length && !argv[i].startsWith("--")) {
        out.roots.push(argv[i]);
        i += 1;
      }
      i -= 1;
    } else if (arg === "--out") {
      out.out = requireValue(argv, i);
      i += 1;
    } else if (arg === "--discover-only") {
      out.discoverOnly = true;
    } else if (arg === "--max-files") {
      out.maxFiles = Number.parseInt(requireValue(argv, i), 10);
      i += 1;
    } else if (arg === "--max-bytes") {
      out.maxBytes = Number.parseInt(requireValue(argv, i), 10);
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      usage();
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(out.maxFiles) || out.maxFiles <= 0) fail("--max-files must be positive");
  if (!Number.isFinite(out.maxBytes) || out.maxBytes <= 0) fail("--max-bytes must be positive");
  return out;
}

function requireValue(argv, index) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${argv[index]} requires a value`);
  return value;
}

function usage() {
  console.log(`Usage:
  node scripts/collect-lite-input.mjs --discover-only [--roots <dir...>]
  node scripts/collect-lite-input.mjs --roots <dir...> --out kairos-lite-input.jsonl.private

Options:
  --roots <dir...>       Directories to scan. Defaults to common export/workspace locations.
  --out <file>           JSONL output path. Prefer *.jsonl.private.
  --discover-only        Print candidate files without reading transcript content.
  --max-files <n>        Candidate file cap. Default ${DEFAULT_MAX_FILES}.
  --max-bytes <n>        Per-file size cap. Default ${DEFAULT_MAX_BYTES}.
`);
  process.exit(0);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function defaultRoots() {
  const home = homedir();
  return [
    process.cwd(),
    join(home, "Downloads"),
    join(home, "Desktop"),
    join(home, ".claude", "projects"),
    join(home, ".codex", "sessions"),
  ].filter((path) => existsSync(path));
}

function expandHome(path) {
  return path === "~" || path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
}

function collectCandidates(path, out, options) {
  if (out.length >= options.maxFiles) return;
  const info = statSync(path);
  if (info.isDirectory()) {
    const name = basename(path);
    if (SKIP_DIRS.has(name)) return;
    for (const child of readdirSync(path)) {
      collectCandidates(join(path, child), out, options);
      if (out.length >= options.maxFiles) return;
    }
    return;
  }
  if (!info.isFile()) return;
  if (info.size > options.maxBytes) return;
  if (!CANDIDATE_EXTENSIONS.has(extname(path).toLowerCase())) return;
  out.push(path);
}

function parseCandidate(file) {
  const ext = extname(file).toLowerCase();
  const text = readFileSync(file, "utf8");
  if (ext === ".jsonl") return parseJsonl(file, text);
  if (ext === ".json") return parseJson(file, text);
  return parseTextTranscript(file, text);
}

function parseJsonl(file, text) {
  const messages = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const record = JSON.parse(trimmed);
    const message = normalizeRecord(record, file, index);
    if (message) messages.push(message);
  }
  return messages;
}

function parseJson(file, text) {
  const data = JSON.parse(text);
  if (Array.isArray(data)) {
    if (data.every((item) => item && typeof item === "object" && "mapping" in item)) {
      return data.flatMap((conversation, index) => parseChatGptConversation(file, conversation, index));
    }
    return data.flatMap((item, index) => parseJsonItem(file, item, index));
  }
  if (Array.isArray(data.conversations)) {
    return data.conversations.flatMap((item, index) => parseJsonItem(file, item, index));
  }
  return parseJsonItem(file, data, 0);
}

function parseJsonItem(file, item, index) {
  if (!item || typeof item !== "object") return [];
  if ("mapping" in item) return parseChatGptConversation(file, item, index);
  if (Array.isArray(item.messages)) {
    return item.messages
      .map((message, turnIndex) => normalizeRecord({
        ...message,
        source_platform: item.source_platform ?? item.platform,
        conversation_id: item.conversation_id ?? item.id ?? item.uuid ?? `${relative(process.cwd(), file)}:${index}`,
        conversation_title: item.title,
      }, file, turnIndex))
      .filter(Boolean);
  }
  const message = normalizeRecord(item, file, index);
  return message ? [message] : [];
}

function parseChatGptConversation(file, conversation, conversationIndex) {
  const source = inferSourcePlatform(file, "chatgpt");
  const conversationId = safeId(conversation.id ?? conversation.title ?? `${relative(process.cwd(), file)}:${conversationIndex}`);
  const nodes = Object.values(conversation.mapping ?? {})
    .map((node) => node?.message)
    .filter(Boolean)
    .sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
  return nodes.map((message, index) => {
    const role = normalizeRole(message.author?.role);
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
      metadata: compactObject({ title: conversation.title }),
    };
  }).filter(Boolean);
}

function parseTextTranscript(file, text) {
  const source = inferSourcePlatform(file, "text_export");
  const conversationId = safeId(relative(process.cwd(), file));
  const messages = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(user|human|assistant|claude|chatgpt|codex|system|tool)\s*[:：]\s*(.*)$/i);
    if (match) {
      if (current && current.content_text.trim()) messages.push(current);
      current = {
        source_platform: source,
        conversation_id: conversationId,
        turn_id: `${conversationId}:${messages.length}`,
        turn_index: messages.length,
        timestamp: null,
        role: normalizeRole(match[1]),
        content_text: match[2],
        metadata: { file: relative(process.cwd(), file) },
      };
    } else if (current) {
      current.content_text += `\n${line}`;
    }
  }
  if (current && current.content_text.trim()) messages.push(current);
  return messages.length >= 2 ? messages : [];
}

function normalizeRecord(record, file, fallbackIndex) {
  if (!record || typeof record !== "object") return null;
  const nested = record.message && typeof record.message === "object" ? record.message : {};
  const role = normalizeRole(record.role ?? record.type ?? record.author?.role ?? nested.role ?? nested.type);
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
    ?? relative(process.cwd(), file),
  );
  return {
    source_platform: String(record.source_platform ?? record.platform ?? inferSourcePlatform(file)),
    conversation_id: conversationId,
    turn_id: String(record.turn_id ?? record.id ?? nested.id ?? `${conversationId}:${fallbackIndex}`),
    turn_index: Number.isFinite(Number(record.turn_index)) ? Number(record.turn_index) : fallbackIndex,
    timestamp: normalizeTimestamp(record.timestamp ?? record.created_at ?? record.createdAt ?? nested.timestamp),
    role,
    content_text: content,
    ...optionalWorkflowFields(record),
    metadata: compactObject({
      file: relative(process.cwd(), file),
      title: record.title ?? record.conversation_title,
    }),
  };
}

function optionalWorkflowFields(record) {
  return compactObject({
    tool_names: arrayOrUndefined(record.tool_names ?? record.tools),
    has_tool_use: typeof record.has_tool_use === "boolean" ? record.has_tool_use : undefined,
    tool_result_status: record.tool_result_status,
    files_referenced: arrayOrUndefined(record.files_referenced ?? record.files),
    artifacts_created: arrayOrUndefined(record.artifacts_created ?? record.artifacts),
    verification_events: arrayOrUndefined(record.verification_events ?? record.verifications),
    downstream_links: arrayOrUndefined(record.downstream_links ?? record.links),
    human_feedback: record.human_feedback,
  });
}

function arrayOrUndefined(value) {
  if (!Array.isArray(value)) return undefined;
  return value.map(String).filter(Boolean);
}

function normalizeRole(value) {
  const role = String(value ?? "").toLowerCase();
  if (["human", "user"].includes(role)) return "human";
  if (["assistant", "claude", "chatgpt", "codex", "model"].includes(role)) return "assistant";
  if (["system", "developer"].includes(role)) return "system";
  if (["tool", "function"].includes(role)) return "tool";
  return null;
}

function extractContent(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map(extractContent).filter(Boolean).join("\n").trim();
  }
  if (value && typeof value === "object") {
    if (Array.isArray(value.parts)) return value.parts.map(extractContent).filter(Boolean).join("\n").trim();
    if (Array.isArray(value.content)) return value.content.map(extractContent).filter(Boolean).join("\n").trim();
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value.value === "string") return value.value.trim();
  }
  return "";
}

function inferSourcePlatform(file, fallback = "chat_export") {
  const lower = file.toLowerCase();
  if (lower.includes("chatgpt") || lower.includes("openai")) return "chatgpt";
  if (lower.includes("claude")) return "claude";
  if (lower.includes("codex")) return "codex";
  return fallback;
}

function normalizeTimestamp(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function safeId(value) {
  return String(value).replace(/\s+/g, "-").slice(0, 160);
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry != null && entry !== ""));
}
