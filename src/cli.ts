import { readFileSync, statSync, writeFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { parseTranscriptFile, SUPPORTED_EXTENSIONS } from "./parsers/index.js";
import { generateMarkdownReport } from "./report.js";
import { scoreMessages } from "./scorer.js";
import type { KairosMessage } from "./types.js";

function usage(): never {
  console.error([
    "Usage:",
    "  kairos-orbit normalize <file-or-dir...> --output messages.jsonl.private",
    "  kairos-orbit score <messages.jsonl>",
    "  kairos-orbit report <messages.jsonl> [--format markdown] [--output report.md]",
    "",
    "Backward compatible:",
    "  kairos-orbit <messages.jsonl>",
  ].join("\n"));
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

const command = args[0];
const commandIsFile = command.endsWith(".jsonl") || command.includes("/");
const mode = commandIsFile ? "score" : command;
const file = commandIsFile ? command : args[1];
if (mode === "normalize") {
  const inputs = positionalArgs(args.slice(1));
  const output = optionValue(args, "--output") ?? optionValue(args, "--out");
  if (inputs.length === 0 || !output) usage();
  const files = inputs.flatMap(collectInputFiles);
  const messages = files.flatMap((inputFile) => parseTranscriptFile(inputFile, readFileSync(inputFile, "utf8")));
  messages.sort((a, b) =>
    `${a.source_platform}:${a.conversation_id}:${String(a.turn_index).padStart(8, "0")}`
      .localeCompare(`${b.source_platform}:${b.conversation_id}:${String(b.turn_index).padStart(8, "0")}`),
  );
  writeFileSync(output, `${messages.map((message) => JSON.stringify(message)).join("\n")}\n`, "utf8");
  console.error(JSON.stringify({
    output,
    input_files: files.length,
    messages: messages.length,
    conversations: new Set(messages.map((m) => `${m.source_platform}:${m.conversation_id}`)).size,
  }, null, 2));
  process.exit(0);
}
if (!file || !["score", "report"].includes(mode)) usage();

const text = readFileSync(file, "utf8");
const messages: KairosMessage[] = [];

for (const [index, line] of text.split(/\r?\n/).entries()) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  try {
    messages.push(JSON.parse(trimmed) as KairosMessage);
  } catch (err) {
    throw new Error(`Invalid JSONL at line ${index + 1}: ${(err as Error).message}`);
  }
}

const result = scoreMessages(messages);

if (mode === "report") {
  const format = optionValue(args, "--format") ?? "markdown";
  if (format !== "markdown") {
    throw new Error(`Unsupported report format: ${format}`);
  }
  const markdown = generateMarkdownReport(result);
  const output = optionValue(args, "--output");
  if (output) {
    writeFileSync(output, markdown, "utf8");
  } else {
    console.log(markdown);
  }
} else {
  console.log(JSON.stringify(result, null, 2));
}

function optionValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

function positionalArgs(args: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      i += 1;
      continue;
    }
    out.push(arg);
  }
  return out;
}

function collectInputFiles(path: string): string[] {
  const info = statSync(path);
  if (info.isFile()) {
    return SUPPORTED_EXTENSIONS.has(extname(path).toLowerCase()) ? [path] : [];
  }
  if (!info.isDirectory()) return [];
  const out: string[] = [];
  for (const child of readdirSync(path)) {
    if ([".git", "node_modules", "dist", "coverage", ".next"].includes(child)) continue;
    out.push(...collectInputFiles(join(path, child)));
  }
  return out;
}
