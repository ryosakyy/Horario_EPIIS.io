import fitz
import json

doc = fitz.open('src/imports/horario_ISA.pdf')

all_tables = []

for i in range(1, len(doc)):
    page = doc[i]
    tabs = page.find_tables()
    for t_idx, t in enumerate(tabs.tables):
        matrix = t.extract()
        all_tables.append({
            "page": i + 1,
            "table_index": t_idx + 1,
            "matrix": matrix
        })

with open("scratch/tables_extracted.json", "w", encoding="utf-8") as f:
    json.dump(all_tables, f, ensure_ascii=False, indent=2)

print("Extracted", len(all_tables), "tables to scratch/tables_extracted.json")
