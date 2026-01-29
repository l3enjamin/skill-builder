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

```bash
# Search by keyword (instant, no install needed)
node scripts/search_skills.js <keyword>

# List all skills (if installed)
npm ls --depth=0

# Query installed skills (if installed)
npm query "[keywords~=<keyword>]"
```

## Activate Skill

```javascript
// 1. Search
const result = terminal.execute("node scripts/search_skills.js brainstorming");
const skill_name = parse_first_result(result);

// 2. Read instructions
const skill_path = `skills/${skill_name}/SKILL.md`;
const instructions = filesystem.read(skill_path);

// 3. Execute
follow(instructions);
```

## Exit

If no skills match: report "No skill found for <query>"
