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
