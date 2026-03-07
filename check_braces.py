
with open(r'c:\Users\sukru\.gemini\antigravity\scratch\NEDUBU_WEB\src\style.css', 'r', encoding='utf-8') as f:
    content = f.read()
    # Try to find where it becomes unbalanced
    stack = []
    lines = content.splitlines()
    for i, line in enumerate(lines):
        # Handle simple comments (crucial for accurate counting)
        clean_line = line.split('/*')[0] # simplistic but better than nothing
        for char in clean_line:
            if char == '{':
                stack.append(i + 1)
            elif char == '}':
                if not stack:
                    print(f"Extra closing brace at line {i + 1}")
                else:
                    stack.pop()
    if stack:
        print(f"Unclosed braces starting at lines: {stack}")
    else:
        print("Braces are balanced (according to simple scan)")
