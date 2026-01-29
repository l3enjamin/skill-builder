---
name: hypothesis-testing
description: |
  Execute cheapest tests in the logic-tree one-by-one to eliminate branches.

metadata:
  keywords:
    - testing
    - verification
    - hypothesis
    - elimination

  compatibility:
    proceed_when:
      - "Logic tree has multiple branches"
      - "Need to narrow down possibilities"

    constraints:
      - tools: ["@skills/logic-tree", "terminal.execute"]

  version: "1.0.0"
  skill_type: "cognitive"

license: MIT
---

# Class: HypothesisTester

## Constructor: __init__(context)

**Input:**
```yaml
context:
  logic_tree: object      # The active logic tree structure
  budget: string          # "time" or "cost" constraint (e.g. "low-cost")
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
IF NOT logic_tree OR NOT logic_tree.branches:
    RETURN {proceed: false, reason: "No hypotheses to test"}

RETURN {proceed: true, reason: "Ready to test hypotheses"}
```

---

## Method: execute()

**Input:**
```yaml
branches: list
```

**Output:**
```yaml
test_results: list
confidence_scores: dict
```

**Process:**
```python
results = []
scores = {}

# Sort branches by cost of testing (cheapest first)
sorted_branches = sort_by_test_cost(branches)

FOR branch IN sorted_branches:
    # Formulate a test
    test = design_test(branch)

    # Execute test (simulation or instruction to user)
    outcome = run_test(test)

    # Update logic tree based on result
    IF outcome == "fail":
        logic_tree.remove(node=branch.name)
        scores[branch.name] = 0.0
        results.append({branch: branch.name, status: "eliminated"})
    ELSE:
        scores[branch.name] = calculate_confidence(outcome)
        results.append({branch: branch.name, status: "survived"})

RETURN {
    test_results: results,
    confidence_scores: scores
}
```
