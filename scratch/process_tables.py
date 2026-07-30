import json
import re

with open("scratch/tables_extracted.json", "r", encoding="utf-8") as f:
    tables = json.load(f)

dias_validos = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"]

for t_idx, table in enumerate(tables):
    page = table["page"]
    matrix = table["matrix"]
    semestre = t_idx + 1
    print(f"\n==================== SEMESTRE {semestre} (Page {page}) ====================")
    
    # Find day columns from matrix header rows
    day_col_map = {}
    time_row_map = {}
    
    for r_idx, row in enumerate(matrix):
        # check if row has days
        for c_idx, cell in enumerate(row):
            if cell:
                cell_clean = cell.replace('\n', ' ').strip().upper()
                if "LUNES" in cell_clean: day_col_map[c_idx] = "LUNES"
                elif "MARTES" in cell_clean: day_col_map[c_idx] = "MARTES"
                elif "MIÉRCOLES" in cell_clean or "MIERCOLES" in cell_clean: day_col_map[c_idx] = "MIÉRCOLES"
                elif "JUEVES" in cell_clean: day_col_map[c_idx] = "JUEVES"
                elif "VIERNES" in cell_clean: day_col_map[c_idx] = "VIERNES"
                
                # Check if cell has time format 07:00-08:00
                m_time = re.search(r'(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})', cell_clean)
                if m_time:
                    time_row_map[r_idx] = (m_time.group(1), m_time.group(2))
    
    print(f"Days found: {day_col_map}")
    print(f"Time rows found: {time_row_map}")

    # Now inspect cells
    for r_idx, row in enumerate(matrix):
        if r_idx not in time_row_map:
            continue
        inicio, fin = time_row_map[r_idx]
        for c_idx, cell in enumerate(row):
            if c_idx in day_col_map and cell and cell.strip():
                content = cell.replace('\n', ' ').strip()
                if not any(d in content.upper() for d in dias_validos) and not "SEMESTRE" in content.upper():
                    print(f"  [{day_col_map[c_idx]} {inicio}-{fin}] -> {content}")
