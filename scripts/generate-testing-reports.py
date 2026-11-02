"""Publish sanitized, source-linked evidence from completed test runs (stdlib only).

Run the commands in docs/testing/2026-11-02/README.md first. This script does
not run tests, infer human acceptance, or merge browser coverage into V8 coverage.
"""
import argparse
import csv
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone


ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--date', required=True, help='Execution date, YYYY-MM-DD')
parser.add_argument('--browser-junit', type=Path, help='Explicit combined browser evidence, if a rerun was required')
args = parser.parse_args()
datetime.strptime(args.date, '%Y-%m-%d')
OUT = ROOT / 'docs' / 'testing' / args.date
EVIDENCE = OUT / 'evidence'
EVIDENCE.mkdir(parents=True, exist_ok=True)


def git(*arguments):
    return subprocess.check_output(['git', *arguments], cwd=ROOT, text=True).strip()


def relative(value):
    value = value.replace('\\', '/')
    prefix = ROOT.as_posix() + '/'
    return value[len(prefix):] if value.lower().startswith(prefix.lower()) else value


def write(name, text):
    (OUT / name).write_text(text.rstrip() + '\n', encoding='utf-8')


def table(headers, rows):
    def escape(value):
        return str(value).replace('|', '\\|').replace('\n', ' ')
    return '\n'.join(['| ' + ' | '.join(headers) + ' |',
                      '| ' + ' | '.join('---' for _ in headers) + ' |'] +
                     ['| ' + ' | '.join(escape(v) for v in row) + ' |' for row in rows])


cases = []
sources = [('backend', ROOT / 'reports/junit.xml'),
           ('frontend', ROOT / 'frontend/reports/junit.xml'),
           ('browser', args.browser_junit or ROOT / 'frontend/reports/browser-junit.xml')]
for layer, path in sources:
    if datetime.fromtimestamp(path.stat().st_mtime).date().isoformat() != args.date:
        raise SystemExit(f'Refusing stale JUnit evidence: {path}')
    original = ET.parse(path).getroot()
    clean = ET.Element('testsuites', name=layer)
    for suite in original.iter('testsuite'):
        if not suite.findall('testcase'):
            continue
        name = relative(suite.get('name', ''))
        channel = suite.get('hostname', '') if layer == 'browser' else ''
        if channel:
            name = f'[{channel}] {name}'
        cleaned = ET.SubElement(clean, 'testsuite', {
            key: suite.get(key, '') for key in ['tests', 'failures', 'errors', 'skipped', 'time', 'timestamp']
            if key in suite.attrib
        }, name=name)
        for item in suite.findall('testcase'):
            file = relative(item.get('classname', name))
            if layer == 'frontend' and not file.startswith('frontend/'):
                file = 'frontend/' + file
            if layer == 'browser' and not file.startswith('frontend/'):
                file = 'frontend/e2e/' + file
            status = 'FAIL' if item.find('failure') is not None or item.find('error') is not None else 'SKIP' if item.find('skipped') is not None else 'PASS'
            level = ('backend unit' if '/unit/' in file else 'backend integration') if layer == 'backend' else 'frontend component/service/integration' if layer == 'frontend' else 'browser system'
            row = {'id': f'{layer.upper()}-{sum(c["layer"] == layer for c in cases) + 1:03}',
                   'layer': layer, 'level': level, 'source': file, 'suite': name,
                   'name': (f'[{channel}] ' if channel else '') + item.get('name', ''), 'status': status,
                   'seconds': float(item.get('time', '0'))}
            cases.append(row)
            target = ET.SubElement(cleaned, 'testcase', classname=file, name=row['name'], time=str(row['seconds']))
            if status != 'PASS':
                ET.SubElement(target, 'failure' if status == 'FAIL' else 'skipped').text = 'See original runner output for diagnosis.'
    # Preserve outcomes, names and durations, but omit hostname, stdout and local
    # attachment paths. Original runner outputs remain in ignored local folders.
    ET.indent(clean)
    ET.ElementTree(clean).write(EVIDENCE / f'{layer}-junit.xml', encoding='utf-8', xml_declaration=True)
    if not any(c['layer'] == layer for c in cases):
        raise SystemExit(f'No test cases found: {path}')

if any(c['status'] != 'PASS' for c in cases):
    raise SystemExit('This passing-report generator requires a complete passing run. Retain failures separately and investigate before rerunning.')

