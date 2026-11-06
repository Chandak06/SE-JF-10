"""Package verified dated evidence as the form's three PDF uploads.

Requires reportlab and pypdf. Does not run tests or change original evidence.
"""
import argparse
import csv
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import quote

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable, LongTable, PageBreak, Paragraph, SimpleDocTemplate,
    Spacer, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'docs/testing/2026-11-05-production-validation'
DEST = ROOT / 'docs/submission'
RECHECKS = ROOT / 'docs/testing/production-timing-rechecks-2026-11-05.json'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--prepared-date', required=True, type=date.fromisoformat)
args = parser.parse_args()
manifest = json.loads((PACK / 'evidence/manifest.json').read_text())
execution = manifest['execution']
revision = execution['sourceRevision']
if args.prepared_date < date.fromisoformat(execution['date']):
    raise ValueError('Preparation date cannot precede execution.')


def git(*parts):
    return subprocess.check_output(['git', *parts], cwd=ROOT).decode().strip()


integration = git('rev-parse', 'origin/main')
for path, tree in execution['sourceTrees'].items():
    if git('rev-parse', f'origin/main:{path}') != tree:
        raise ValueError(f'Tested source differs from main: {path}')
for relative, expected in manifest['evidenceSha256'].items():
    digest = hashlib.sha256((PACK / relative).read_bytes().replace(b'\r\n', b'\n')).hexdigest()
    if digest != expected:
        raise ValueError(f'Evidence integrity failure: {relative}')
with (PACK / 'AUTOMATED_TEST_CASE_CATALOGUE.csv').open(encoding='utf-8', newline='') as stream:
    cases = list(csv.DictReader(stream))
counts = Counter(row['level'] for row in cases)
expected_counts = {'backend unit': 199, 'backend integration': 131,
                   'frontend component/service/integration': 190, 'browser system': 21}
if counts != expected_counts or len(cases) != 541 or any(c['outcome'] != 'PASS' for c in cases):
    raise ValueError('Unexpected full-run case outcomes.')
suite_counts = Counter(c['source'] for c in cases if c['level'] != 'browser system')
unit_markdown = (PACK / 'UNIT_TEST_REPORT.md').read_text(encoding='utf-8')
listed_suites = {path: int(count) for path, count in re.findall(r'^\| ((?:backend|frontend)/[^|]+?) \| (\d+) \| 0 \|$', unit_markdown, re.M)}
if listed_suites != dict(suite_counts):
    raise ValueError('Unit report suite counts disagree with case evidence.')
for filename, expected in [('backend-junit.xml', 330), ('frontend-junit.xml', 190), ('browser-junit.xml', 21)]:
    records = list(ET.parse(PACK / 'evidence' / filename).getroot().iter('testcase'))
    if len(records) != expected or any(c.find(tag) is not None for c in records for tag in ['failure', 'error', 'skipped']):
        raise ValueError('JUnit outcomes disagree: ' + filename)
if manifest['result'] != 'PASS' or any(execution['commands'].values()):
    raise ValueError('Execution was not successful.')
for metric, combined in manifest['wholeProjectCoverage'].items():
    layers = [manifest['coverageTotals'][name][metric] for name in ['backend', 'frontend']]
    covered, total = sum(x['covered'] for x in layers), sum(x['total'] for x in layers)
    if combined['covered'] != covered or combined['total'] != total or combined['pct'] != round(100 * covered / total, 2):
        raise ValueError('Coverage counters disagree: ' + metric)
rechecks = json.loads(RECHECKS.read_text())
if rechecks['sourceRevision'] != revision or len(rechecks['cases']) != 9 or any(c['status'] != 'passed' for c in rechecks['cases']):
    raise ValueError('Timing rechecks disagree with the tested source.')

