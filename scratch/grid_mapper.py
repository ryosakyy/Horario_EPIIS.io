import fitz

doc = fitz.open('src/imports/horario_ISA.pdf')

def get_day_column(x):
    # PDF width ~792 or 842. Day columns in landscape:
    # Column 0 (Time): x < 100
    # LUNES: 100 <= x < 240
    # MARTES: 240 <= x < 380
    # MIERCOLES: 380 <= x < 520
    # JUEVES: 520 <= x < 670
    # VIERNES: 670 <= x
    if x < 100: return "HORA"
    if x < 240: return "LUNES"
    if x < 380: return "MARTES"
    if x < 520: return "MIÉRCOLES"
    if x < 670: return "JUEVES"
    return "VIERNES"

for page_idx in range(1, len(doc)):
    page = doc[page_idx]
    blocks = page.get_text("blocks")
    print(f"\n==================== PAGE {page_idx + 1} ====================")
    for b in sorted(blocks, key=lambda x: (round(x[1], -1), x[0])):
        x0, y0, x1, y1, text = b[0], b[1], b[2], b[3], b[4].replace("\n", " ").strip()
        day = get_day_column((x0 + x1) / 2)
        if text and not text.startswith("FACULTAD") and not text.startswith("UNIVERSIDAD"):
            print(f"y=[{y0:.1f}..{y1:.1f}] | {day:10s} | {text}")
