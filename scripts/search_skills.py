#!/usr/bin/env python3
"""
Search and inspect skills
Usage:
  python scripts/search_skills.py <keyword>
  python scripts/search_skills.py --skill <skill_name> [--section <index|name>]
"""

import sys
import os
import re
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Use tomllib for Python 3.11+
if sys.version_info >= (3, 11):
    import tomllib
else:
    import toml as tomllib

def load_skill_metadata(skill_dir):
    """Load skill metadata from pyproject.toml"""
    pyproject_path = os.path.join(skill_dir, "pyproject.toml")
    
    if not os.path.isfile(pyproject_path):
        return None
    
    try:
        if sys.version_info >= (3, 11):
            with open(pyproject_path, "rb") as f:
                config = tomllib.load(f)
        else:
            config = tomllib.load(pyproject_path)

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

def parse_skill_file(skill_name):
    """Read and parse SKILL.md for a given skill"""
    skill_path = os.path.join("skills", skill_name, "SKILL.md")
    if not os.path.exists(skill_path):
        return None

    with open(skill_path, 'r') as f:
        content = f.read()

    sections = []

    # Extract frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if frontmatter_match:
        sections.append({
            "title": "Metadata",
            "content": frontmatter_match.group(1).strip()
        })
        content = content[frontmatter_match.end():]

    # Split by level 2 headers (## Title)
    # We use a lookahead or just split and reconstruct
    parts = re.split(r'\n## ', content)

    # First part is Preamble/Title (often H1)
    if parts[0].strip():
        sections.append({
            "title": "Overview",
            "content": parts[0].strip()
        })

    for part in parts[1:]:
        lines = part.split('\n', 1)
        title = lines[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""
        sections.append({
            "title": title,
            "content": body
        })

    return sections

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Search and inspect agent skills")
    parser.add_argument("keyword", nargs='?', help="Keyword to search for")
    parser.add_argument("--skill", help="Name of the skill to inspect")
    parser.add_argument("--section", help="Section index (1-based) or name to retrieve")
    parser.add_argument("--list-sections", action="store_true", help="List available sections")
    
    args = parser.parse_args()
    
    if args.skill:
        sections = parse_skill_file(args.skill)
        if not sections:
            print(f"Skill '{args.skill}' not found or has no SKILL.md", file=sys.stderr)
            sys.exit(1)

        if args.section:
            # Try to interpret as index
            try:
                idx = int(args.section) - 1
                if 0 <= idx < len(sections):
                    print(f"## {sections[idx]['title']}\n")
                    print(sections[idx]['content'])
                    sys.exit(0)
            except ValueError:
                pass

            # Try to interpret as title match
            found = False
            for sec in sections:
                if args.section.lower() in sec['title'].lower():
                    print(f"## {sec['title']}\n")
                    print(sec['content'])
                    found = True
                    break

            if not found:
                print(f"Section '{args.section}' not found.", file=sys.stderr)
                sys.exit(1)
        else:
            # List sections
            print(f"Skill: {args.skill}")
            print(f"Sections:")
            for i, sec in enumerate(sections):
                print(f"{i+1}. {sec['title']}")

            print("\nUse --section <number> to view content.")

    elif args.keyword:
        results = search_skills(args.keyword)
        if results:
            for skill in results:
                print(skill)
        else:
            print(f"No skills found for: {args.keyword}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)
