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
  coordination: [
    "let's", "we need", "we should", "next step", "keep going", "pause",
    "stop", "continue", "priority", "scope", "handoff", "ship", "done",
    "good catch",
  ],
  affectFriction: [
    "frustrated", "annoyed", "angry", "embarrassed", "condescending",
    "patronizing", "ridiculous", "terrible", "awful", "bad answer",
    "waste of time", "unusable", "you ignored", "you made this worse",
  ],
  frameworkTerms: [
    "knowledge grounding", "agency design", "instrumented execution",
    "reflexive calibration", "outcome integration", "social-affective stance",
    "kairos score", "operator index",
  ],
};

export function countMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase();
  const tokens = tokenize(lower);
  return markers.reduce((count, marker) => count + (hasMarker(lower, tokens, marker) ? 1 : 0), 0);
}

function hasMarker(lowerText: string, tokens: string[], marker: string): boolean {
  const normalized = marker.toLowerCase();
  if (lowerText.includes(normalized)) return true;
  const markerTokens = tokenize(normalized);
  if (markerTokens.length === 0) return false;
  if (markerTokens.length === 1) {
    return tokens.some((token) => tokenMatches(token, markerTokens[0]));
  }
  const markerSet = new Set(markerTokens);
  const overlap = markerTokens.filter((token) =>
    tokens.some((candidate) => tokenMatches(candidate, token)),
  ).length;
  return overlap / markerSet.size >= 0.8;
}

function tokenMatches(token: string, marker: string): boolean {
  if (token === marker) return true;
  if (stem(token) === stem(marker)) return true;
  if (marker.length < 5 || token.length < 5) return false;
  return similarity(token, marker) >= 0.84;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean);
}

function stem(token: string): string {
  if (token.endsWith("ying") && token.length > 5) return `${token.slice(0, -4)}ie`;
  if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 4) return token.slice(0, -1);
  return token;
}

function similarity(a: string, b: string): number {
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}
