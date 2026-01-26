---
[Instructions of filling the template: Always fill in the skill template like a decision tree, with the decision point that can eliminate most of the Type I error first, like preparing a Mayday Checklist for a Pilot.]
---
[Purpose of metadata section: Capture the agent’s attention if they are working on something relevant, but allow the agent to exit quickly when the skill is not applicable. Lists should always be filled with descending importance.]

name: [skill-identifier]
description: |
  [One sentence: Purpose of the skill - the single most important output it produce, and the single most important input it won't work without.]

metadata:
  keywords:
  [Think of an agent coming in with a problem in their hands, what is the most helpful keyword for them to make decision of continue or exit? Keyword tokens only NO FULL SENTENCE HERE.]
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
    [Minimum viable constraints only]
      - context_window: "equivalent to reading [famous piece of writing with similar length/complexity]"
      - tools: ["[tools-that-actually-exist-in-github-mcp-or--modelcontextprotocol-io]"]
      - resources: 
        [It won't work without this. Come back when you have all of these only.]
        - modality: "[image, text, audio, video, embeddings, binary]"
          context: "[semantic context of the resource]"
      - cognitive_load: "equivalent to understanding [well-defined common scientific problem]"
  
  version: "[semver]"
  skill_type: "[tool-mcp|tool-function|tool-rag|orchestration|recursive|multi-modal|linear|async]"

license: MIT
---
[Instruction of filling the main skill procedure: Use pseudo code IF-THEN-ELSE, priortize the decision points that can eliminate most of the ineligible cases first. Provide error handling instructions with CASE WHEN THEN ELSE with any quick alternatives to this skill if available. Make it obvious on where to exit is not eligible.]

## Step 1 - Diagnosis: Checklist for Eligibility

**Output:** Decision to proceed or not and reason, any alternatives and reason

**Process:**
1. IF [Condition to eliminate ~60% of the ineligible cases] IS TRUE THEN GO TO 2 ELSE IF [Alternative condition that the first cannot be met] IS TRUE THEN GO TO [Alternative step] ELSE [Artifact to retain, failure output and EXIT]
2. [Condition to eliminate ~30% of the ineligible cases] IS TRUE THEN GO TO 2 ELSE IF [Alternative condition that the first cannot be met] IS TRUE THEN GO TO [Alternative step] ELSE [Artifact to retain, failure output and EXIT]
[...until diagnosis complete]

**Checkpoint:** [Yes/no condition - if YES then proceed to Step 2, if NO then: what is missing and the agent should check if those can be acquired by other skills/tools or from the user.]

---

[Actual execution of skill: Put everything required to execute sequentially in the same step, only branch another step when multiple alternative steps are available, steps that can executed in parallel, or steps that is recursive. Provide clear indication of the decision point of branching and parallel execution.]

## Step 2: [What this phase accomplishes]

**Output:** [What artifact or outcomes that is produced from the action should the agent retains to make decisions.]

**Process:**
1. [First concrete action]
2. [Second concrete action]
3. [Third concrete action]

**Next Step:**
IF [minimum quality check condition met]:
THEN [artifact to retain]; GO TO Step 3;
ELSE IF [alternative route conditions];
THEN [artifact to retain]; GO TO [step of alternative route];
ELSE IF [check if agent cannot remember how many times they have been here or have been here more than 3 times];
THEN [output all artifacts without any condition]; [recovery action, handoff, report failure and exit];
ELSE IF [recoverable error condition]:
THEN [artifact to retain and why it fails]; GO TO Step 2;
ELSE [artifact to retain and why it fails];
EXIT [recovery action, handoff, report failure reason and exit]

---

[Repeat all the step same as Step 2 until all branches are closed.]

---

## Final Step: Quality Check

**CRITICAL:** Before proceeding, check your memory to see if you have been here 5 times already, if you have, or there is no memory at all, immediately cache all artifacts, stop and output that the skill has failed.

**Input:** A ready-for-use version of this skill's output.

**Output:** Whether the output is good enough for the user's needs.

**Process:**
1. Check if the output is logical and not making any contradictions.
2. Check if the output is [the single most important output as in the descripton of the metadata] and [any acceptance criteria that renders the output useless if not met].
3. Check if the output is ambiguous and needs clarification.
4. Check if the output is practical to the user's circumstances.

**Next Step:** 
Memory.num-of-tries++
IF Memory.num-of-tries > 5;
THEN [output all artifacts without any condition]; [recovery action, handoff, report failure and exit];
ELSE IF [output is ready-for-use];
THEN [output artifact in required format]; [Confirm completion and Exit];
ELSE [think of why the output is not acceptable]; [go to the appropriate step to fix it];
