from pathlib import Path

import pymupdf


PDF_PATH = Path(
    "attached_assets/"
    "TuranEliteLimo_—_Luxury_Chauffeur_Service_Bay_Area_&_Northern__1788563240476.pdf"
)
OUTPUT_DIR = Path(".agents/outputs/turan-live-site")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

document = pymupdf.open(PDF_PATH)
print(f"pages={document.page_count}")

for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.25, 1.25), alpha=False)
    output_path = OUTPUT_DIR / f"page-{index + 1}.png"
    pixmap.save(output_path)
    print(output_path)