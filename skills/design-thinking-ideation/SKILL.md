---
name: design-thinking-ideation
description: |
  Generate divergent solution concepts from a problem statement. Requires defined problem space, produces ranked idea candidates.

metadata:
  keywords:
    - brainstorming
    - concept-generation
    - divergent-thinking
    - ideation
    - creative-problem-solving
    - design-thinking
  
  compatibility:
    exit_when:
      - "Problem statement is missing or undefined"
      - "User wants convergent solution, not exploration"
      - "Time constraint under 5 minutes"
    
    proceed_when:
      - "Problem is defined but solution space is open"
      - "Multiple stakeholder perspectives available"
      - "Quantity of ideas valued over immediate quality"
    
    constraints:
      - context_window: "equivalent to reading a short essay"
      - tools: []
      - cognitive_load: "equivalent to creative brainstorming session"
  
  version: "1.0.0"
  skill_type: "cognitive"
  architecture: "ool"

license: MIT
---

# Class: MainExecution

## Constructor: __init__(context)

**Input:**
```yaml
context:
  problem_statement: string
  constraints: list
  stakeholders: list
  time_available: int  # minutes
```

**Output:**
```yaml
decision:
  proceed: bool
  reason: string
```

**Process:**
```python
# Fail-fast: Problem must be defined
IF NOT problem_statement OR problem_statement.length < 10:
    RETURN {proceed: false, reason: "Problem statement missing or too vague"}
    EXIT

# Check if user wants exploration or solution
IF context contains keywords ["solution", "answer", "fix", "implement"]:
    RETURN {proceed: false, reason: "User wants convergent solution. Try 'problem-solving' skill instead"}
    EXIT

# Time check
IF time_available < 5:
    RETURN {proceed: false, reason: "Ideation needs minimum 5 minutes. Use 'quick-brainstorm' skill for rapid generation"}
    EXIT

RETURN {proceed: true, reason: "Ready for divergent thinking"}
```

---

## Method: execute()

**Input:**
```yaml
validated_context: dict
```

**Output:**
```yaml
artifact:
  type: "idea_candidates"
  content: list[dict]
  metadata:
    total_ideas: int
    perspectives_covered: int
```

**Process:**
```python
# Step 1: Reframe problem from multiple perspectives
reframes = []
FOR each stakeholder IN stakeholders:
    reframe = reframe_problem(problem_statement, stakeholder.perspective)
    reframes.append(reframe)

# Step 2: Generate ideas for each reframe
ideas = []
FOR each reframe IN reframes:
    # Use SCAMPER, analogies, or other ideation techniques
    batch = generate_ideas(reframe, technique="SCAMPER")
    ideas.extend(batch)

# Step 3: Quick initial ranking (quantity over quality)
ranked_ideas = rank_by_novelty(ideas)

RETURN {
    type: "idea_candidates",
    content: ranked_ideas,
    metadata: {
        total_ideas: len(ideas),
        perspectives_covered: len(reframes)
    }
}
```

**Checkpoint:**
```python
IF len(ideas) >= 10:
    RETURN artifact
ELSE:
    # Low idea count might indicate constraint is too tight
    SUGGEST "Consider loosening constraints or extending time"
    RETURN artifact with warning
```

---

## Notes

**Best paired with:** convergent-selection, prototype-builder

**Conflicts with:** immediate-solution-finder (opposite goals)

**Token profile:** Front-loaded (reframing), distributed (idea generation)

---

*Example skill demonstrating uv-based routing*