BLUE = colors.HexColor('#14334E')
TEAL = colors.HexColor('#087E8B')
GREY = colors.HexColor('#E8EEF3')
WIDTH = A4[0] - 36 * mm
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', fontName='Helvetica-Bold', fontSize=23, leading=27, textColor=BLUE, spaceAfter=10))
styles.add(ParagraphStyle(name='ReportSubtitle', fontName='Helvetica', fontSize=10, leading=14, textColor=TEAL, spaceAfter=12))
styles.add(ParagraphStyle(name='ReportBody', fontName='Helvetica', fontSize=9.2, leading=13.2, spaceAfter=8, splitLongWords=True))
styles.add(ParagraphStyle(name='ReportCell', parent=styles['ReportBody'], fontSize=8.1, leading=10.7, spaceAfter=0))
styles.add(ParagraphStyle(name='ReportCellHead', parent=styles['ReportCell'], fontName='Helvetica-Bold', textColor=colors.white))
styles.add(ParagraphStyle(name='ReportH2', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=BLUE, spaceBefore=12, spaceAfter=7, keepWithNext=True))
styles.add(ParagraphStyle(name='ReportH3', parent=styles['ReportH2'], fontSize=10.5, leading=14))
styles.add(ParagraphStyle(name='ReportBullet', parent=styles['ReportBody'], leftIndent=10, firstLineIndent=-7))
BASE_URL = f'https://github.com/Chandak06/SE-JF-10/blob/{integration}/'


def plain(text):
    return text.translate(str.maketrans({'\u2013': '-', '\u2014': '-', '\u2011': '-', '\u2265': '>=', '\u2264': '<=', '\u2019': "'", '\u201c': '"', '\u201d': '"', '\u2192': '->', '\u2022': '-'}))


def inline(text, origin):
    text = plain(text)
    links = []

    def link(match):
        label, target = match.groups()
        if not target.startswith(('https://', 'http://')):
            relative = (origin.parent / target).resolve().relative_to(ROOT)
            target = BASE_URL + quote(relative.as_posix(), safe='/')
        links.append(f'<link href="{escape(target, quote=True)}" color="#087E8B"><u>{escape(label)}</u></link>')
        return f'LINKTOKEN{len(links) - 1}END'

    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = escape(text)
    code = []

    def code_span(match):
        code.append('<font name="Courier" size="8">' + match.group(1) + '</font>')
        return f'CODETOKEN{len(code) - 1}END'

    text = re.sub(r'`([^`]+)`', code_span, text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    for index, code_html in enumerate(code):
        text = text.replace(f'CODETOKEN{index}END', code_html)
    for index, link_html in enumerate(links):
        text = text.replace(f'LINKTOKEN{index}END', link_html)
    return text


def para(text, origin, style='ReportBody'):
    return Paragraph(inline(text, origin), styles[style])


def table(rows, origin):
    headers = rows[0]
    count = len(headers)
    # Leave enough room for filenames while keeping numeric columns legible.
    if headers == ['Suite', 'Cases', 'Failures/skips']:
        ratios = [.72, .11, .17]
    elif 'Source' in headers:
        ratios = [.10, .44] + [.46 / (count - 2)] * (count - 2)
    elif headers == ['Evidence ID', 'Scenario / installed browser', 'Result']:
        ratios = [.19, .70, .11]
    elif count == 3 and any('evidence' in h.lower() for h in headers):
        ratios = [.22, .39, .39]
    elif headers == ['Channel', 'Page/action', 'Milliseconds', 'Limit']:
        ratios = [.16, .46, .21, .17]
    elif count == 2:
        ratios = [.34, .66]
    else:
        ratios = [1 / count] * count
    cells = [[para(cell, origin, 'ReportCellHead' if i == 0 else 'ReportCell') for cell in row] for i, row in enumerate(rows)]
    result = LongTable(cells, colWidths=[WIDTH * r for r in ratios], repeatRows=1, hAlign='LEFT')
    result.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F2F6F9')]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, 0), .6, TEAL),
        ('LINEBELOW', (0, 1), (-1, -1), .2, GREY),
    ]))
    return [result, Spacer(1, 8)]


