# Setup Guide

## Prerequisites

### Option 1: bun (Recommended)

**Why bun?**
- 10x faster than node
- Single binary (like uv)
- Instant startup
- Modern MCP standard

**Install:**
```bash
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version  # Should be >= 1.0.0
```

### Option 2: Node.js (Fallback)

**Install Node.js** (v16 or higher):
```bash
node --version  # Should be >= 16.0.0
```

If not installed:
```bash
# macOS/Linux
curl -fsSL https://nodejs.org/dist/latest/install.sh | sh

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/l3enjamin/skill-builder.git
cd skill-builder
```

### 2. Install skills (optional)
```bash
# With bun (faster)
bun install

# Or with npm
npm install

# Verify installation
npm ls --depth=0
```

Output:
```
@skill-builder/workspace@1.0.0
├── @skills/dependency-tree@1.0.0
├── @skills/design-thinking-ideation@1.0.0
└── @skills/skill-builder@1.0.0
```

### 3. Test skill discovery

**Search without installation (instant):**
```bash
# With bun (recommended - ~5ms)
bun scripts/search_skills.js brainstorming
# Output: design-thinking-ideation

# Or with node (~25ms)
node scripts/search_skills.js brainstorming
```

**Query if installed:**
```bash
npm query "[keywords~=brainstorming]"
```

**List all:**
```bash
npm ls --depth=0
```

---

## For Agent Integration

### Gemini CLI

```bash
# Point to root SKILL.md (router)
gemini --skill ./SKILL.md

# Agent will use bun to discover skills
```

### Claude Desktop (MCP)

```json
// Add to claude_desktop_config.json
{
  "mcpServers": {
    "skill-builder": {
      "command": "bun",
      "args": ["run", "path/to/skill-builder/mcp-server.js"]
    }
  }
}
```

### Custom Agent

```javascript
const { execSync } = require('child_process');

function findSkill(keyword) {
  try {
    // Try bun first (faster)
    const result = execSync(
      `bun scripts/search_skills.js ${keyword}`,
      { encoding: 'utf8' }
    );
    return result.trim();
  } catch (err) {
    // Fallback to node
    try {
      const result = execSync(
        `node scripts/search_skills.js ${keyword}`,
        { encoding: 'utf8' }
      );
      return result.trim();
    } catch (err2) {
      return null;
    }
  }
}

function loadSkill(skillName) {
  const fs = require('fs');
  const path = require('path');
  const skillPath = path.join('skills', skillName, 'SKILL.md');
  return fs.readFileSync(skillPath, 'utf8');
}

// Usage
const skill = findSkill('brainstorming');
if (skill) {
  const instructions = loadSkill(skill);
  // Execute instructions...
}
```

---

## Creating Your First Skill

### 1. Search for skill-builder

```bash
bun scripts/search_skills.js create-skill
# Output: skill-builder
```

### 2. Read skill-builder instructions

```bash
cat skills/skill-builder/SKILL.md
# Follow the 3-phase process: research → compile → QA
```

### 3. Create skill structure

```bash
mkdir -p skills/your-skill
cd skills/your-skill
```

### 4. Add package.json

```json
{
  "name": "@skills/your-skill",
  "version": "1.0.0",
  "description": "Brief description",
  "main": "SKILL.md",
  "keywords": [
    "keyword1",
    "keyword2"
  ],
  "agentskills": {
    "exit_when": [
      "Condition that makes skill inapplicable"
    ],
    "proceed_when": [
      "Condition that makes skill optimal"
    ],
    "skill_type": "tool-mcp"
  },
  "dependencies": {},
  "license": "MIT"
}
```

### 5. Add SKILL.md

Use template from `skills/skill-builder/resources/template.md`

### 6. Test the skill

```bash
# Search for it
bun scripts/search_skills.js your-keyword

# If using npm query, reinstall
npm install
npm query "[keywords~=your-keyword]"
```

---

## Troubleshooting

### bun not found
```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Restart shell or add to PATH
export PATH="$HOME/.bun/bin:$PATH"
```

### Node.js not found
```bash
# Install Node.js
curl -fsSL https://nodejs.org/dist/latest/install.sh | sh

# Or use nvm
nvm install 16
```

### Skill not appearing
```bash
# Check package.json syntax (with bun)
bun --print "require('./skills/your-skill/package.json')"

# Or with node
node -e "console.log(JSON.parse(require('fs').readFileSync('skills/your-skill/package.json')))"

# If using npm query, reinstall
npm install
```

### Dependency conflicts
```bash
# npm will show conflicts automatically
npm ls

# To resolve, adjust version ranges in package.json
```

---

## Performance Comparison

**Search 50 skills:**
- bun: ~5ms ⚡
- node: ~25ms
- python: ~25ms

**Installation:**
- bun install: ~2x faster than npm
- npm install: Standard

**Recommendation:** Use bun for development and agent execution, test with node for compatibility.

---

## Advanced Usage

### Using package.json scripts

```bash
# Search (uses bun by default)
npm run search brainstorming

# Search with node explicitly
npm run search:node brainstorming

# List skills
npm run list
```

### Visualizing dependencies

```bash
# Use the dependency-tree skill
bun scripts/search_skills.js dependency
# Output: dependency-tree

cat skills/dependency-tree/SKILL.md

# See full tree
npm ls
```

### Exporting skill registry

```javascript
const fs = require('fs');
const path = require('path');

const skillsDir = 'skills';
const skills = [];

for (const dir of fs.readdirSync(skillsDir)) {
  const pkgPath = path.join(skillsDir, dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    skills.push({
      name: pkg.name,
      description: pkg.description,
      keywords: pkg.keywords
    });
  }
}

console.log(JSON.stringify(skills, null, 2));
```

---

## Next Steps

- Browse existing skills in `skills/`
- Read the template in `skills/skill-builder/resources/template.md`
- Check out the [Agent Skills spec](https://agentskills.io/specification)
- Join discussions in Issues

---

*Read less, do more. Built with bun + npm workspaces.*
