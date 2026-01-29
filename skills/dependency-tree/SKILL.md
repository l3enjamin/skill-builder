---
name: dependency-tree
description: |
  Visualize skill dependency graph using npm. Shows which skills depend on what, detects conflicts, suggests resolution order.

metadata:
  keywords:
    - dependency-resolution
    - skill-graph
    - prerequisite-chain
    - npm-ls
    - conflict-detection
  
  compatibility:
    exit_when:
      - "Not in skill-builder workspace"
      - "npm is not installed"
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
IF NOT exists("package.json") OR NOT exists("skills/"):
    RETURN {proceed: false, reason: "Not in skill-builder workspace"}
    EXIT

# Check if npm is available
result = terminal.execute("npm --version")
IF result.error:
    RETURN {proceed: false, reason: "npm not installed. Install Node.js"}
    EXIT

# Check if any skills exist
skills = terminal.execute("ls skills/*/package.json")
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
# Use npm's native dependency resolution
cmd = "npm ls"
IF skill_name:
    cmd += f" {skill_name}"
IF depth:
    cmd += f" --depth={depth}"
IF format == "json":
    cmd += " --json"

tree = terminal.execute(cmd)

# Parse output
lines = tree.split("\n")
total_skills = count_unique_packages(lines)
max_depth = calculate_max_depth(lines)

# Check for conflicts (npm will show warnings/errors)
conflicts = parse_conflicts(tree)

RETURN {
    type: "dependency_graph",
    content: tree,
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
npm ls --depth=0
```

**Check specific skill dependencies:**
```bash
npm ls design-thinking-ideation
```

**Export as JSON for programmatic use:**
```bash
npm ls --depth=2 --json
```

---

## Example Output

```
$ npm ls design-thinking-ideation
@skill-builder/workspace@1.0.0
└── @skills/design-thinking-ideation@1.0.0
```

---

*Powered by npm. Because package managers solved this problem decades ago.*
