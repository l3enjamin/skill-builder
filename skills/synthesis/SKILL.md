---
name: synthesis
description: |
  Retrieve the logic-tree and compile findings into actionable recommendation.

metadata:
  keywords:
    - synthesis
    - recommendation
    - report
    - conclusion

  compatibility:
    proceed_when:
      - "Hypothesis testing is complete"
      - "A clear winner has emerged from the tree"
      - "Need a summary of findings"

    constraints:
      - tools: ["@skills/logic-tree"]

  version: "1.0.0"
  skill_type: "cognitive"

license: MIT
---

# Class: Synthesis

## Constructor: __init__(context)

**Input:**
```yaml
context:
  logic_tree: object      # The processed logic tree
  test_results: list      # Results from hypothesis testing
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
IF NOT test_results:
    RETURN {proceed: false, reason: "No test results to synthesize"}

RETURN {proceed: true, reason: "Ready to synthesize findings"}
```

---

## Method: execute()

**Input:**
```yaml
options:
  format: "text" | "json" | "markdown"
```

**Output:**
```yaml
diagnosis: string
recommendation: string
reasoning: string
```

**Process:**
```python
# 1. Analyze remaining branches in logic tree
survivors = logic_tree.get_branches()

# 2. Correlate with test results
confirmed_causes = [s for s in survivors if s in test_results and s.status == "survived"]

# 3. Formulate diagnosis
IF len(confirmed_causes) == 1:
    diagnosis = f"The root cause is {confirmed_causes[0]}"
    recommendation = generate_fix(confirmed_causes[0])
    reasoning = f"All other hypotheses were eliminated. Tests confirmed {confirmed_causes[0]}."
ELIF len(confirmed_causes) > 1:
    diagnosis = "Multiple potential causes remain: " + ", ".join(confirmed_causes)
    recommendation = "Conduct deeper testing on remaining candidates."
    reasoning = "Initial low-cost tests could not distinguish between these options."
ELSE:
    diagnosis = "Cause undetermined."
    recommendation = "Revisit logic tree and add new hypotheses."
    reasoning = "All initial hypotheses were eliminated."

RETURN {
    diagnosis: diagnosis,
    recommendation: recommendation,
    reasoning: reasoning
}
```
