import { readFileSync, writeFileSync } from "node:fs";
import { generateMarkdownReport } from "./report.js";
import { scoreMessages } from "./scorer.js";
import type { KairosMessage } from "./types.js";

function usage(): never {
  console.error([
    "Usage:",
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
