import fitz
import json

doc = fitz.open('src/imports/horario_ISA.pdf')

pages_data = []

for page_idx in range(1, len(doc)):
    page = doc[page_idx]
    blocks = page.get_text("blocks")
    page_items = []
    for b in blocks:
        # (x0, y0, x1, y1, text, block_no, block_type)
        page_items.append({
            "bbox": [round(b[0], 2), round(b[1], 2), round(b[2], 2), round(b[3], 2)],
            "text": b[4].strip()
        })
    pages_data.append({
        "page": page_idx + 1,
        "items": page_items
    })

with open("scratch/pdf_raw_blocks.json", "w", encoding="utf-8") as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=2)

print("Saved scratch/pdf_raw_blocks.json")
