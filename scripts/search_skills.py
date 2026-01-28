#!/usr/bin/env python3
"""
Search skills by keyword
Usage: python scripts/search_skills.py <keyword>
"""

import sys
import os
import re
import toml
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

def load_skill_metadata(skill_dir):
    """Load skill metadata from pyproject.toml"""
    pyproject_path = os.path.join(skill_dir, "pyproject.toml")
    
    if not os.path.isfile(pyproject_path):
        return None
    
    try:
        config = toml.load(pyproject_path)
        return {
            "name": os.path.basename(skill_dir),
            "keywords": config.get("tool", {}).get("agentskills", {}).get("keywords", []),
            "description": config.get("project", {}).get("description", "")
        }
    except Exception:
        return None

def search_skills(keyword):
    """Search skills by keyword using optimized I/O and regex"""
    skills_dir = "skills"
    
    if not os.path.isdir(skills_dir):
        return []
    
    # Compile regex once for case-insensitive matching
    pattern = re.compile(re.escape(keyword), re.IGNORECASE)
    
    # Collect skill directories using scandir (faster than iterdir)
    skill_dirs = [
        entry.path 
        for entry in os.scandir(skills_dir) 
        if entry.is_dir()
    ]
    
    # Parallel load metadata from all skills
    matches = []
    with ThreadPoolExecutor(max_workers=min(8, len(skill_dirs))) as executor:
        future_to_dir = {executor.submit(load_skill_metadata, d): d for d in skill_dirs}
        
        for future in as_completed(future_to_dir):
            metadata = future.result()
            
            if metadata is None:
                continue
            
            # Search in keywords and description using compiled regex
            keywords_str = " ".join(metadata["keywords"])
            search_text = f"{keywords_str} {metadata['description']}"
            
            if pattern.search(search_text):
                matches.append(metadata["name"])
    
    return sorted(matches)  # Consistent ordering

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/search_skills.py <keyword>", file=sys.stderr)
        sys.exit(1)
    
    keyword = sys.argv[1]
    results = search_skills(keyword)
    
    if results:
        for skill in results:
            print(skill)
    else:
        print(f"No skills found for: {keyword}", file=sys.stderr)
        sys.exit(1)