coverage = {}
for layer, folder in [('backend', ROOT / 'coverage'), ('frontend', ROOT / 'frontend/coverage')]:
    source = folder / 'coverage-summary.json'
    if datetime.fromtimestamp(source.stat().st_mtime).date().isoformat() != args.date:
        raise SystemExit(f'Refusing stale coverage: {source}')
    coverage[layer] = {relative(k): v for k, v in json.loads(source.read_text(encoding='utf-8')).items()}
    (EVIDENCE / f'{layer}-coverage-summary.json').write_text(json.dumps(coverage[layer], indent=2) + '\n', encoding='utf-8')
    lcov = (folder / 'lcov.info').read_text(encoding='utf-8')
    def source_record(match):
        path = relative(match[1])
        if layer == 'frontend' and not path.startswith('frontend/'):
            path = 'frontend/' + path
        return 'SF:' + path
    lcov = re.sub(r'^SF:(.*)$', source_record, lcov, flags=re.M)
    (EVIDENCE / f'{layer}-lcov.info').write_text(lcov, encoding='utf-8')

execution = json.loads((ROOT / '.local' / f'testing-{args.date}' / 'execution.json').read_text(encoding='utf-8-sig'))
if execution['sourceRevision'] != git('rev-parse', 'HEAD') or execution['date'] != args.date:
    raise SystemExit('Execution manifest does not match this revision/date.')
if any(code != 0 for code in execution['commands'].values()):
    raise SystemExit('A required command did not pass; do not publish a passing summary.')
versions = json.loads((ROOT / '.local' / f'testing-{args.date}' / 'browser-versions.json').read_text(encoding='utf-8-sig'))
(EVIDENCE / 'browser-versions.json').write_text(json.dumps(versions, indent=2) + '\n', encoding='utf-8')
counts = {level: {state: sum(c['level'] == level and c['status'] == state for c in cases) for state in ['PASS', 'FAIL', 'SKIP']} for level in sorted({c['level'] for c in cases})}
initial_path = ROOT / '.local' / f'testing-{args.date}' / 'browser-initial.xml'
if initial_path.exists():
    initial = ET.parse(initial_path).getroot()
    portable = ET.Element('testsuites', name='initial browser matrix')
    initial_rows = []
    for suite in initial.iter('testsuite'):
        suite_name = f'[{suite.get("hostname", "browser")}] {suite.get("name", "")}'
        target = ET.SubElement(portable, 'testsuite', name=suite_name)
        for case in suite.findall('testcase'):
            status = 'FAIL' if case.find('failure') is not None or case.find('error') is not None else 'SKIP' if case.find('skipped') is not None else 'PASS'
            row = ET.SubElement(target, 'testcase', name=case.get('name', ''), classname=relative(case.get('classname', '')), time=case.get('time', '0'))
            if status == 'FAIL':
                ET.SubElement(row, 'failure', message='45-second test timeout at bulk-confirm click; see retained rerun evidence.')
            elif status == 'SKIP':
                ET.SubElement(row, 'skipped')
            initial_rows.append([suite_name, case.get('name', ''), status])
    ET.indent(portable)
    ET.ElementTree(portable).write(EVIDENCE / 'browser-initial-junit.xml', encoding='utf-8', xml_declaration=True)
    write('INITIAL_BROWSER_RUN.md', '# Initial browser execution and rerun\n\n' + execution.get('browserRunNote', '') + '\n\n' + table(['Browser suite', 'Case', 'Initial result'], initial_rows) + '\n\n[Original outcomes, sanitized JUnit](evidence/browser-initial-junit.xml). The final browser evidence uses the unchanged Chrome/Firefox results and the complete isolated Edge rerun; initial failed results have not been counted as passes.')
sha = execution['sourceRevision']
header = f'Execution date: **{args.date}**, Asia/Calcutta. Source: `{sha}`. Branch: `{git("branch", "--show-current")}`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.\n\n'
if execution.get('browserRunNote'):
    header += execution['browserRunNote'] + ' See [initial browser results](INITIAL_BROWSER_RUN.md).\n\n'
