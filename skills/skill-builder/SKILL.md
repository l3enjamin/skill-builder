---
name: skill-builder
description: |
  Meta-skill for creating new skills. Orchestrates research, compilation, and validation phases.

metadata:
  keywords:
    - create-skill
    - new-skill
    - skill-generation
    - meta-skill
    - skill-template
  
  compatibility:
    exit_when:
      - "User just wants to use existing skills"
      - "Skill already exists in library"
      - "Request is for modifying existing skill"
    
    proceed_when:
      - "User wants to create a new skill from scratch"
      - "Need to document complex workflow as reusable skill"
      - "Converting manual procedure into skill format"
    
    constraints:
      - context_window: "equivalent to reading a technical manual chapter"
      - tools: ["filesystem.read", "filesystem.write"]
      - cognitive_load: "equivalent to structured analysis task"
  
  version: "1.0.0"
  skill_type: "orchestration"
  architecture: "linear"

license: MIT
---

# Class: MainExecution

## Constructor: __init__(context)

**Input:**
```yaml
context:
  skill_name: string
  skill_domain: string
  user_description: string
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
# Check if skill already exists
existing = terminal.execute(f"node scripts/search_skills.js {skill_name}")
IF existing.success:
    RETURN {proceed: false, reason: f"Skill {skill_name} already exists"}
    EXIT

# Check if user wants to create or just use
IF context lacks "create" OR "new" OR "build":
    RETURN {proceed: false, reason: "Use search_skills.js to find existing skills"}
    EXIT

RETURN {proceed: true, reason: "Ready to build new skill"}
```

---

## Method: execute()

**Orchestrates 3-phase skill creation**

**Input:**
```yaml
skill_spec:
  name: string
  domain: string
  description: string
```

**Output:**
```yaml
artifact:
  type: "complete_skill"
  files:
    - package.json
    - SKILL.md
  status: "ready" | "needs_review"
```

**Process:**
```python
# Phase 1: Research
researcher_prompt = filesystem.read("skills/skill-builder/resources/researcher.md")
research_report = execute_phase(researcher_prompt, skill_spec)

# Phase 2: Compile
compiler_prompt = filesystem.read("skills/skill-builder/resources/compiler.md")
template = filesystem.read("skills/skill-builder/resources/template.md")
skill_md = execute_phase(compiler_prompt, research_report, template)

# Phase 3: Quality Assurance
qa_prompt = filesystem.read("skills/skill-builder/resources/quality-assurance.md")
qa_report = execute_phase(qa_prompt, skill_md, research_report)

# Generate package.json
package_json = generate_package_json(skill_md.frontmatter)

# Write to skills directory
skill_dir = f"skills/{skill_spec.name}"
filesystem.write(f"{skill_dir}/SKILL.md", skill_md)
filesystem.write(f"{skill_dir}/package.json", package_json)

IF qa_report.status == "PASS":
    RETURN {type: "complete_skill", files: [package_json, skill_md], status: "ready"}
ELSE:
    RETURN {type: "complete_skill", files: [package_json, skill_md], status: "needs_review", issues: qa_report.issues}
```

**Checkpoint:**
```python
IF skill_dir exists AND has valid SKILL.md:
    # Sync workspace
    terminal.execute("npm install")
    RETURN artifact
ELSE:
    EXIT "Failed to create skill files"
```

---

## Usage

**Create a new skill:**
```
User: "Create a skill for managing GitHub issue trees"

Agent:
1. Activates skill-builder
2. Runs 3 phases (research → compile → QA)
3. Outputs skills/issue-tree/SKILL.md + package.json
4. Runs npm install
5. New skill is now searchable
```

**Test new skill:**
```bash
node scripts/search_skills.js issue-tree
# Should return: issue-tree
```

---

## Notes

**Best paired with:** None (bootstrap skill)

**Conflicts with:** skill-updater (for modifying existing skills)

**Token profile:** Distributed across 3 phases

---

*The skill that creates skills. Meta AF.*
