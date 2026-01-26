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

# Subclass: QualityOptimizer [LAZY-LOAD]

**When to instantiate:** 
- Output quality_score < desired_threshold
- User explicitly requests enhancement
- Token budget allows (estimated_cost tokens available)

## Method: enhance(artifact)

**Input:**
```yaml
artifact: dict  # from MainExecution.execute()
enhancement_type: string  # optional: "accuracy"|"completeness"|"formatting"
```

**Output:**
```yaml
enhanced_artifact: dict
improvement_delta: float  # quality_score increase
```

**Process:**
```python
IF enhancement_type == "accuracy":
    apply_best_practice_1()  # [describe specific improvement]
    verify_consistency()
    
ELSE IF enhancement_type == "completeness":
    apply_best_practice_2()  # [describe specific improvement]
    fill_gaps()
    
ELSE IF enhancement_type == "formatting":
    apply_best_practice_3()  # [describe specific improvement]
    standardize_output()

ELSE:  # auto-detect needed improvements
    FOR each_best_practice IN [practice_1, practice_2, practice_3]:
        IF applicable(each_best_practice, artifact):
            apply(each_best_practice)

RETURN {
    enhanced_artifact: improved_version,
    improvement_delta: new_score - old_score
}
```

---

# Subclass: PerformanceOptimizer [LAZY-LOAD]

**When to instantiate:**
- Token budget is high (>10k available)
- Execution time matters (user requested fast)
- Multiple independent subtasks detected

## Method: parallelize(tasks)

**Input:**
```yaml
tasks: list[callable]  # independent subtasks
max_concurrent: int    # system limit
```

**Output:**
```yaml
results: list[any]
execution_time: float
```

**Process:**
```python
# Identify parallelizable tasks
independent_tasks = detect_no_dependencies(tasks)

# Execute in parallel
PARALLEL:
    result_1 = task_1()
    result_2 = task_2()
    result_3 = task_3()

# Synchronization point
SYNC all_results

# Combine results
combined = merge_results(all_results)

RETURN {
    results: combined,
    execution_time: end_time - start_time
}
```

---

# Subclass: ErrorHandler [LAZY-LOAD]

**When to instantiate:** MainExecution.execute() throws error

## Method: recover(error)

**Input:**
```yaml
error:
  type: string
  message: string
  context: dict
  recoverable: bool
```

**Output:**
```yaml
recovery_result:
  success: bool
  action_taken: string
  fallback_artifact: any  # if recovery successful
```

**Process:**
```python
CASE error.type:
    
    WHEN "tool_unavailable":
        IF alternative_tool_exists:
            CALL fallback_implementation(alternative_tool)
            RETURN {success: true, action_taken: "used [alt-tool]"}
        ELSE:
            CALL manual_workaround()
            RETURN {success: true, action_taken: "manual workaround"}
    
    WHEN "resource_missing":
        prompt_user_for(error.context.missing_resource)
        RETURN {success: false, action_taken: "awaiting user input"}
    
    WHEN "timeout":
        cache_current_state()
        WAIT [retry_delay]
        RETRY with same_parameters
        RETURN {success: true, action_taken: "retried after timeout"}
    
    WHEN "rate_limit":
        IF low_cost_alternative_exists:
            CALL alternative_approach()
        ELSE:
            WAIT [rate_limit_window]
            RETRY
        RETURN {success: true, action_taken: "switched approach"}
    
    WHEN "ambiguous_input":
        ask_clarification(error.context.ambiguity_details)
        RETURN {success: false, action_taken: "requested clarification"}
    
    DEFAULT:
        cache_all_artifacts()
        log_error_details(error)
        RETURN {
            success: false,
            action_taken: "cached state and exited",
            fallback_artifact: partial_results
        }
```

---

# Interface: ToolContract

**Required MCP implementations** - skill won't work without these

```yaml
required_tools:
  - name: "[mcp-tool-1]"
    methods: ["method_a", "method_b"]
    validation: "[how to check if available]"
    
  - name: "[mcp-tool-2]"
    methods: ["method_c"]
    validation: "[how to check if available]"
```