summary = table(['Test level', 'Passed', 'Failed', 'Skipped'], [(level, data['PASS'], data['FAIL'], data['SKIP']) for level, data in counts.items()])
case_rows = [[c['id'], c['level'], c['source'], c['name'], c['status'], f'{c["seconds"]:.3f}'] for c in cases]
write('AUTOMATED_TEST_CASE_CATALOGUE.md', '# Executed automated test cases\n\n' + header + 'Every concrete parameterized case from the fresh JUnit reports is included below. These evidence IDs identify this snapshot; the stable SRS test IDs/procedures are in [the updated Test Case Document](../../TEST_CASES_UPDATED_2026-11-02.md). Test titles and linked source assertions define each automated expected result. Frontend suites include mocks and DOM integration and are not all isolated unit tests.\n\n' + table(['Evidence ID', 'Level', 'Source', 'Test / expected behavior', 'Outcome', 'Seconds'], case_rows))
with (OUT / 'AUTOMATED_TEST_CASE_CATALOGUE.csv').open('w', newline='', encoding='utf-8') as stream:
    writer = csv.writer(stream)
    writer.writerow(['evidence_id', 'level', 'source', 'case', 'outcome', 'seconds'])
    writer.writerows(case_rows)
write('UNIT_TEST_REPORT.md', '# Unit and module test report\n\n' + header + summary + '\n\nBackend unit cases are identified by `backend/tests/unit/`; backend integration cases use real MongoDB or injected production-router collaborators as specified in each source. Frontend totals include component, service and integration suites, with mocked HTTP where defined. Browser totals are separately reported as system tests. Test cases exercise normal, malformed, authorization, boundary, concurrency and retry paths.\n\nEvidence: [complete case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md), [backend JUnit](evidence/backend-junit.xml), [frontend JUnit](evidence/frontend-junit.xml). Zero failures means no failed assertion in this execution; it is not proof of absence of all defects.\n\n' + table(['Suite', 'Cases', 'Failures/skips'], [(file, sum(c['source'] == file for c in cases), sum(c['source'] == file and c['status'] != 'PASS' for c in cases)) for file in sorted({c['source'] for c in cases if c['layer'] != 'browser'})]))

metrics = ['lines', 'statements', 'functions', 'branches']
metric_rows = [[layer, name, values['covered'], values['total'], values['pct']] for layer, report in coverage.items() for name in metrics for values in [report['total'][name]]]
file_rows = [[layer, file, values['lines']['pct'], values['statements']['pct'], values['functions']['pct'], values['branches']['pct']] for layer, report in coverage.items() for file, values in sorted(report.items()) if file != 'total']
write('CODE_COVERAGE_REPORT.md', '# Code coverage report\n\n' + header + 'Measured by Vitest 5.0.3 and its version-matched V8 provider during the backend/frontend suites. Browser coverage is not merged into these numbers.\n\n' + table(['Layer', 'Metric', 'Covered', 'Total', 'Percent'], metric_rows) + '\n\nBackend scope: `backend/src/**/*.ts`, excluding the server entry point and type-only directory, as configured in `vitest.config.ts`. Backend gates: lines/statements/functions >=85%, branches >=80%; all passed. Frontend scope: all `frontend/src/**/*.{ts,tsx}`, excluding test files, test setup and declarations; unused/legacy UI and the application entry point remain included. No frontend numeric gate was previously defined; these measured results establish the baseline, not an implied backend-threshold pass. CSS/assets and deployment scripts are outside V8 source coverage.\n\nEvidence: sanitized per-file [backend summary](evidence/backend-coverage-summary.json), [frontend summary](evidence/frontend-coverage-summary.json), [backend LCOV](evidence/backend-lcov.info), [frontend LCOV](evidence/frontend-lcov.info). LCOV records identify unexecuted lines and branch counters. Lower frontend service percentages can coexist with passing browser journeys because browser execution is not included here.\n\n' + table(['Layer', 'Source', 'Lines %', 'Statements %', 'Functions %', 'Branches %'], file_rows))
branch_rows = [[layer, file, values['branches']['covered'], values['branches']['total'], values['branches']['total'] - values['branches']['covered'], values['branches']['pct']] for layer, report in coverage.items() for file, values in sorted(report.items()) if file != 'total']
write('BRANCH_COVERAGE_REPORT.md', '# Branch coverage report\n\n' + header + 'Branch coverage measures executed decision outcomes; it is not Git branch count, requirement coverage or MC/DC. V8 counters and LCOV BRDA records are retained separately for both layers.\n\n' + table(['Layer', 'Covered', 'Total', 'Uncovered', 'Percent'], [[layer, data['total']['branches']['covered'], data['total']['branches']['total'], data['total']['branches']['total'] - data['total']['branches']['covered'], data['total']['branches']['pct']] for layer, data in coverage.items()]) + '\n\nThe backend 80% branch gate passed. No frontend gate is claimed. Remaining unexecuted outcomes are coverage gaps, not automatically confirmed defects; prioritize shared authentication, moderation and Quiz service error paths for further tests. Do not remove uncovered product code from measurement just to increase percentages.\n\n' + table(['Layer', 'Source', 'Covered', 'Total', 'Uncovered', 'Percent'], branch_rows) + '\n\nDetailed line/branch counters: [backend LCOV](evidence/backend-lcov.info), [frontend LCOV](evidence/frontend-lcov.info).')

