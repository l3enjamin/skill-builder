#!/usr/bin/env node
/**
 * Smart Search Script
 * Uses the ADK Router Agent to find a skill semantically.
 * Falls back to keyword search if ADK fails or API key is missing.
 */

const { execFileSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/smart_search.js <query>');
  process.exit(1);
}

const query = args[0];

// Check for API Key
if (!process.env.GOOGLE_API_KEY) {
  // console.warn("⚠️ GOOGLE_API_KEY not set. Falling back to keyword search.");
  runKeywordSearch(query);
  return;
}

const routerScript = path.join(process.cwd(), 'skills/router/src/index.ts');

try {
  // Run the router script
  // We use bun to run the TS file directly.
  // Use execFileSync to avoid shell injection vulnerabilities
  const output = execFileSync('bun', [routerScript, query], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

  const skillName = output.trim();
  if (skillName && fs.existsSync(path.join(process.cwd(), 'skills', skillName))) {
    console.log(skillName);
    process.exit(0);
  } else {
    // console.warn("Semantic router didn't return a valid skill. Falling back.");
    runKeywordSearch(query);
  }

} catch (e) {
  // console.error("Router execution failed. Falling back.");
  runKeywordSearch(query);
}

function runKeywordSearch(keyword) {
  try {
    const searchScript = path.join(process.cwd(), 'scripts/search_skills.js');
    const output = execSync(`node ${searchScript} "${keyword}"`, { encoding: 'utf8' });
    console.log(output.trim());
  } catch (e) {
    console.error(`No skills found for: ${keyword}`);
    process.exit(1);
  }
}
