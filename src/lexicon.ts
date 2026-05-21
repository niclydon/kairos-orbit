export const MARKERS = {
  context: [
    "context", "background", "audience", "constraint", "requirement",
    "based on", "use this", "given that", "attached", "source",
  ],
  examples: ["example", "for instance", "like this", "few-shot", "reference"],
  format: ["format", "structure", "bullets", "table", "json", "length", "style", "tone", "concise"],
  goal: ["goal", "outcome", "trying to", "i need", "i want", "objective", "success"],
  preferences: ["act as", "role", "work with me", "be concise", "be direct", "ask me", "do not"],
  verification: [
    "verify", "test", "check", "prove", "evidence", "source", "citation",
    "confirm", "inspect", "validate", "smoke", "fact-check",
  ],
  correction: [
    "wrong", "incorrect", "not right", "broken", "failed", "failing",
    "missed", "forgot", "not what i asked", "stale", "regression",
  ],
  boundary: [
    "do not", "don't", "must not", "never", "only", "scope", "boundary",
    "preserve", "avoid", "privacy", "approval", "permission",
  ],
  execution: [
    "run", "implement", "edit", "patch", "deploy", "commit", "push",
    "migrate", "backfill", "create", "update", "ship",
  ],
  artifact: [
    "file", "doc", "report", "code", "script", "schema", "migration",
    "ticket", "issue", "pull request", "diff", "patch",
  ],
  provenance: ["source", "citation", "evidence", "trace", "reference", "link", "id", "audit"],
  collegial: [
    "please", "thanks", "thank you", "appreciate", "could you", "can you",
    "let's", "we need", "we should", "good catch", "nice",
  ],
  affectFriction: [
    "frustrated", "annoyed", "angry", "embarrassed", "condescending",
    "patronizing", "ridiculous", "terrible", "awful", "bad answer",
  ],
};

export function countMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase();
  return markers.reduce((count, marker) => count + (lower.includes(marker) ? 1 : 0), 0);
}
