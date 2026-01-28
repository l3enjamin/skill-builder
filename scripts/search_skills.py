#!/usr/bin/env python3
"""
Search skills by keyword
Usage: python scripts/search_skills.py <keyword>
"""

import sys
import toml
from pathlib import Path

def search_skills(keyword):
    """Search skills by keyword, return matching skill names"""
    keyword_lower = keyword.lower()
    matches = []
    
    skills_dir = Path("skills")
    if not skills_dir.exists():
        return []
    
    for skill_dir in skills_dir.iterdir():
        if not skill_dir.is_dir():
            continue
        
        pyproject = skill_dir / "pyproject.toml"
        if not pyproject.exists():
            continue
        
        try:
            config = toml.load(pyproject)
            keywords = config.get("tool", {}).get("agentskills", {}).get("keywords", [])
            description = config.get("project", {}).get("description", "")
            
            # Match in keywords or description
            if any(keyword_lower in k.lower() for k in keywords) or keyword_lower in description.lower():
                matches.append(skill_dir.name)
        except Exception:
            continue
    
    return matches

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/search_skills.py <keyword>")
        sys.exit(1)
    
    keyword = sys.argv[1]
    results = search_skills(keyword)
    
    if results:
        for skill in results:
            print(skill)
    else:
        print(f"No skills found for: {keyword}", file=sys.stderr)
        sys.exit(1)
