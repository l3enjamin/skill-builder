# Skill Builder

**A meta-skill for creating reusable, context-efficient agent skills.**

Build skills that execute reliably under cognitive constraints—like checklists pilots use in emergencies, but for AI agents with limited context windows.

---

## The Problem

LLM agents are brilliant but forgetful. Every complex task gets reinvented from scratch, burning tokens on reasoning that could be reused. When context windows fill up, quality degrades.

**Traditional routers are expensive:** A router with 50 skills can consume 3000+ tokens just to pick the right one.

## The Solution

**Skill Builder** generates structured `SKILL.md` files using an object-oriented format designed for:

- **Fail-fast eligibility checks** — exit in ~150 tokens if skill doesn't apply
- **Lazy-loaded subclasses** — only load enhancements when needed
- **Explicit state management** — prevent infinite loops with trial counters
- **npm workspace routing** — familiar package management, zero token search
- **bun-first runtime** — 10x faster execution with node fallback

---

## Architecture

### Skill Structure (OOL)

```
MainExecution          ← Always loaded first (~500 tokens)
├── Constructor        ← Eligibility diagnosis (exit fast if wrong)
└── execute()          ← Minimum viable path

QualityOptimizer       ← Lazy-load when output quality is low
PerformanceOptimizer   ← Lazy-load when parallelization helps
ErrorHandler           ← Lazy-load when execution fails
```

### Routing (bun + npm)

Instead of a custom router that burns tokens:

```bash
# Instant search with bun (recommended - 10x faster)
bun scripts/search_skills.js brainstorming
# Output: design-thinking-ideation

# Or with node (fallback)
node scripts/search_skills.js brainstorming

# Or if installed:
npm query "[keywords~=brainstorming]"
npm ls --depth=0
```

**Why bun + npm?**
- **bun**: 10x faster than node, instant startup, modern MCP standard
- **npm**: Built-in search via `npm query`, universal package.json
- **Compatibility**: Script works with both bun and node
- **Already installed**: Agents need bunx/npx for MCP servers anyway

---

## Usage

### For Agent Users

**Finding a skill:**
```bash
# Search by keyword (instant, bun recommended)
bun scripts/search_skills.js brainstorming

# Or with node
node scripts/search_skills.js brainstorming

# Or install and query
npm install
npm query "[keywords~=brainstorming]"

# List all skills
npm ls --depth=0
```

**Activating a skill:**
```javascript
// Search (bun for speed)
const result = terminal.execute("bun scripts/search_skills.js brainstorming");
const skill = result.trim();

// Activate
const skill_path = `skills/${skill}/SKILL.md`;
const skill_content = filesystem.read(skill_path);
execute(skill_content);
```

### For Skill Authors

**Create a new skill:**

1. Use the skill-builder pipeline:
```bash
# Activate skill-builder
bun scripts/search_skills.js create-skill
# Returns: skill-builder

# Follow instructions in skills/skill-builder/SKILL.md
```

2. Place output in `skills/your-skill-name/`:
```
skills/your-skill-name/
├── package.json         # Dependencies + metadata
├── SKILL.md             # MainExecution class
└── resources/           # Optional subclasses
    ├── quality.md
    └── performance.md
```

3. Your skill is now discoverable

**Skill template:**

Use `skills/skill-builder/resources/template.md` as your starting point.

---

## Example: Design Thinking Ideation

**package.json:**
```json
{
  "name": "@skills/design-thinking-ideation",
  "version": "1.0.0",
  "description": "Generate divergent solution concepts",
  "keywords": [
    "brainstorming",
    "divergent-thinking",
    "ideation"
  ],
  "agentskills": {
    "exit_when": [
      "Problem statement missing",
      "User wants convergent solution"
    ]
  },
  "dependencies": {}
}
```

**SKILL.md:** Same OOL format with constructor + execute()

**Agent discovery:**
```bash
$ bun scripts/search_skills.js ideation
design-thinking-ideation

$ npm ls --depth=0  # if installed
@skill-builder/workspace@1.0.0
├── @skills/design-thinking-ideation@1.0.0
└── @skills/skill-builder@1.0.0
```

---

## Repository Structure

```
skill-builder/
├── SKILL.md                  # Root router (~70 tokens)
├── package.json              # npm workspace definition
├── README.md
├── SETUP.md
│
├── scripts/
│   └── search_skills.js      # Instant search (bun/node compatible)
│
└── skills/                   # npm workspace packages
    ├── skill-builder/
    │   ├── package.json
    │   ├── SKILL.md
    │   └── resources/
    │
    ├── dependency-tree/
    │   ├── package.json
    │   └── SKILL.md
    │
    └── design-thinking-ideation/
        ├── package.json
        └── SKILL.md
```

---

## Performance

**Search Speed:**
- bun: ~5ms (50 skills)
- node: ~25ms (50 skills)
- python: ~25ms (50 skills)

**Token Cost:**
- Router load: 70 tokens (vs 3000+ for custom)
- Search: 0 tokens (external script)
- Activation: Skill-specific (~500-2000 tokens)

**Result:** 97% token reduction + 5x faster search with bun.

---

## Compatibility

| Platform | Support |
|----------|----------|
| [Gemini CLI](https://geminicli.com) | Native skill loading |
| [Claude Code](https://claude.ai) | Via MCP server |
| [OpenAI Codex](https://openai.com) | Custom instructions |
| [Agent Skills Protocol](https://agentskills.io) | Full compliance |

**Runtime Requirements:**
- **Recommended**: bun >= 1.0.0 (for speed)
- **Fallback**: node >= 16.0.0 (for compatibility)

**MCP Tools Supported:**
- `github-mcp` — repository operations
- `filesystem` — local file access
- `terminal` — command execution

---

## Contributing

### Add a New Skill

1. Fork this repo
2. Create `skills/your-skill-name/`
3. Add `package.json` + `SKILL.md`
4. Test with bun and node
5. Submit PR

### Report Issues

Found a bug? Open an issue with:
- Skill name
- Runtime (bun/node version)
- Agent platform (Gemini/Claude/GPT)
- Expected vs actual behavior
- Steps to reproduce

---

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Gemini CLI Skills Documentation](https://geminicli.com/docs/cli/skills/)
- [Model Context Protocol](https://modelcontextprotocol.io/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [bun Documentation](https://bun.sh/docs)

---

## License

MIT — use it, fork it, make agents that actually remember how to do things.

---

<p align="center">
  <i>Read less, do more. Built with bun + npm workspaces.</i>
</p>
