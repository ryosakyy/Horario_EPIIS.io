import fitz
import re
import json

doc = fitz.open('src/imports/horario_ISA.pdf')

# Let's write a parser that extracts all course blocks from each semester grid
# Page 2: Semestre I & II
# Page 3: Semestre III & IV
# Page 4: Semestre V & VI
# Page 5: Semestre VII & VIII
# Page 6: Semestre IX & X

# Let's inspect all text blocks with exact (x0, y0, x1, y1) per page
page_semestres = {
    2: ["SEMESTRE I", "SEMESTRE II"],
    3: ["SEMESTRE III", "SEMESTRE IV"],
    4: ["SEMESTRE V", "SEMESTRE VI"],
    5: ["SEMESTRE VII", "SEMESTRE VIII"],
    6: ["SEMESTRE IX", "SEMESTRE X"],
}

for page_no, sem_names in page_semestres.items():
    page = doc[page_no - 1]
    print(f"\n=======================================================")
    print(f"=== PAGE {page_no}: {sem_names[0]} & {sem_names[1]} ===")
    print(f"=======================================================")
    
    # Extract blocks
    blocks = page.get_text("blocks")
    for b in sorted(blocks, key=lambda x: x[1]):
        text = b[4].replace('\n', ' ').strip()
        if any(code in text for code in ["AGG", "AIS", "ISA", "ELECTIVO", "Tutoría"]):
            print(f"[{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}] -> {text}")
