# Claude Skill: KAIROS-ORBIT Lite

This repository includes a Claude-compatible project skill at:

```text
.claude/skills/kairos-orbit-lite/SKILL.md
```

The skill helps Claude or Claude Code run KAIROS-ORBIT Lite on local AI
conversation exports and transcript archives.

## What The Skill Does

When invoked, the skill instructs Claude to:

1. Use or clone the public `kairos-orbit` repository.
2. Build the deterministic scorer.
3. Discover candidate AI conversation exports in approved local paths.
4. Normalize accessible transcripts to KAIROS JSONL.
5. Generate a Markdown Operator Fluency Report.
6. Explain confidence, data gaps, and privacy limits.

The skill is local-first. It should not upload raw transcript data or commit
normalized transcript files.

## Claude Code Project Use

Clone the repository and start Claude Code in it:

```bash
git clone https://github.com/niclydon/kairos-orbit.git
cd kairos-orbit
claude
```

Claude Code discovers project skills under `.claude/skills/`. Invoke directly:

```text
/kairos-orbit-lite
```

Or ask naturally:

```text
Run KAIROS-ORBIT Lite on my local AI conversation exports and generate a report.
```

Claude should first run a discovery-only pass and show candidate files before
normalizing broad local folders.

## Personal Claude Code Install

To make the skill available across projects:

```bash
git clone https://github.com/niclydon/kairos-orbit.git
cd kairos-orbit
bash scripts/install-claude-skill.sh
```

This copies the skill to:

```text
~/.claude/skills/kairos-orbit-lite/
```

After installation, open Claude Code in any project and run:

```text
/kairos-orbit-lite
```

or ask:

```text
Use KAIROS-ORBIT Lite to analyze my accessible AI conversation history and
generate a local report.
```

## Claude.ai Custom Skill Packaging

For Claude.ai custom skill upload, package the skill directory itself:

```bash
cd kairos-orbit/.claude/skills
zip -r kairos-orbit-lite.zip kairos-orbit-lite
```

Upload `kairos-orbit-lite.zip` as a custom skill. The skill can instruct Claude
to clone the public repository when it needs the scorer and collector scripts.

## Skill Directory Structure

```text
kairos-orbit-lite/
└── SKILL.md
```

The repository keeps executable code outside the skill directory so the skill
stays small. When triggered, Claude uses the repo's public scripts:

- `scripts/collect-lite-input.mjs` for discovery-only scans
- `node dist/cli.js normalize` for deterministic native parsing
- `dist/cli.js`

If `dist/cli.js` is missing, Claude should run `npm install` and
`npm run build` first.

## Safety Boundaries

- Ask before scanning broad directories.
- Prefer `--discover-only` before reading transcript contents.
- Write normalized input to `*.jsonl.private`.
- Do not commit raw exports or normalized transcript files.
- Treat scores as exploratory evidence, not diagnosis or ranking.

## Expected Skill Output

The skill should finish by reporting:

- normalized private JSONL path;
- Markdown report path;
- conversations scored;
- source labels;
- date range;
- Operator Index;
- confidence;
- strongest and softest dimensions;
- data gaps.

See also:

- `docs/agent-quickstart.md`
- `docs/coding-cli-integration.md`
- `docs/lite.md`
- `docs/data-requirements.md`
- `docs/privacy.md`
