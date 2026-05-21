import { readFileSync } from "node:fs";
import { scoreMessages } from "./scorer.js";
import type { KairosMessage } from "./types.js";

function usage(): never {
  console.error("Usage: kairos-orbit <messages.jsonl>");
  process.exit(1);
}

const file = process.argv[2];
if (!file) usage();

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
console.log(JSON.stringify(result, null, 2));