**Validation Process:**
```python
FOR each required_tool IN required_tools:
    IF NOT tool_available(required_tool.name):
        RAISE CompatibilityError(
            missing: required_tool.name,
            alternative_skill: "[suggest fallback skill]"
        )
        EXIT
```

---

# Composition: Dependencies

**Inheritance:**
```yaml
extends: [parent-skill-name]  # if inheriting from another skill
overides: ["method_x", "method_y"]  # methods that differ from parent
```

**Required Dependencies:**
```yaml
requires:
  - skill: "prerequisite-skill-1"
    at_step: "Step 2"  # when this dependency is needed
    reason: "[why it's needed]"
    
  - skill: "prerequisite-skill-2"
    at_step: "QualityOptimizer.enhance"
    reason: "[why it's needed]"
```

**Composable With:**
```yaml
can_compose:
  - skill: "complementary-skill-1"
    relationship: "sequential"  # this skill's output → their input
    
  - skill: "complementary-skill-2"
    relationship: "parallel"    # can run simultaneously
    
  - skill: "complementary-skill-3"
    relationship: "alternative" # either this OR that skill
```

---

# Execution Flow

**Token Budget Allocation:**
```yaml
estimated_costs:
  MainExecution.constructor: [number] tokens
  MainExecution.execute: [number] tokens
  QualityOptimizer.enhance: [number] tokens (optional)
  PerformanceOptimizer: [number] tokens (optional)
  ErrorHandler: [number] tokens (lazy-load)
  
total_minimum: [sum of required] tokens
total_maximum: [sum of all including optional] tokens
```

**Execution Order:**
```
1. ALWAYS: MainExecution.__init__()  → exit_fast if incompatible
2. IF proceed: MainExecution.execute() → produce minimum viable artifact
3. IF quality_low: QualityOptimizer.enhance() → improve artifact
4. IF error: ErrorHandler.recover() → attempt recovery
5. RETURN final_artifact
```

**Memory Management:**
```python
# For recursive skills - prevent infinite loops
trial_counter = 0
max_trials = 5

BEFORE each_iteration:
    IF trial_counter >= max_trials OR cannot_remember_count:
        cache_all_artifacts()
        RETURN partial_result with failure_report
        EXIT
    
    trial_counter += 1
```

---

# Anti-Patterns

**Premature Enhancement:**
- Don't load QualityOptimizer before MainExecution completes
- Fix: Check quality_score first, enhance only if needed

**Monolithic Execution:**
- Don't put optional enhancements in MainExecution
- Fix: Move all "nice-to-have" logic to Optimizer subclasses

**Hidden Dependencies:**
- Don't reference other skills without declaring in Composition section
- Fix: Explicitly list all required/composable skills with relationships

**Implicit State:**
- Don't rely on context that isn't passed as parameter
- Fix: All methods declare INPUT/OUTPUT explicitly

**Ignoring Trial Limits:**
- Don't recurse without checking trial_counter
- Fix: Always validate trial_count before loops/recursion

---

# Usage Examples

**Minimum viable execution (goldfish model):**
```python
skill = MainExecution(context)
IF skill.proceed:
    artifact = skill.execute()
    RETURN artifact
ELSE:
    EXIT with skill.reason
```

**Enhanced execution (smart model with tokens):**
```python
skill = MainExecution(context)
IF skill.proceed:
    base_artifact = skill.execute()
    
    IF base_artifact.quality_score < 0.8:
        optimizer = QualityOptimizer()
        enhanced = optimizer.enhance(base_artifact)
        RETURN enhanced
    ELSE:
        RETURN base_artifact
```

**Full-featured execution (high token budget):**
```python
skill = MainExecution(context)
IF skill.proceed:
    TRY:
        perf_optimizer = PerformanceOptimizer()
        tasks = perf_optimizer.parallelize(skill.subtasks)
        base_artifact = skill.execute(tasks)
        
        quality_optimizer = QualityOptimizer()
        final_artifact = quality_optimizer.enhance(base_artifact)
        
        RETURN final_artifact
        
    CATCH error:
        error_handler = ErrorHandler()
        recovery = error_handler.recover(error)
        
        IF recovery.success:
            RETURN recovery.fallback_artifact
        ELSE:
            EXIT with error_report
```