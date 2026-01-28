# Setup Guide

## Prerequisites

1. **Install uv** (if not already installed):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. **Verify installation**:
```bash
uv --version
```

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/l3enjamin/skill-builder.git
cd skill-builder
```

### 2. Initialize the workspace
```bash
# Sync all skills and dependencies
uv sync

# View the skill tree
uv tree --depth 1
```

Output should look like:
```
skill-builder v1.0.0
├── dependency-tree v1.0.0
└── design-thinking-ideation v1.0.0
```

### 3. Test skill discovery

**Search by keyword:**
```bash
grep -r "brainstorming" skills/*/pyproject.toml
```

**Check dependencies:**
```bash
uv tree design-thinking-ideation
```

**Read a skill:**
```bash
cat skills/design-thinking-ideation/SKILL.md
```

## For Agent Integration

### Gemini CLI

```bash
# Point to root SKILL.md (router)
gemini --skill ./SKILL.md

# Agent will use uv to discover skills
```

### Claude Desktop (MCP)

```json
// Add to claude_desktop_config.json
{
  "mcpServers": {
    "skill-builder": {
      "command": "uvx",
      "args": ["mcp-server-skills", "--workspace", "/path/to/skill-builder"]
    }
  }
}
```

### Custom Agent

```python
import subprocess
import json

def find_skill(keyword):
    """Search skills by keyword"""
    result = subprocess.run(
        ["grep", "-r", f"keywords.*{keyword}", "skills/*/pyproject.toml"],
        capture_output=True,
        text=True
    )
    
    # Parse result to get skill path
    if result.stdout:
        path = result.stdout.split(":")[0]
        skill_name = path.split("/")[1]
        return skill_name
    return None

def load_skill(skill_name):
    """Load skill instructions"""
    skill_path = f"skills/{skill_name}/SKILL.md"
    with open(skill_path) as f:
        return f.read()

# Usage
skill = find_skill("brainstorming")
if skill:
    instructions = load_skill(skill)
    # Execute instructions...
```

## Creating Your First Skill

### 1. Research phase

```bash
# Use the researcher prompt
gemini --file meta/researcher.md "Explain the skill: [your skill name]"

# Save output to a file
```

### 2. Compilation phase

```bash
# Use the compiler with research output + template
gemini --file meta/compiler.md \
       --file meta/template.md \
       --file research_output.md

# Save output as skills/your-skill/SKILL.md
```

### 3. Add pyproject.toml

```toml
[project]
name = "your-skill"
version = "1.0.0"
description = "Brief description"
dependencies = []  # Add if skill depends on other skills

[tool.agentskills]
keywords = [
    "keyword1",
    "keyword2"
]

exit_when = [
    "Condition that makes skill inapplicable"
]

proceed_when = [
    "Condition that makes skill optimal"
]

skill_type = "tool-mcp"  # or tool-function, cognitive, etc.
```

### 4. Test the skill

```bash
# Sync to update workspace
uv sync

# Verify it appears in tree
uv tree --depth 1

# Test search
grep -r "your-keyword" skills/*/pyproject.toml
```

### 5. Quality check

```bash
gemini --file meta/quality-assurance.md \
       --file skills/your-skill/SKILL.md
```

## Troubleshooting

### uv not found
```bash
# Reinstall uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (if needed)
export PATH="$HOME/.cargo/bin:$PATH"
```

### Skill not appearing in tree
```bash
# Check pyproject.toml syntax
uv tree your-skill-name

# If error, validate TOML
python -c "import toml; toml.load('skills/your-skill/pyproject.toml')"
```

### Dependency conflicts
```bash
# uv will show conflicts automatically
uv tree

# To resolve, adjust version constraints in pyproject.toml
```

## Advanced Usage

### Visualizing dependencies

```bash
# Use the dependency-tree skill
cat skills/dependency-tree/SKILL.md

# See full dependency graph
uv tree
```

### Exporting skill registry

```python
import toml
from pathlib import Path
import json

skills = []
for p in Path("skills").rglob("pyproject.toml"):
    config = toml.load(p)
    skills.append({
        "name": config["project"]["name"],
        "description": config["project"]["description"],
        "keywords": config["tool"]["agentskills"]["keywords"]
    })

print(json.dumps(skills, indent=2))
```

### Batch testing skills

```bash
# Test all skills are parseable
for skill in skills/*/SKILL.md; do
    echo "Testing $skill..."
    # Your test logic here
done
```

## Next Steps

- Browse existing skills in `skills/`
- Read the template in `meta/template.md`
- Check out the [Agent Skills spec](https://agentskills.io/specification)
- Join discussions in Issues

---

*Remember: Stop reinventing the pip wheel. Start using the uv skill.*
