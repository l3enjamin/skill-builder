---
name: diagnosis
description: |
  Use logic-tree to extract actual problem from apparent symptoms.

metadata:
  keywords:
    - diagnosis
    - problem-definition
    - root-cause
    - constraints

  compatibility:
    proceed_when:
      - "Symptoms are vague or confusing"
      - "Need to define the problem scope"

    constraints:
      - tools: ["@skills/logic-tree"]

  version: "1.0.0"
  skill_type: "cognitive"

license: MIT
---

# Class: Diagnosis

## Constructor: __init__(context)

**Input:**
```yaml
context:
  symptoms: list          # List of observed issues
  initial_statement: string # User's initial description
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
IF NOT symptoms AND NOT initial_statement:
    RETURN {proceed: false, reason: "No input provided for diagnosis"}

RETURN {proceed: true, reason: "Ready to diagnose"}
```

---

## Method: execute()

**Input:**
```yaml
symptoms: list
user_input: string
```

**Output:**
```yaml
root_question: string
constraints: list
success_criteria: list
```

**Process:**
```python
# 1. Initialize Logic Tree for symptoms
tree = logic_tree.init(root="diagnosis")

# 2. Map symptoms to branches
FOR symptom IN symptoms:
    logic_tree.add(node=symptom, parent="diagnosis", description="Observed symptom")

# 3. Analyze to find root question
# (This implies asking "why" for each symptom until convergence)
root_question = analyze_root_cause(tree)

# 4. Extract constraints and criteria
constraints = extract_constraints(user_input)
criteria = define_success(root_question)

RETURN {
    root_question: root_question,
    constraints: constraints,
    success_criteria: criteria
}
```
