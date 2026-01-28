#!/usr/bin/env python3
"""
Migrate existing SKILL.md frontmatters to pyproject.toml format

Usage:
    python scripts/migrate_to_uv.py
"""

import yaml
import toml
from pathlib import Path
import sys

def extract_frontmatter(skill_md_path):
    """Extract YAML frontmatter from SKILL.md"""
    with open(skill_md_path) as f:
        content = f.read()
    
    if not content.startswith("---"):
        return None
    
    end = content.find("---", 3)
    if end == -1:
        return None
    
    try:
        return yaml.safe_load(content[3:end])
    except yaml.YAMLError as e:
        print(f"Error parsing {skill_md_path}: {e}")
        return None

def create_pyproject_toml(frontmatter, skill_name):
    """Generate pyproject.toml content from frontmatter"""
    
    metadata = frontmatter.get('metadata', {})
    
    pyproject = {
        'project': {
            'name': frontmatter.get('name', skill_name),
            'version': metadata.get('version', '1.0.0'),
            'description': frontmatter.get('description', '').strip(),
            'requires-python': '>=3.10',
            'dependencies': frontmatter.get('implements', [])
        },
        'tool': {
            'agentskills': {
                'keywords': metadata.get('keywords', []),
                'exit_when': metadata.get('compatibility', {}).get('exit_when', []),
                'proceed_when': metadata.get('compatibility', {}).get('proceed_when', []),
                'skill_type': metadata.get('skill_type', 'unknown')
            }
        }
    }
    
    return pyproject

def migrate_skill(skill_dir):
    """Migrate a single skill directory"""
    skill_md = skill_dir / "SKILL.md"
    
    if not skill_md.exists():
        print(f"Skipping {skill_dir.name}: No SKILL.md found")
        return False
    
    # Check if already migrated
    pyproject_path = skill_dir / "pyproject.toml"
    if pyproject_path.exists():
        print(f"Skipping {skill_dir.name}: Already has pyproject.toml")
        return False
    
    # Extract frontmatter
    frontmatter = extract_frontmatter(skill_md)
    if not frontmatter:
        print(f"Skipping {skill_dir.name}: Could not parse frontmatter")
        return False
    
    # Generate pyproject.toml
    pyproject = create_pyproject_toml(frontmatter, skill_dir.name)
    
    # Write to file
    with open(pyproject_path, 'w') as f:
        toml.dump(pyproject, f)
    
    print(f"✓ Migrated {skill_dir.name}")
    return True

def main():
    skills_dir = Path("skills")
    
    if not skills_dir.exists():
        print("Error: skills/ directory not found")
        print("Make sure you're running this from the repository root")
        sys.exit(1)
    
    print("🔍 Discovering skills...")
    skill_dirs = [d for d in skills_dir.iterdir() if d.is_dir()]
    print(f"   Found {len(skill_dirs)} skill directories\n")
    
    print("📝 Migrating to uv format...\n")
    
    migrated = 0
    for skill_dir in skill_dirs:
        if migrate_skill(skill_dir):
            migrated += 1
    
    print(f"\n✅ Migration complete!")
    print(f"   Migrated: {migrated}")
    print(f"   Skipped: {len(skill_dirs) - migrated}")
    
    if migrated > 0:
        print("\n📦 Next steps:")
        print("   1. Review generated pyproject.toml files")
        print("   2. Run: uv sync")
        print("   3. Test: uv tree --depth 1")

if __name__ == "__main__":
    main()
