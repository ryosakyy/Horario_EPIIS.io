import fitz
import json

doc = fitz.open('src/imports/horario_ISA.pdf')

# Let's inspect words and text blocks with their coordinates on each page
for page_num in range(1, len(doc)):
    page = doc[page_num]
    print(f"\n==================== PAGE {page_num + 1} ====================")
    blocks = page.get_text("blocks")
    # Sort blocks by y0 then x0
    blocks_sorted = sorted(blocks, key=lambda b: (round(b[1], 1), round(b[0], 1)))
    for b in blocks_sorted:
        text = b[4].replace('\n', ' ').strip()
        if text:
            print(f"[{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}] : {text}")
