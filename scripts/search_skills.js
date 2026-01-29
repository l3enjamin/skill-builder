#!/usr/bin/env node
/**
 * Search skills by keyword
 * Usage: node scripts/search_skills.js <keyword>
 */

const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');

/**
 * Load skill metadata from package.json
 */
function loadSkillMetadata(skillDir) {
  const packagePath = path.join(skillDir, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return null;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return {
      name: path.basename(skillDir),
      keywords: pkg.keywords || [],
      description: pkg.description || ''
    };
  } catch (err) {
    return null;
  }
}

/**
 * Search skills by keyword with case-insensitive matching
 */
function searchSkills(keyword) {
  const skillsDir = path.join(process.cwd(), 'skills');
  
  if (!fs.existsSync(skillsDir)) {
    return [];
  }
  
  const pattern = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const matches = [];
  
  // Read all skill directories
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const skillPath = path.join(skillsDir, entry.name);
    const metadata = loadSkillMetadata(skillPath);
    
    if (!metadata) continue;
    
    // Search in keywords and description
    const searchText = `${metadata.keywords.join(' ')} ${metadata.description}`;
    
    if (pattern.test(searchText)) {
      matches.push(metadata.name);
    }
  }
  
  return matches.sort();
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node scripts/search_skills.js <keyword>');
    process.exit(1);
  }
  
  const keyword = args[0];
  const results = searchSkills(keyword);
  
  if (results.length > 0) {
    results.forEach(skill => console.log(skill));
  } else {
    console.error(`No skills found for: ${keyword}`);
    process.exit(1);
  }
}

module.exports = { searchSkills, loadSkillMetadata };
