#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { searchSkills } = require('./search_skills');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function extractBlock(content, blockName) {
  const lines = content.split('\n');
  let capturing = false;
  let blockLines = [];

  // Regex to match **BlockName:** or **BlockName**
  const headerRegex = new RegExp(`^\\*\\*${blockName}(?::)?\\*\\*`);

  for (const line of lines) {
    if (headerRegex.test(line.trim())) {
      capturing = true;
      continue;
    }
    if (capturing) {
      // Stop if we hit a known section header
      // This prevents stopping on **Warning:** or other bolded text.
      if (line.trim().match(/^\*\*(?:Input|Output|Process|Checkpoint)(?::)?\*\*$/)) {
        break;
      }
      blockLines.push(line);
    }
  }
  return blockLines.join('\n').trim();
}

function cleanCodeBlock(text) {
  if (!text) return '';
  // Remove opening ```type and closing ```
  return text.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
}

function parseSteps(processText) {
  const cleanText = cleanCodeBlock(processText);
  if (!cleanText) return [];

  const lines = cleanText.split('\n');
  const steps = [];
  let currentStep = [];

  for (const line of lines) {
    // Treat lines starting with # as new steps
    // Also treat lines starting with numbered lists (1.) as new steps
    if (line.trim().startsWith('# ') || line.trim().match(/^\d+\.\s/)) {
      if (currentStep.length > 0) {
        steps.push(currentStep.join('\n'));
      }
      currentStep = [line];
    } else {
      currentStep.push(line);
    }
  }
  if (currentStep.length > 0) {
    steps.push(currentStep.join('\n'));
  }

  return steps.length > 0 ? steps : [cleanText];
}

async function runSkill(skillName) {
  console.log(`\n🔍 Searching for skill: ${skillName}...`);

  const skillsDir = path.join(process.cwd(), 'skills');
  let skillPath = path.join(skillsDir, skillName, 'SKILL.md');

  // If direct path doesn't exist, try search
  if (!fs.existsSync(skillPath)) {
    const results = searchSkills(skillName);
    if (results.length === 0) {
      console.error(`❌ Skill '${skillName}' not found.`);
      process.exit(1);
    }
    // If exact match found in search results
    if (results.includes(skillName)) {
        skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    } else {
        // Did you mean?
        console.log(`❌ Skill '${skillName}' not found.`);
        console.log(`Did you mean: ${results.join(', ')}?`);
        process.exit(1);
    }
  }

  const content = fs.readFileSync(skillPath, 'utf8');
  console.log(`✅ Loaded skill: ${path.basename(path.dirname(skillPath))}\n`);

  // Parse Sections
  const constructorMatch = content.match(/## Constructor:.*?\n([\s\S]*?)(?=\n## |$)/);
  const executeMatch = content.match(/## Method: execute\(\).*?\n([\s\S]*?)(?=\n## |$)/);

  if (!constructorMatch) {
    console.error("⚠️  Could not find '## Constructor' section in SKILL.md");
    process.exit(1);
  }

  const constructorContent = constructorMatch[1];
  const executeContent = executeMatch ? executeMatch[1] : null;

  // --- Constructor Phase ---
  console.log("🟦 PHASE 1: Initialization & Diagnosis\n");

  const constInput = extractBlock(constructorContent, 'Input');
  if (constInput) {
    console.log("👉 REQUIRED INPUTS:");
    console.log(cleanCodeBlock(constInput));
    await ask("\nPress Enter when you have these inputs ready...");
  }

  const constProcess = extractBlock(constructorContent, 'Process');
  const constSteps = parseSteps(constProcess);

  if (constSteps.length > 0) {
      console.log("\n⚙️  EXECUTION LOGIC:");
      for (const step of constSteps) {
        console.log(`\n${step.trim()}`);
        await ask("Press Enter to continue...");
      }
  }

  const decision = await ask("\n❓ Based on the logic above, should we proceed? (y/n) ");
  if (decision.toLowerCase() !== 'y' && decision.toLowerCase() !== 'yes') {
    console.log("❌ Aborting execution.");
    process.exit(0);
  }

  // --- Execute Phase ---
  if (!executeContent) {
    console.log("\nNo '## Method: execute()' section found. Finished.");
    process.exit(0);
  }

  console.log("\n\n🟦 PHASE 2: Execution\n");

  const execInput = extractBlock(executeContent, 'Input');
  if (execInput) {
    console.log("👉 REQUIRED INPUTS:");
    console.log(cleanCodeBlock(execInput));
    await ask("\nPress Enter when you have these inputs ready...");
  }

  const execProcess = extractBlock(executeContent, 'Process');
  const execSteps = parseSteps(execProcess);

  if (execSteps.length > 0) {
      console.log("\n⚙️  STEPS:");
      let stepCount = 1;
      for (const step of execSteps) {
        console.log(`\n--- Step ${stepCount++} ---`);
        console.log(step.trim());
        await ask("\nPress Enter when this step is complete...");
      }
  } else {
      console.log("\nNo process steps found.");
  }

  console.log("\n✅ Skill execution complete.");
  rl.close();
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/run_skill.js <skill-name>');
  process.exit(1);
}

runSkill(args[0]);
