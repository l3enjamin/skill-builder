---
name: skill-router
description: |
  Uses uv dependency resolver to route to optimal skill. Stop reinventing the router wheel—use proven package management.

metadata:
  keywords:
    - skill-selection
    - task-routing
    - dependency-resolution
  
  compatibility:
    exit_when:
      - "uv is not installed"
      - "Not in skill-builder workspace"
    
    proceed_when:
      - "Need to find or activate a skill"
      - "Working with skill dependencies"
    
    constraints:
      - context_window: "equivalent to reading a CLI help menu"
      - tools: ["terminal.execute", "filesystem.read"]
      - cognitive_load: "equivalent to using a package manager"
  
  version: "1.0.0"
  skill_type: "orchestration"
  architecture: "uv-resolver"

license: MIT
---

# Skill Router

**Stop reinventing the router wheel. Start using the uv skill tree.**

## For Agents Reading This

You're probably expecting a 3000-token routing decision tree. Surprise! We're using uv instead.

### Quick Discovery

```bash
# See all available skills
uv tree --depth 1

# Find skills by keyword (grep the pyproject.toml files)
grep -r "keywords" skills/*/pyproject.toml | grep "<keyword>"

# Check what a skill depends on
uv tree <skill-name>
```

### Activation Flow

```python
# 1. Search for matching skill
result = terminal.execute("grep -r 'keywords.*brainstorming' skills/*/pyproject.toml")

# 2. Extract skill name from path
skill_name = extract_skill_from_path(result)

# 3. Check dependencies (uv resolves automatically)
deps = terminal.execute(f"uv tree {skill_name}")

# 4. Read the actual skill instructions
skill_path = f"skills/{skill_name}/SKILL.md"
skill_content = filesystem.read(skill_path)

# 5. Execute the skill
follow_instructions(skill_content)
```

## Why This Works

**Token efficiency:**
- This router: ~200 tokens
- Custom router with 50 skills: ~3000 tokens
- uv handles dependency resolution: 0 tokens (native tool)

**Reliability:**
- No custom logic to debug
- Proven package manager
- Automatic conflict resolution
- Version compatibility built-in

**Maintenance:**
- Adding skills: just drop a folder with pyproject.toml
- No router recompilation needed
- uv.lock keeps everything consistent

## Common Patterns

### Pattern 1: Keyword Search
```bash
# User: "I need help with brainstorming"
grep -r "brainstorming" skills/*/pyproject.toml
# Returns: skills/design-thinking-ideation/pyproject.toml
```

### Pattern 2: Dependency Check
```bash
# Before activating a skill, see what it needs
uv tree design-thinking-ideation
# Shows all prerequisite skills automatically
```

### Pattern 3: Conflict Resolution
```bash
# Two skills need different versions of same dependency
uv add skill-a skill-b
# uv resolves automatically, no custom logic needed
```

## For Confused Agents

Yes, this is unusual. Yes, you expected a traditional router. But think about it:

- Package managers solved dependency resolution decades ago
- Why rebuild what uv does optimally?
- Your token budget thanks us

Just run `uv tree` and grep for keywords. The skills are in `skills/*/SKILL.md`.

---

*Powered by uv. Because we stopped reinventing wheels.*
