# Scripts

## search_skills.js

Search for skills by keyword without needing to install dependencies.

**Usage:**
```bash
node scripts/search_skills.js <keyword>
```

**What it does:**
1. Scans `skills/` directory for subdirectories
2. Reads `package.json` in each skill directory
3. Matches keyword against `name`, `keywords`, and `description`
4. Returns list of matching skills

**Example:**
```bash
node scripts/search_skills.js brainstorming
# Output: design-thinking-ideation
```
