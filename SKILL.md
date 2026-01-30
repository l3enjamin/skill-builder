---
name: skill-router
description: Find and activate skills using npm workspaces.

metadata:
  keywords:
    - skill-selection
    - task-routing
  
  version: "1.0.0"
  skill_type: "orchestration"

license: MIT
---

# Skill Router

## Find Skills

### Smart Search (ADK-powered)
Uses Google's ADK and Gemini to semantically understand your intent and route to the best skill.

```bash
# Requires GOOGLE_API_KEY
export GOOGLE_API_KEY=your_key
node scripts/smart_search.js "I need to generate some wild ideas"
```

### Keyword Search (Legacy)
Fast, local regex-based search.

```bash
# Search by keyword (instant, no install needed)
bun scripts/search_skills.js <keyword>

# Or with node (fallback)
node scripts/search_skills.js <keyword>

# List all skills (if installed)
npm ls --depth=0

# Query installed skills (if installed)
npm query "[keywords~=<keyword>]"
```

## Activate Skill

```javascript
// 1. Search
const result = terminal.execute("bun scripts/search_skills.js brainstorming");
const skill_name = parse_first_result(result);

// 2. Read instructions
const skill_path = `skills/${skill_name}/SKILL.md`;
const instructions = filesystem.read(skill_path);

// 3. Execute
follow(instructions);
```

## Exit

If no skills match: report "No skill found for <query>"
