import fitz
import re
import json

doc = fitz.open('src/imports/horario_ISA.pdf')

# Let's write helper functions to parse sessions from the pages
print("PDF Pages:", len(doc))

# Let's inspect page 2 to 6 text structured
for page_num in range(1, len(doc)):
    page = doc[page_num]
    text = page.get_text()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print(f"=== PAGE {page_num+1} ({len(lines)} lines) ===")
    print("First 10 lines:", lines[:10])
