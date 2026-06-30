import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# Color Palette
PRIMARY_COLOR = colors.HexColor("#FF7020")    # Warm Orange
SECONDARY_COLOR = colors.HexColor("#4CAF50")  # Green
TEXT_COLOR = colors.HexColor("#2C3E50")       # Dark Charcoal
BG_CARD = colors.HexColor("#FFFDF8")          # Light Cream
BORDER_COLOR = colors.HexColor("#EAEAEA")     # Soft grey

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip cover page headers/footers
            return
            
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(PRIMARY_COLOR)
        # Running Header
        self.drawString(54, 750, "THE HAPPY TIFFIN SYSTEM")
        self.setFont("Helvetica-Oblique", 8)
        self.setFillColor(colors.HexColor("#7F8C8D"))
        self.drawRightString(letter[0] - 54, 750, "Partnered with KhaduFarm Orchards")
        
        # Header Line
        self.setStrokeColor(PRIMARY_COLOR)
        self.setLineWidth(0.5)
        self.line(54, 742, letter[0] - 54, 742)
        
        # Running Footer
        self.setStrokeColor(BORDER_COLOR)
        self.line(54, 50, letter[0] - 54, 50)
        self.setFont("Helvetica", 8)
        self.drawString(54, 38, "© 2026 The Happy Tiffin. All Rights Reserved. Sourced from KhaduFarm.")
        self.drawRightString(letter[0] - 54, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def parse_md_to_flowables(md_path, doc_title):
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY_COLOR,
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=SECONDARY_COLOR,
        alignment=1, # Center
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY_COLOR,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=SECONDARY_COLOR,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=TEXT_COLOR,
        spaceBefore=4,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-BoldOblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#2C3E50"),
        spaceBefore=6,
        spaceAfter=6
    )

    flowables = []
    
    # --- COVER PAGE ---
    flowables.append(Spacer(1, 100))
    flowables.append(Paragraph(doc_title, title_style))
    flowables.append(Paragraph("A 20-Year Expert Nutrition & Presentation Blueprint", subtitle_style))
    
    # Beautiful Graphic Accent on Cover
    cover_table = Table([["🌱 Purity Partner: KhaduFarm Himalayan Orchards 🌱"]], colWidths=[letter[0]-108])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFF3E0")),
        ('TEXTCOLOR', (0,0), (-1,-1), PRIMARY_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (-1,-1), 1.5, SECONDARY_COLOR),
    ]))
    flowables.append(cover_table)
    
    flowables.append(Spacer(1, 40))
    
    intro_desc = (
        "This exclusive guide contains advanced strategies re-engineered for young children's taste buds. "
        "Every swap, schedule, and checklist utilizes standard Indian kitchen ingredients and 100% natural, "
        "wax-free Himalayan fruits (apples, pears, plums, kiwis, persimmons) and nuts directly from the pristine "
        "orchards of <b>KhaduFarm</b>."
    )
    flowables.append(Paragraph(intro_desc, ParagraphStyle('IntroDesc', parent=body_style, alignment=1, fontSize=10)))
    
    flowables.append(PageBreak())
    # --- END COVER PAGE ---

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into lines
    lines = content.split('\n')
    
    in_list = False
    in_table = False
    table_data = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip header lines that duplicate document title
        if stripped.startswith("# ") and doc_title.lower() in stripped.lower():
            continue
            
        # Parse Headings
        if stripped.startswith("# "):
            flowables.append(Paragraph(stripped[2:], h1_style))
            continue
        elif stripped.startswith("## "):
            flowables.append(Paragraph(stripped[3:], h1_style))
            continue
        elif stripped.startswith("### "):
            flowables.append(Paragraph(stripped[4:], h2_style))
            continue
            
        # Parse horizontal line
        if stripped == "---":
            flowables.append(Spacer(1, 10))
            line_table = Table([[""]], colWidths=[letter[0]-108])
            line_table.setStyle(TableStyle([
                ('LINEABOVE', (0,0), (-1,-1), 1, PRIMARY_COLOR),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ]))
            flowables.append(line_table)
            flowables.append(Spacer(1, 10))
            continue
            
        # Parse Callout Box (lines starting with >)
        if stripped.startswith(">"):
            callout_text = stripped[1:].strip()
            # Clean bold markers
            callout_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', callout_text)
            
            box_table = Table([[Paragraph(f"🌱 <b>KhaduFarm Quality Tip:</b> {callout_text}", callout_style)]], colWidths=[letter[0]-120])
            box_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFDF0")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FFCC80")),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ]))
            flowables.append(Spacer(1, 5))
            flowables.append(box_table)
            flowables.append(Spacer(1, 5))
            continue
            
        # Parse Tables
        if "|" in line:
            if not in_table:
                in_table = True
                table_data = []
            
            # Skip delimiter lines like | :--- | :--- |
            if "---" in line:
                continue
                
            cols = [col.strip() for col in line.split("|")[1:-1]]
            # Format bold text in table cells
            formatted_cols = []
            for col in cols:
                txt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', col)
                # Parse links if any
                txt = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', txt)
                formatted_cols.append(Paragraph(txt, body_style))
                
            table_data.append(formatted_cols)
            continue
        else:
            if in_table:
                in_table = False
                if table_data:
                    # Render table
                    num_cols = len(table_data[0])
                    col_width = (letter[0]-108) / num_cols
                    t = Table(table_data, colWidths=[col_width]*num_cols)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
                        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                        ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                        ('TOPPADDING', (0,0), (-1,-1), 6),
                    ]))
                    flowables.append(t)
                    flowables.append(Spacer(1, 10))
                table_data = []

        # Parse Lists
        if stripped.startswith("* ") or stripped.startswith("- "):
            list_text = stripped[2:].strip()
            # Convert markdown bold to HTML bold for ReportLab Paragraph
            list_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', list_text)
            # Support list items with KhaduFarm integrations
            list_text = list_text.replace("KhaduFarm", "<font color='#FF7020'><b>KhaduFarm</b></font>")
            flowables.append(Paragraph(f"• {list_text}", bullet_style))
            continue
            
        # Parse numbered lists
        if re.match(r'^\d+\.', stripped):
            list_text = re.sub(r'^\d+\.', '', stripped).strip()
            num = re.match(r'^\d+\.', stripped).group(0)
            list_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', list_text)
            list_text = list_text.replace("KhaduFarm", "<font color='#FF7020'><b>KhaduFarm</b></font>")
            flowables.append(Paragraph(f"<b>{num}</b> {list_text}", bullet_style))
            continue

        # Skip empty lines
        if not stripped:
            continue
            
        # Normal Body Text
        body_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', stripped)
        body_text = body_text.replace("KhaduFarm", "<font color='#FF7020'><b>KhaduFarm</b></font>")
        flowables.append(Paragraph(body_text, body_style))

    return flowables

