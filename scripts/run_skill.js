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

async function runSkill(skillName) {
  console.log(`\n🔍 Searching for skill: ${skillName}...`);

  const skillsDir = path.join(process.cwd(), 'skills');
  let skillPath = path.join(skillsDir, skillName, 'skill.json');

  // If direct path doesn't exist, try search
  if (!fs.existsSync(skillPath)) {
    const results = searchSkills(skillName);
    if (results.length === 0) {
      console.error(`❌ Skill '${skillName}' not found.`);
      process.exit(1);
    }
    // If exact match found in search results
    if (results.includes(skillName)) {
        skillPath = path.join(skillsDir, skillName, 'skill.json');
    } else {
        // Did you mean?
        console.log(`❌ Skill '${skillName}' not found.`);
        console.log(`Did you mean: ${results.join(', ')}?`);
        process.exit(1);
    }
  }

  if (!fs.existsSync(skillPath)) {
      console.error(`❌ Skill file 'skill.json' not found for '${skillName}'. (Expected at ${skillPath})`);
      process.exit(1);
  }

  const skill = JSON.parse(fs.readFileSync(skillPath, 'utf8'));
  console.log(`✅ Loaded skill: ${skill.name || path.basename(path.dirname(skillPath))}\n`);

  // --- Constructor Phase ---
  if (skill.constructor) {
    console.log("🟦 PHASE 1: Initialization & Diagnosis\n");

    if (skill.constructor.input) {
      console.log("👉 REQUIRED INPUTS:");
      console.log(skill.constructor.input);
      await ask("\nPress Enter when you have these inputs ready...");
    }

    if (skill.constructor.process && skill.constructor.process.length > 0) {
        console.log("\n⚙️  EXECUTION LOGIC:");
        for (const step of skill.constructor.process) {
          console.log(`\n${step}`);
          await ask("Press Enter to continue...");
        }
    }

    const decision = await ask("\n❓ Based on the logic above, should we proceed? (y/n) ");
    if (decision.toLowerCase() !== 'y' && decision.toLowerCase() !== 'yes') {
      console.log("❌ Aborting execution.");
      process.exit(0);
    }
  }

  // --- Execute Phase ---
  if (skill.execute) {
      console.log("\n\n🟦 PHASE 2: Execution\n");

      if (skill.execute.input) {
        console.log("👉 REQUIRED INPUTS:");
        console.log(skill.execute.input);
        await ask("\nPress Enter when you have these inputs ready...");
      }

      if (skill.execute.process && skill.execute.process.length > 0) {
          console.log("\n⚙️  STEPS:");
          let stepCount = 1;
          for (const step of skill.execute.process) {
            console.log(`\n--- Step ${stepCount++} ---`);
            console.log(step);
            await ask("\nPress Enter when this step is complete...");
          }
      } else {
          console.log("\nNo process steps found.");
      }

      if (skill.execute.checkpoint) {
          console.log("\n🏁 CHECKPOINT:");
          console.log(skill.execute.checkpoint);
          await ask("\nPress Enter to verify checkpoint...");
      }
  } else {
      console.log("\nNo 'execute' section found. Finished.");
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
