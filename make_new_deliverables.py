import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# Color Palette for Sugar-Safe Indian Kitchen
PRIMARY_COLOR = colors.HexColor("#FF7020")    # Warm Orange
SECONDARY_COLOR = colors.HexColor("#10B981")  # Accent Green
TEXT_COLOR = colors.HexColor("#1E293B")       # Dark Slate
BG_CARD = colors.HexColor("#FFFDF8")          # Light Cream
BORDER_COLOR = colors.HexColor("#E2E8F0")     # Soft grey

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
        self.drawString(54, 750, "THE SUGAR-SAFE INDIAN KITCHEN")
        self.setFont("Helvetica-Oblique", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(letter[0] - 54, 750, "Kitchen Transformation Kit")
        
        # Header Line
        self.setStrokeColor(PRIMARY_COLOR)
        self.setLineWidth(0.5)
        self.line(54, 742, letter[0] - 54, 742)
        
        # Running Footer
        self.setStrokeColor(BORDER_COLOR)
        self.line(54, 50, letter[0] - 54, 50)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 38, "© 2026 Secret Swap Recipe Vault. All Rights Reserved.")
        self.drawRightString(letter[0] - 54, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def parse_md_to_flowables(md_path, doc_title):
    styles = getSampleStyleSheet()
    
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
        fontSize=16,
        leading=20,
        textColor=PRIMARY_COLOR,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
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
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=6,
        spaceAfter=6
    )

    flowables = []
    
    # --- COVER PAGE ---
    flowables.append(Spacer(1, 100))
    flowables.append(Paragraph(doc_title, title_style))
    flowables.append(Paragraph("Kitchen Transformation Kit — Special Digital Edition", subtitle_style))
    
    # Visual Cover Accent
    cover_table = Table([["⚡ Designed for Fast & Painless Sugar-Safe Cooking ⚡"]], colWidths=[letter[0]-108])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFF3E0")),
        ('TEXTCOLOR', (0,0), (-1,-1), PRIMARY_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 1.5, SECONDARY_COLOR),
    ]))
    flowables.append(cover_table)
    
    flowables.append(Spacer(1, 40))
    
    intro_desc = (
        "This tool is part of your Secret Swap Recipe Vault Bundle. "
        "Use it to eliminate complexity, align your home support system, and "
        "take the friction out of daily meal preparation."
    )
    flowables.append(Paragraph(intro_desc, ParagraphStyle('IntroDesc', parent=body_style, alignment=1, fontSize=10)))
    
    flowables.append(PageBreak())
    # --- END COVER PAGE ---

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    
    in_list = False
    in_table = False
    table_data = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip top level duplicate headings
        if stripped.startswith("# ") and doc_title.lower() in stripped.lower():
            continue
            
        if stripped.startswith("# "):
            flowables.append(Paragraph(stripped[2:], h1_style))
            continue
        elif stripped.startswith("## "):
            flowables.append(Paragraph(stripped[3:], h1_style))
            continue
        elif stripped.startswith("### "):
            flowables.append(Paragraph(stripped[4:], h2_style))
            continue
            
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
            
        if stripped.startswith(">"):
            callout_text = stripped[1:].strip()
            callout_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', callout_text)
            
            box_table = Table([[Paragraph(f"💡 <b>Tip:</b> {callout_text}", callout_style)]], colWidths=[letter[0]-120])
            box_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BBF7D0")),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ]))
            flowables.append(Spacer(1, 5))
            flowables.append(box_table)
            flowables.append(Spacer(1, 5))
            continue
            
        if "|" in line:
            if not in_table:
                in_table = True
                table_data = []
            
            if "---" in line:
                continue
                
            cols = [col.strip() for col in line.split("|")[1:-1]]
            formatted_cols = []
            for col in cols:
                txt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', col)
                txt = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', txt)
                formatted_cols.append(Paragraph(txt, body_style))
                
            table_data.append(formatted_cols)
            continue
        else:
            if in_table:
                in_table = False
                if table_data:
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

        if stripped.startswith("* ") or stripped.startswith("- "):
            list_text = stripped[2:].strip()
            list_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', list_text)
            flowables.append(Paragraph(f"• {list_text}", bullet_style))
            continue
            
        if re.match(r'^\d+\.', stripped):
            list_text = re.sub(r'^\d+\.', '', stripped).strip()
            num = re.match(r'^\d+\.', stripped).group(0)
            list_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', list_text)
            flowables.append(Paragraph(f"<b>{num}</b> {list_text}", bullet_style))
            continue

        if not stripped:
            continue
            
        body_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', stripped)
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
        ("Zepto_Blinkit_One_Click_Grocery_List.md", "Zepto_Blinkit_One_Click_Grocery_List.pdf", "THE 1-CLICK ZEPTO & BLINKIT GROCERY CHEAT SHEET"),
        ("Maid_Cook_Training_Guide_Hindi.md", "Maid_Cook_Training_Guide_Hindi.pdf", "THE COOK & MAID TRAINING GUIDE (HINGLISH)"),
    ]
    
    for md, pdf, title in deliverables:
        md_path = f"/Users/rishabsayrta/Downloads/Diabetes and healthy Food/deliverables/{md}"
        pdf_path = f"/Users/rishabsayrta/Downloads/Diabetes and healthy Food/final_deliverables_pdf_excel/{pdf}"
        if os.path.exists(md_path):
            compile_pdf(md_path, pdf_path, title)
