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

# Self-Reflection & Routing

Before executing any task, you must strictly follow this self-reflection protocol to ensure you fully understand the user's request.

## Step 1: Intent Confidence Check
**Question:** Are you confident with the user's intents?
- **NO / UNSURE:** Activate `intent-inference` skill.
  ```bash
  # Analyze intent
  bun scripts/run_skill.js intent-inference
  ```
- **YES:** Can you articulate them? Write them down.

## Step 2: Problem Articulation Check
**Question:** Can you articulate the problems that you need to address?
- **NO / UNSURE:** Activate `problem-statement` skill.
  ```bash
  # Define problem using 5 Whys
  bun scripts/run_skill.js problem-statement
  ```
- **YES:** Write down the root problem.

## Step 3: Scoping Check
**Question:** Can you list 3 items in-scope and 3 items out-of-scope?
- **NO / UNSURE:** Activate `scoping` skill.
  ```bash
  # Define scope
  bun scripts/run_skill.js scoping
  ```
- **YES:** Write them down.

## Step 4: Artifact Recording
Ensure all your findings (Intent, Problem, Scope) are recorded in `debug/context.json`.
```bash
mkdir -p debug
# Append or write findings to debug/context.json
```

---

# Skill Router (Standard Mode)

Once you have clarity on the intent, problem, and scope, proceed to find and activate the appropriate skills to solve the task.

## Find Skills

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
const skill_path = `skills/${skill_name}/SKILL.md`; // OR skills/<skill_name>/skill.json
const instructions = filesystem.read(skill_path);

// 3. Execute
follow(instructions);
```

## Exit

If no skills match: report "No skill found for <query>"
