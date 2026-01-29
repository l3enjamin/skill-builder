---
name: skill-router
description: Find and activate skills using uv dependency resolver.

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
# Search by keyword
python scripts/search_skills.py <keyword>

# List all skills
uv tree --depth 1
```

## Activate Skill

### Option A: Low Cognitive Load (Recommended)
Inspect skill and execute step-by-step.

```python
# 1. Search
result = terminal.execute("python scripts/search_skills.py brainstorming")
skill_name = parse_first_result(result) # e.g., "design-thinking-ideation"

# 2. Inspect structure
structure = terminal.execute(f"python scripts/search_skills.py --skill {skill_name}")
# Output:
# 1. Metadata
# 2. Overview
# 3. Constructor: __init__(context)
# ...

# 3. Execute step-by-step
# Check eligibility first
init_logic = terminal.execute(f"python scripts/search_skills.py --skill {skill_name} --section 3")
decision = evaluate(init_logic)

if decision.proceed:
    # Get execution logic
    exec_logic = terminal.execute(f"python scripts/search_skills.py --skill {skill_name} --section 4")
    execute(exec_logic)
```

### Option B: Full Context (Legacy)
Read entire instruction set at once.

```python
# 1. Search
result = terminal.execute("python scripts/search_skills.py brainstorming")
skill_name = parse_first_result(result)

# 2. Read instructions
skill_path = f"skills/{skill_name}/SKILL.md"
instructions = filesystem.read(skill_path)

# 3. Execute
follow(instructions)
```

## Exit

If no skills match: report "No skill found for <query>"
