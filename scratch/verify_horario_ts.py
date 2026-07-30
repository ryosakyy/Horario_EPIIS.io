import re

# Read horario.ts
with open('src/app/data/horario.ts', 'r', encoding='utf-8') as f:
    content = f.read()

print("File loaded, length:", len(content))
