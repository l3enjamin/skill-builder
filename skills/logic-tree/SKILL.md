---
name: logic-tree
description: |
  Setting up a private tree with bun add/remove/pm/why for general purpose like hypothesis, diagnosis, ideation, etc.

metadata:
  keywords:
    - logic-tree
    - hypothesis-tree
    - diagnosis
    - bun
    - tree-structure

  compatibility:
    proceed_when:
      - "Need to structure a complex problem"
      - "Creating a hypothesis tree for diagnosis"
      - "Brainstorming alternatives"

    constraints:
      - tools: ["terminal.execute", "filesystem"]

  version: "1.0.0"
  skill_type: "tool-function"

license: MIT
---

# Class: LogicTreeManager

## Constructor: __init__(context)

**Input:**
```yaml
context:
  root_concept: string      # The root problem or idea
  working_directory: string # Where to build the tree (optional)
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
# Initialize a new logic tree structure
# This could involve creating a new directory and a package.json
# to leverage package manager logic for the tree.

IF NOT working_directory:
    working_directory = create_temp_dir(prefix="logic_tree_")

# Initialize bun project
terminal.execute(f"cd {working_directory} && bun init -y")

RETURN {proceed: true, reason: "Logic tree initialized"}
```

---

## Method: execute()

**Input:**
```yaml
action: "add" | "remove" | "why" | "view"
params:
  node: string         # Name of the branch/hypothesis (e.g., "network-issue")
  parent: string       # Parent node (optional, defaults to root)
  description: string  # Detail about the hypothesis
```

**Output:**
```yaml
logic_tree:
  root: string
  branches: list
pruning_strategy: string
quick_retrieval: string
```

**Process:**
```python
# Map actions to filesystem/bun operations
# We use 'bun add' metaphorically or literally if possible,
# but effectively we are building a dependency graph.

IF action == "add":
    # Add a branch. We might create a dummy package or folder.
    # For a logic tree, folders + package.json works well.
    create_branch(node, parent, description)
    # Could use 'bun add ./local-path' to link it in package.json

IF action == "remove":
    remove_branch(node)

IF action == "why":
    # Explain why a node exists (trace back to root)
    path = trace_path(node)
    RETURN explanation

# Generate outputs
tree_structure = generate_tree_view() # Visualize the tree
pruning = analyze_pruning(tree_structure) # Identify leaf nodes or weak branches
retrieval = get_filesystem_paths(tree_structure)

RETURN {
    logic_tree: tree_structure,
    pruning_strategy: pruning,
    quick_retrieval: retrieval
}
```

---

## Usage Examples

**Initialize a diagnosis tree:**
`logic-tree init --root="slow-website"`

**Add hypotheses:**
`logic-tree add --node="database-latency" --parent="slow-website"`
`logic-tree add --node="network-congestion" --parent="slow-website"`

**Check structure:**
`logic-tree view`

**Prune a branch:**
`logic-tree remove --node="network-congestion"`

---
