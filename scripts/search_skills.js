#!/usr/bin/env node
/**
 * Search skills by keyword
 * Usage: node scripts/search_skills.js <keyword>
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Load skill metadata from package.json
 */
async function loadSkillMetadata(skillDir) {
  const packagePath = path.join(skillDir, 'package.json');
  
  try {
    const content = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(content);
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
async function searchSkills(keyword) {
  const skillsDir = path.join(process.cwd(), 'skills');
  
  try {
    await fs.access(skillsDir);
  } catch (err) {
    return [];
  }
  
  const pattern = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  
  // Read all skill directories
  let entries;
  try {
    entries = await fs.readdir(skillsDir, { withFileTypes: true });
  } catch (err) {
    return [];
  }
  
  const skillPromises = entries
    .filter(entry => entry.isDirectory())
    .map(entry => loadSkillMetadata(path.join(skillsDir, entry.name)));

  const results = await Promise.all(skillPromises);

  const matches = results
    .filter(metadata => {
      if (!metadata) return false;
      const searchText = `${metadata.keywords.join(' ')} ${metadata.description}`;
      return pattern.test(searchText);
    })
    .map(metadata => metadata.name);

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
  searchSkills(keyword).then(results => {
    if (results.length > 0) {
      results.forEach(skill => console.log(skill));
    } else {
      console.error(`No skills found for: ${keyword}`);
      process.exit(1);
    }
  }).catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { searchSkills, loadSkillMetadata };
