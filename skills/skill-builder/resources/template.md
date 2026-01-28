---
[Instructions: Structure skill as object-oriented classes with lazy-loading subclasses]
[Purpose: Minimize cognitive load - only load MainExecution first, enhance on-demand]
[Filesystem Optimization: The SKILL.md file must ONLY contain the MainExecution class. All modular subclasses (e.g. QualityOptimizer) must be placed in separate files in the 'resources/' folder.]
---

name: skill-identifier
description: |
  [One sentence: Purpose - single most important output it produces, and single most important input it won't work without.]

metadata:
  keywords:
    - [problem-type-this-solves]
    - [use-case-indicator]
    - [primary-domain-term]
    - [action-verb-describing-skill]
    - [relevant-technical-term]
  
  compatibility:
    exit_when:
      - "[Looks like it fits but absolutely won't work scenario]"
      - "[Marginal case but sorry it won't work scenario]"
      - "[Biggest chunk of cases that won't work scenario]"
    
    proceed_when:
      - "[Looks wrong but actually it does work scenario]"
      - "[Absolutely will work and you'll be much better with this scenario]"
      - "[Will work if it passes diagnosis below scenario]"
    
    constraints:
      - context_window: "equivalent to reading [famous piece of writing]"
      - tools: ["[actual-mcp-tool-name]"]
      - resources:
          - modality: "[text|image|audio|video|embeddings|binary]"
            context: "[semantic context of resource]"
      - cognitive_load: "equivalent to understanding [well-defined scientific problem]"
  
  version: "[semver]"
  skill_type: "[tool-mcp|tool-function|tool-rag|orchestration|recursive|multi-modal|linear|async]"
  architecture: "ool"

extends: [parent-skill-if-any]
implements: [tool-interface-1, tool-interface-2]

license: MIT
---

# Class: MainExecution

**Entry Point:** Always execute constructor first for eligibility diagnosis

## Constructor: __init__(context)

**Input:** 
```yaml
context:
  user_query: string
  available_tools: list
  resources: dict
```

**Output:** 
```yaml
decision:
  proceed: bool
  reason: string
  alternatives: list[string]  # if not proceeding
```

**Process:**
```python
# Fail-fast checks - eliminate 95% of wrong cases in first 3 checks
IF exit_when[0]:  # catches ~60% of ineligible
    RETURN {proceed: false, reason: "[specific reason]", alternatives: ["skill-name"]}
    EXIT

IF exit_when[1]:  # catches ~30% of remaining
    RETURN {proceed: false, reason: "[specific reason]"}
    EXIT

IF exit_when[2]:  # catches ~10% of remaining
    RETURN {proceed: false, reason: "[specific reason]"}
    EXIT

# Resource validation
IF required_resource NOT available:
    RETURN {proceed: false, reason: "Missing: [resource]", alternatives: ["acquire via skill-X"]}
    EXIT

# All checks passed
IF all proceed_when conditions met:
    ALLOCATE context_window
    ALLOCATE cognitive_load
    INSTANTIATE MainExecution
    RETURN {proceed: true, reason: "[why this is optimal path]"}

ELSE:
    RETURN {proceed: false, reason: "Ambiguous case: [explain]"}
    EXIT
```

---

## Method: execute()

**Minimum Viable Path** - core logic only, no enhancements

**Input:**
```yaml
validated_context: dict  # from constructor
```

**Output:**
```yaml
artifact:
  type: string
  content: any
  quality_score: float
  metadata: dict
```

**Process:**
```python
# Core execution - minimum steps to produce output
TRY:
    step_1_result = action_1()  # [describe concrete action]
    
    step_2_result = action_2(step_1_result)  # [describe concrete action]
    
    final_artifact = action_3(step_2_result)  # [describe concrete action]
    
    RETURN {
        type: "[artifact-type]",
        content: final_artifact,
        quality_score: self.assess_quality(final_artifact),
        metadata: {timestamp, version, trial_count: 1}
    }

CATCH error:
    IF recoverable:
        CALL ErrorHandler.recover(error)
    ELSE:
        RETURN partial_artifact with error_report
        EXIT
```

**Checkpoint:**
```python
IF quality_score >= minimum_threshold:
    RETURN artifact
ELSE IF quality_score < minimum_threshold AND trial_count < 5:
    CALL QualityOptimizer.enhance(artifact)
ELSE:
    RETURN artifact with quality_warning
```

---

[Additional subclass templates and anti-patterns would follow...]