def compile_pdf(md_filename, pdf_filename, doc_title):
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )
    
    flowables = parse_md_to_flowables(md_filename, doc_title)
    doc.build(flowables, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {pdf_filename}")

if __name__ == "__main__":
    deliverables = [
        ("Happy_Tiffin_Core_System.md", "Happy_Tiffin_Core_System.pdf", "THE HAPPY TIFFIN CORE RECIPE SYSTEM"),
        ("Veggie_Stealth_Cheat_Sheet.md", "Veggie_Stealth_Cheat_Sheet.pdf", "THE SECRET VEGGIE-STEALTH CHEAT SHEET"),
        ("Five_Minute_Breakfast_Guide.md", "Five_Minute_Breakfast_Guide.pdf", "THE 5-MINUTE BREAKFAST GUIDE"),
        ("Toxic_Chemical_Audit_Checklist.md", "Toxic_Chemical_Audit_Checklist.pdf", "THE TOXIC CHEMICAL AUDIT CHECKLIST"),
        ("Family_Health_Blueprint.md", "Family_Health_Blueprint.pdf", "THE COMPLETE FAMILY HEALTH BLUEPRINT"),
        ("No_Sugar_Desi_Desserts.md", "No_Sugar_Desi_Desserts.pdf", "THE NO-SUGAR DESI DESSERTS GUIDE"),
        ("Grandparents_Wellness_Guide.md", "Grandparents_Wellness_Guide.pdf", "THE GRANDPARENTS WELLNESS GUIDE"),
        ("White_Food_Kid_Survival_Guide.md", "White_Food_Kid_Survival_Guide.pdf", "THE WHITE FOOD KID SURVIVAL GUIDE"),
        ("Breakfast_Tiffin_Rotation_Planner.md", "Breakfast_Tiffin_Rotation_Planner.pdf", "THE 7-DAY BREAKFAST AND TIFFIN ROTATION PLANNER"),
        ("Picky_Eater_Progress_Tracker.md", "Picky_Eater_Progress_Tracker.pdf", "THE PICKY EATER PROGRESS TRACKER"),
        ("Indian_Protein_Pantry_Checklist.md", "Indian_Protein_Pantry_Checklist.pdf", "THE INDIAN PROTEIN PANTRY CHECKLIST"),
    ]
    
    for md, pdf, title in deliverables:
        md_path = f"/Users/rishabsayrta/Downloads/Diabetes and healthy Food/kids/deliverables/{md}"
        pdf_path = f"/Users/rishabsayrta/Downloads/Diabetes and healthy Food/kids/deliverables/{pdf}"
        if os.path.exists(md_path):
            compile_pdf(md_path, pdf_path, title)
