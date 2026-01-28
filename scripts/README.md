# Scripts

## migrate_to_uv.py

Migrates existing SKILL.md frontmatters to pyproject.toml format for uv compatibility.

**Usage:**
```bash
python scripts/migrate_to_uv.py
```

**What it does:**
1. Scans `skills/` directory for SKILL.md files
2. Extracts YAML frontmatter
3. Generates pyproject.toml with:
   - Project metadata (name, version, description)
   - Dependencies from `implements` field
   - Agent Skills configuration in `[tool.agentskills]`
4. Writes pyproject.toml alongside SKILL.md

**After migration:**
```bash
# Sync the workspace
uv sync

# Verify dependencies
uv tree --depth 1

# Check for conflicts
uv tree
```
