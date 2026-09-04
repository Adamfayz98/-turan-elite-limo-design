import fitz
from pathlib import Path

pdf_path = Path("attached_assets/Desktop_2_1788496144184.pdf")
output_dir = Path(".agents/outputs/blacklane-reference")
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(pdf_path)
print(f"pages={document.page_count}")

for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
    output_path = output_dir / f"page-{index + 1:02d}.png"
    pixmap.save(output_path)
    print(output_path)