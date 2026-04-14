
import re

file_path = r'c:\go-projects\savdosklad\frontend\src\js\admin.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all let/const declarations
declarations = re.findall(r'(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=', content)

# Check for duplicates
seen = {}
for name in declarations:
    if name in seen:
        print(f"Duplicate found: {name}")
    seen[name] = True