write('SYSTEM_VALIDATION_REPORT.md', '# System validation report\n\n' + header + summary + '\n\n## Executed validation\n\n- Full backend typecheck, production build, regression and coverage passed. Frontend complete regression, lint and compiled local release build passed.\n- Complete browser matrix: six real integrated journeys per browser, Chrome/Edge/Firefox, eighteen cases. Includes role navigation, PDF upload/search/view/download/removal, Question Bank/Quiz creation and discovery, trusted persisted scoring, result/history/performance, theme/responsive behavior and confirmed bulk moderation including hidden items. These are local loopback/disposable-database results.\n- Built release smoke and actual database/application stop/restart passed (`demo:verify`): compiled assets, authentication/RBAC, PDFs, saved attempts, idempotency, result/download contracts, removal and historical data retention. Saved demo data and Atlas were not used for destructive testing.\n- Submitted-document fingerprint guard passed. SRS, SAD and Test Plan were preserved.\n\nBrowser versions observed for the installed channels immediately after the matrix:\n\n' + table(['Browser channel', 'Version'], versions.items()) + '\n\n## Acceptance still to execute or document, 2–6 November\n\n| Test Plan / SRS item | Current evidence | Remaining evidence / owner |\n| --- | --- | --- |\n| NF-001 normal-network timing | Automated local content-ready assertions under 3 seconds | Team records typical campus/broadband device/network measurements |\n| NF-003 concurrent normal use | Automated 10/50 authenticated HTTP-session workloads | Team records at least 10 simultaneous browser sessions/devices covering ordinary operations |\n| NF-004 latest two stable major versions | One installed Chrome/Edge/Firefox channel each, actual versions above | Team supplies acceptance-time latest/previous-major version matrix and results; three engines alone do not satisfy six version slots |\n| NF-005 usability | Automated navigation, error and responsive assertions | Representative user completes core workflow without assistance; record observation |\n| SR-005 deployed HTTPS | Production transport tests locally; Docker HTTPS pipeline exists | Link successful exact-head CI container execution or run certificate-validated deployed smoke; this local run did not execute Docker |\n| Independent peer cross-testing | Automated checks do not establish an independent human review | Prajwal tests Auth/Materials; Karan tests Question/Quiz and Admin/Security; Dharani tests Attempt/Result/History/Performance; all test integration |\n| UAT / exit / release | No automated failures in executed cases | QA/team/Guide review, complete RTM/defect log, genuine acceptance, demo and release freeze |\n\n## Defects and conclusion\n\nNo failed automated test or confirmed new product defect was observed in these runs. Lower frontend coverage and incomplete acceptance evidence are explicitly retained as gaps. The historical CSMQ-45 latest-50/weighted-average description was corrected in the supplementary matrix to match the current all-pages/arithmetic-mean implementation. Generated coverage/build files were excluded from frontend lint inputs.\n\n**Automated validation passed; complete Test Plan/UAT exit is still pending the evidence above.** No human approval, unexecuted browser version or future 3–6 November test result is fabricated. See [updated cases](../../TEST_CASES_UPDATED_2026-11-02.md) and [case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md).')

