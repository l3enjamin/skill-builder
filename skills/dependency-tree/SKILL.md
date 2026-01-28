---
name: dependency-tree
description: |
  Visualize skill dependency graph using uv. Shows which skills depend on what, detects conflicts, suggests resolution order.

metadata:
  keywords:
    - dependency-resolution
    - skill-graph
    - prerequisite-chain
    - uv-tree
    - conflict-detection
  
  compatibility:
    exit_when:
      - "Not in skill-builder workspace"
      - "uv is not installed"
      - "No skills installed yet"
    
    proceed_when:
      - "Need to understand skill relationships"
      - "Debugging circular dependencies"
      - "Planning skill activation order"
    
    constraints:
      - context_window: "equivalent to reading a dependency graph"
      - tools: ["terminal.execute"]
      - cognitive_load: "equivalent to reading a tree structure"
  
  version: "1.0.0"
  skill_type: "tool-function"
  architecture: "linear"

license: MIT
---

# Class: MainExecution

## Constructor: __init__(context)

**Input:**
```yaml
context:
  skill_name: string | null  # Specific skill or entire tree
  depth: int                 # How deep to traverse
  format: "tree" | "json"
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
# Check if in skill-builder workspace
IF NOT exists("pyproject.toml") OR NOT exists("skills/"):
    RETURN {proceed: false, reason: "Not in skill-builder workspace"}
    EXIT

# Check if uv is available
result = terminal.execute("uv --version")
IF result.error:
    RETURN {proceed: false, reason: "uv not installed. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"}
    EXIT

# Check if any skills exist
skills = terminal.execute("ls skills/*/pyproject.toml")
IF skills.empty:
    RETURN {proceed: false, reason: "No skills found in workspace"}
    EXIT

RETURN {proceed: true, reason: "Ready to visualize dependencies"}
```

---

## Method: execute()

**Input:**
```yaml
options:
  skill_name: string | null
  depth: int
  format: string
```

**Output:**
```yaml
artifact:
  type: "dependency_graph"
  content: string
  insights:
    total_skills: int
    max_depth: int
    conflicts: list
```

**Process:**
```python
# Use uv's native dependency resolution
IF skill_name:
    tree = terminal.execute(f"uv tree {skill_name} --depth {depth}")
ELSE:
    tree = terminal.execute(f"uv tree --depth {depth}")

# Parse output
lines = tree.split("\n")
total_skills = count_unique_packages(lines)
max_depth = calculate_max_depth(lines)

# Check for conflicts (uv will show warnings)
conflicts = parse_conflicts(tree)

IF format == "json":
    output = convert_to_json(tree)
ELSE:
    output = tree  # Native uv tree format

RETURN {
    type: "dependency_graph",
    content: output,
    insights: {
        total_skills: total_skills,
        max_depth: max_depth,
        conflicts: conflicts
    }
}
```

**Checkpoint:**
```python
IF output contains data:
    RETURN artifact
ELSE:
    EXIT "Failed to generate dependency tree"
```

---

## Usage Examples

**See entire skill library:**
```bash
uv tree --depth 1
```

**Check specific skill dependencies:**
```bash
uv tree design-thinking-ideation
```

**Export as JSON for programmatic use:**
```bash
uv tree --depth 2 --format json
```

---

## Example Output

```
$ uv tree design-thinking-ideation
design-thinking-ideation v1.0.0
├── filesystem-tools v2.1.0
│   └── error-handler v1.0.0
└── terminal-executor v3.0.1
    └── error-handler v1.0.0  ✓ Shared dependency, no conflict

2 packages with 1 shared dependency
```

---

*Powered by uv. Because package managers solved this problem decades ago.*
