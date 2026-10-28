"""Regenerate TEST_PLAN.pdf from TEST_PLAN.md; requires ReportLab (documentation tooling only)."""
from pathlib import Path
from xml.sax.saxutils import escape
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
r=Path(__file__).resolve().parents[2]; styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='CellSmall',fontName='Helvetica',fontSize=8,leading=11,spaceAfter=0))
styles['BodyText'].fontSize=9; styles['BodyText'].leading=13
styles['Heading1'].keepWithNext=True; styles['Heading2'].keepWithNext=True
styles['Heading1'].fontSize=18; styles['Heading1'].leading=22
styles['Heading2'].fontSize=12; styles['Heading2'].leading=16
def fmt(s):
 s=escape(s).replace('→','-&gt;').replace('–','-').replace('—','-')
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s)
 return s
lines=(r/'TEST_PLAN.md').read_text(encoding='utf-8').splitlines(); flow=[]; i=0
while i<len(lines):
 s=lines[i].strip()
 if not s: i+=1; continue
 if s.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
   if not all(re.fullmatch(r'[: -]+',c) for c in cells): rows.append(cells)
   i+=1
  n=len(rows[0]); widths=[(A4[0]-88)/n]*n
  if n==3: widths=[75,285,A4[0]-88-360]
  table=Table([[Paragraph(fmt(c),styles['CellSmall']) for c in row] for row in rows],colWidths=widths,repeatRows=1,hAlign='LEFT')
  table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7eff7')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#bec9d2')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
  flow.extend([table,Spacer(1,9)]); continue
 if s.startswith('#'):
  level=len(s)-len(s.lstrip('#')); flow.append(Paragraph(fmt(s.lstrip('# ').strip()),styles['Heading1' if level<=2 else 'Heading2']))
 else: flow.append(Paragraph(fmt(s),styles['BodyText']))
 i+=1
def page(c,doc):
 c.saveState(); c.setStrokeColor(colors.HexColor('#bec9d2')); c.line(44,40,A4[0]-44,40)
 c.setFont('Helvetica',8); c.drawString(44,28,'Team 10 | Test Plan 1.1 | 25 October 2026'); c.drawRightString(A4[0]-44,28,f'Page {doc.page}'); c.restoreState()
SimpleDocTemplate(str(r/'TEST_PLAN.pdf'),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=38,bottomMargin=52,title='Test Plan - Two-Sprint Project',author='Team 10').build(flow,onFirstPage=page,onLaterPages=page)