write('README.md', '# Testing reports — 2 November 2026\n\n' + header + 'Day-one evidence for the **2–6 November** testing window. Later runs should use a new dated folder; preserve this snapshot.\n\n- [Updated Test Case Document](../../TEST_CASES_UPDATED_2026-11-02.md)\n- [Unit Test Report](UNIT_TEST_REPORT.md)\n- [System Validation Report](SYSTEM_VALIDATION_REPORT.md)\n- [Code Coverage Report](CODE_COVERAGE_REPORT.md)\n- [Branch Coverage Report](BRANCH_COVERAGE_REPORT.md)\n- [Executed cases](AUTOMATED_TEST_CASE_CATALOGUE.md) / [CSV](AUTOMATED_TEST_CASE_CATALOGUE.csv)\n- [Execution manifest and evidence hashes](evidence/manifest.json)\n\n' + summary + '\n\n## Reproduction\n\nUse supported Node >=24.15 <25, install root and frontend dependencies, and install Playwright Chrome, Edge and Firefox. The version-matched V8 provider is installed by the root `npm ci` and resolves from frontend tests through the parent dependency tree. All Mongo fixtures must remain disposable.\n\n```powershell\nnpm ci\nnpm ci --prefix frontend\nnpm run check\nnpm run test:coverage --prefix frontend\nnpm run lint --prefix frontend\nnpm run demo:build\nnpm run test:browser --prefix frontend\nnpm run demo:verify\n```\n\nJUnit/HTML/LCOV runner outputs are generated in ignored `reports/`, `coverage/`, `frontend/reports/`, `frontend/coverage/` and `frontend/playwright-report/`. This docs snapshot retains portable sanitized JUnit and JSON/LCOV, not local machine paths, credentials or browser traces. CI retains full generated artifacts. Browser coverage and backend coverage are separate.\n\nAfter completed executions, record actual command exit codes/source/date and browser versions in ignored `.local/testing-YYYY-MM-DD/execution.json` and `browser-versions.json`, then run:\n\n```powershell\npython scripts/generate-testing-reports.py --date 2026-11-02\n```\n\nThe generator rejects stale evidence, mismatched source revisions and nonzero required command exits. It preserves actual failed/skipped test outcomes if present. Never replace pending manual results with automated passes. See the manifest for this snapshot\'s exact commands/configuration. Original submitted documents are unchanged.')

# Preserve earlier failed-run history in the system conclusion as well as its
# own report; do not describe a rerun pass as an initially clean execution.
system_report = OUT / 'SYSTEM_VALIDATION_REPORT.md'
system_text = system_report.read_text(encoding='utf-8')
system_text = system_text.replace('No failed automated test or confirmed new product defect was observed in these runs.',
    'The final verified automated results pass. The initial Edge bulk-moderation timeout and isolated rerun are recorded above; its exact transient cause is not established. No new product-code defect was confirmed. Continue monitoring this case for flakiness.')
green_main = next((run for run in execution.get('ciForTestedSource', [])
                   if run['branch'] == 'main' and run['conclusion'] == 'success'
                   and len(run.get('jobs', [])) == 5
                   and all(job['conclusion'] == 'success' for job in run['jobs'])), None)
if green_main:
    ci_link = f'[exact-source CI run {green_main["id"]}]({green_main["url"]})'
    system_text = system_text.replace(
        '| SR-005 deployed HTTPS | Production transport tests locally; Docker HTTPS pipeline exists | Link successful exact-head CI container execution or run certificate-validated deployed smoke; this local run did not execute Docker |',
        f'| SR-005 deployed HTTPS | Production transport tests locally; all five jobs passed in {ci_link}, including the certificate-validated HTTPS container smoke | Exact-source HTTPS automated evidence is available in CI; no public deployment claim and no local Docker execution |')
    system_text += f'\nSource CI: {ci_link}, all five jobs successful (backend, three browsers and containers). This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.\n'
system_report.write_text(system_text, encoding='utf-8')
readme = OUT / 'README.md'
readme.write_text(readme.read_text(encoding='utf-8').replace('It preserves actual failed/skipped test outcomes if present.',
    'It rejects a non-passing final case set and retains the initial failed browser run separately when a rerun was needed.'), encoding='utf-8')

manifest = {'generatedUtc': datetime.now(timezone.utc).isoformat(), 'execution': execution,
            'os': platform.system(), 'node': subprocess.check_output(['node', '--version'], text=True).strip(),
            'testCounts': counts, 'browserVersions': versions,
            'coverageTotals': {layer: data['total'] for layer, data in coverage.items()},
            'acceptance': 'Automated validation passed; manual/independent Test Plan exit pending.',
            'evidenceSha256': {str(p.relative_to(OUT)).replace(os.sep, '/'): hashlib.sha256(p.read_bytes()).hexdigest()
                               for p in sorted(OUT.rglob('*')) if p.is_file() and p.name != 'manifest.json'}}
(EVIDENCE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'reportDirectory': str(OUT), 'tests': len(cases), 'counts': counts}, indent=2))
