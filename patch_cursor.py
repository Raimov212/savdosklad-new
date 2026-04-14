import os
import re

directory = r'c:\go-projects\savdosklad\cmd\desktop\frontend\js'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The pattern matches the typical filter table UI redraw and setTimeout to focus.
    pattern = re.compile(r"""\s*(render[a-zA-Z]+)\(filtered\);
\s*setTimeout\(\(\) => \{
\s*const input = document\.getElementById\('([^']+)'\);
\s*if \(input\) input\.focus\(\);
\s*\}, 0\);""")

    def replacer(match):
        render_name = match.group(1)
        input_id = match.group(2)
        
        return f"""
    const _inputEl = document.getElementById('{input_id}');
    const _cursor = _inputEl ? _inputEl.selectionStart : 0;
    
    {render_name}(filtered);

    setTimeout(() => {{
        const input = document.getElementById('{input_id}');
        if (input) {{
            input.focus();
            try {{ input.setSelectionRange(_cursor, _cursor); }} catch(e) {{}}
        }}
    }}, 0);"""

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filename in os.listdir(directory):
    if filename.endswith(".js"):
        process_file(os.path.join(directory, filename))

print("Done.")