def markdown(path, skip_title=True):
    text = path.read_text(encoding='utf-8')
    text = text.replace('This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.',
                        'The tested application source was subsequently merged into main by PR #44. This PDF packages the completed 5 November execution; no new 6 November test execution is implied.')
    lines, result, index = text.splitlines(), [], 0
    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue
        if line.startswith('|'):
            rows = []
            while index < len(lines) and lines[index].strip().startswith('|'):
                cells = [c.strip() for c in lines[index].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', c) for c in cells):
                    rows.append(cells)
                index += 1
            if any(len(r) != len(rows[0]) for r in rows):
                raise ValueError('Irregular Markdown table in ' + str(path))
            result.extend(table(rows, path))
            continue
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            if level != 1 or not skip_title:
                result.append(para(line.lstrip('#').strip(), path, 'ReportH2' if level <= 2 else 'ReportH3'))
        elif line.startswith('- '):
            result.append(para('- ' + line[2:], path, 'ReportBullet'))
        else:
            paragraph = [line]
            while index + 1 < len(lines) and lines[index + 1].strip() and not lines[index + 1].lstrip().startswith(('|', '#', '- ')):
                index += 1
                paragraph.append(lines[index].strip())
            block = para(' '.join(paragraph), path)
            if paragraph[-1].endswith(':'):
                block.keepWithNext = True
            result.append(block)
        index += 1
    return result


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GREY)
    canvas.line(18 * mm, 17 * mm, A4[0] - 18 * mm, 17 * mm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(BLUE)
    canvas.drawString(18 * mm, 12 * mm, 'Team 10 | Study Commons | Testing submission')
    canvas.drawRightString(A4[0] - 18 * mm, 12 * mm, f'Page {doc.page}')
    canvas.restoreState()


def cover(title, slot):
    origin = PACK / 'README.md'
    result = [Paragraph(title, styles['ReportTitle']),
              Paragraph(f'SE Miniproject | Form upload {slot} of 3 | Team 10', styles['ReportSubtitle']),
              HRFlowable(width='100%', thickness=2, color=TEAL), Spacer(1, 12)]
    result.extend(table([
        ['Record', 'Verified value'],
        ['Project', 'Collaborative Study Material & Quiz Platform (Study Commons)'],
        ['Prepared by', 'Harshit Chandak - PES2UG24CS185; whole Team 10 evidence'],
        ['Execution date', execution['date'] + ' (Asia/Calcutta)'],
        ['PDF preparation date', str(args.prepared_date) + '; packaging existing results, not a new test run'],
        ['Tested source', revision],
        ['Integrated main commit', integration + ' (PR #44, merged and closed)'],
        ['Preserved baseline', 'Submitted SRS, SAD and Test Plan unchanged'],
    ], origin))
    result.append(para('Scope covers Dharani (Auth/Materials/Dashboard), Prajwal (Question Bank/Quiz), Karan (Attempt/Result/History/Performance), and Harshit (Admin/Security/CI/shared integration).', origin))
    result.append(para('Evidence links in this PDF point to immutable files in the integrated repository. Dates, environment, coverage limitations and outstanding acceptance items are retained; no approval is inferred from automated passes.', origin))
    return result


DEST.mkdir(parents=True, exist_ok=True)
outputs = []


def build(filename, title, story, required):
    target = DEST / filename
    document = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
                                 topMargin=17 * mm, bottomMargin=23 * mm,
                                 title=title, author='Team 10; prepared by Harshit Chandak',
                                 subject='SE Miniproject whole-project testing, execution 5 November 2026')
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    reader = PdfReader(target)
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    if reader.is_encrypted or not reader.pages or target.stat().st_size >= 10_000_000:
        raise ValueError('Invalid or oversized PDF: ' + filename)
    for snippet in required:
        if snippet not in text:
            raise ValueError('Missing required content in ' + filename + ': ' + snippet)
    if '\u25a0' in text or '\ufffd' in text:
        raise ValueError('Unsupported glyph in ' + filename)
    outputs.append({'file': filename, 'pages': len(reader.pages), 'bytes': target.stat().st_size,
                    'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})


origin = PACK / 'README.md'
unit = cover('Unit Test Report', 1)
unit.append(para('Classification: 199 backend unit-directory/module cases are the unit-level total. The 190 frontend cases mix component, service and integration suites; they are not described as 190 pure unit cases. The 131 backend integration and 21 browser cases are shown as supporting project validation and are not added to the backend unit total.', origin))
unit.extend(markdown(PACK / 'UNIT_TEST_REPORT.md'))
unit.extend([para('Case-level evidence', origin, 'ReportH2'),
             para('The [complete 541-case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md) records each executed case ID, name, source, duration and outcome. The [updated Test Case Document](../../TEST_CASES_WHOLE_PROJECT.md) supplies procedures, expected outcomes, boundaries and module ownership. Supporting integration/system cases are explicitly classified.', origin)])
build('Unit_Test_Report.pdf', 'Unit Test Report', unit, ['199', '190', '131', '21', 'Unit Test Report', 'Evidence:'])

system = cover('System Validation Report', 2)
system.extend(markdown(PACK / 'SYSTEM_VALIDATION_REPORT.md'))
system.append(para('Post-run verification and integration', origin, 'ReportH2'))
system.append(para('The previously intermittent Student journey was repeated three times in each browser on the same tested source: 9/9 additional scenarios passed, zero failed/skipped/flaky cases. Maximum content measurements were Chrome 351 ms, Edge 321 ms and Firefox 372 ms, using the unchanged <3,000 ms limit. These are additional rechecks, not replacements for or additions to the 541 planned case count. [Per-repeat evidence](../production-timing-rechecks-2026-11-05.json).', origin))
system.append(para('Defined API workload revalidation: Quiz p90 79 ms at 10 sessions and 307 ms at 50 sessions; auth/material smoke p90 53 ms and 250 ms respectively. The earlier 23,471 ms fifty-session Quiz observation was not reproduced; it remains historical evidence, and no universal load-latency guarantee is claimed. [Dated follow-up and defect disposition](../PRODUCTION_VALIDATION_2026-11-05.md).', origin))
system.append(para('PR #44 merged into main at ' + integration + '. The exact final PR-head CI run [41990092049](https://github.com/Chandak06/SE-JF-10/actions/runs/41990092049) passed before merge; the application source also passed the linked source-specific CI run. No independent review signature, user approval or Guide sign-off is invented. [Manual acceptance register](../MANUAL_ACCEPTANCE.md).', origin))
system.append(para('Executed browser scenario inventory', origin, 'ReportH2'))
system.extend(table([['Evidence ID', 'Scenario / installed browser', 'Result']] + [[c['evidence_id'], c['case'], c['outcome']] for c in cases if c['level'] == 'browser system'], origin))
build('System_Validation_Report.pdf', 'System Validation Report', system, ['System Validation Report', '541', '9/9', 'NF-004', 'UAT', '372', 'Executed browser scenario inventory'])

coverage = cover('Code Coverage and Branch Coverage Report', 3)
coverage.append(para('One combined PDF for the third form field. Part 1 reports code coverage (lines/statements/functions and summary branches); Part 2 reports branch outcomes and per-file gaps. Both use the same 5 November V8 measurements. Weighted totals sum covered and measured counters across backend/frontend rather than averaging percentages.', origin))
coverage.append(para('Part 1 - Code Coverage Report', origin, 'ReportH2'))
coverage.extend(markdown(PACK / 'CODE_COVERAGE_REPORT.md'))
coverage.extend([PageBreak(), para('Part 2 - Branch Coverage Report', origin, 'ReportH2')])
coverage.extend(markdown(PACK / 'BRANCH_COVERAGE_REPORT.md'))
build('Code_and_Branch_Coverage_Report.pdf', 'Code Coverage and Branch Coverage Report', coverage,
      ['Part 1 - Code Coverage Report', 'Part 2 - Branch Coverage Report', '87.01', '77.03', '1425', '1850', 'backend/src/quizzes/router.ts'])

print(json.dumps({'verifiedEvidenceHashes': len(manifest['evidenceSha256']), 'verifiedCases': len(cases),
                  'testedSource': revision, 'integratedMain': integration, 'preparedDate': str(args.prepared_date),
                  'files': outputs}, indent=2))
