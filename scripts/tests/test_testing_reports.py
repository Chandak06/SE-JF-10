"""Negative/provenance checks for report publication, using synthetic fixtures only."""
from datetime import datetime
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET


PROJECT = Path(__file__).resolve().parents[2]


class TestingReportPublication(unittest.TestCase):
    def setUp(self):
        staging = PROJECT / '.local'
        staging.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='report-fixture-', dir=staging)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'scripts').mkdir()
        shutil.copyfile(PROJECT / 'scripts/generate-testing-reports.py', self.root / 'scripts/generate-testing-reports.py')
        self.date = datetime.now().date().isoformat()
        self.out = self.root / 'docs/testing' / self.date
        self.run = self.root / '.local' / f'testing-{self.date}'
        self.run.mkdir(parents=True)
        sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=PROJECT, text=True).strip()
        commands = ['npm run check', 'npm run test:coverage --prefix frontend', 'npm run lint --prefix frontend',
                    'npm run demo:build', 'npm run demo:verify', 'npm run test:browser --prefix frontend',
                    'node scripts/check-submitted-documents.mjs']
        self.execution = {'date': self.date, 'sourceRevision': sha, 'commands': {command: 0 for command in commands}}
        self.save_execution()
        (self.run / 'browser-versions.json').write_text(json.dumps({'chrome': 'fixture-1', 'edge': 'fixture-2', 'firefox': 'fixture-3'}))
        self.junit(self.root / 'reports/junit.xml', [('backend/tests/unit/fixture.test.ts', None)])
        self.junit(self.root / 'frontend/reports/junit.xml', [('src/fixture.test.ts', None)])
        self.junit(self.root / 'frontend/reports/browser-junit.xml', [('fixture.spec.ts', channel) for channel in ['chrome', 'edge', 'firefox']])
        metrics = {name: {'covered': 1, 'total': 1, 'skipped': 0, 'pct': 100} for name in ['lines', 'statements', 'functions', 'branches']}
        for name in ['coverage', 'frontend/coverage']:
            folder = self.root / name
            folder.mkdir(parents=True)
            (folder / 'coverage-summary.json').write_text(json.dumps({'total': metrics, 'src/fixture.ts': metrics}))
            (folder / 'lcov.info').write_text('TN:\nSF:src/fixture.ts\nDA:1,1\nend_of_record\n')

    def save_execution(self):
        (self.run / 'execution.json').write_text(json.dumps(self.execution))

    def junit(self, path, entries):
        path.parent.mkdir(parents=True, exist_ok=True)
        root = ET.Element('testsuites', tests=str(len(entries)), failures='0', errors='0', skipped='0')
        for file, channel in entries:
            suite = ET.SubElement(root, 'testsuite', name=file, tests='1', failures='0', errors='0', skipped='0')
            if channel:
                suite.set('hostname', channel)
            ET.SubElement(suite, 'testcase', classname=file, name='Synthetic report fixture', time='0.01')
        ET.ElementTree(root).write(path)

    def generate(self, *arguments):
        return subprocess.run([sys.executable, str(self.root / 'scripts/generate-testing-reports.py'), '--date', self.date, *arguments],
                              cwd=self.root, capture_output=True, text=True)

    def assert_rejected_without_publication(self):
        result = self.generate()
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertFalse(self.out.exists())
        self.assertEqual(list((self.root / '.local').glob('testing-report-*')), [])

    def test_existing_snapshot_is_immutable(self):
        self.out.mkdir(parents=True)
        marker = self.out / 'sentinel.txt'
        marker.write_text('Keep historical evidence')
        self.assertNotEqual(self.generate().returncode, 0)
        self.assertEqual(marker.read_text(), 'Keep historical evidence')
        self.assertEqual(list(self.out.iterdir()), [marker])

    def test_named_run_preserves_an_existing_snapshot_on_the_same_date(self):
        self.out.mkdir(parents=True)
        marker = self.out / 'sentinel.txt'
        marker.write_text('Original run evidence')
        named_input = self.run.with_name(self.run.name + '-whole-project')
        shutil.copytree(self.run, named_input)
        result = self.generate('--run-label', 'whole-project')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(marker.read_text(), 'Original run evidence')
        self.assertTrue(self.out.with_name(self.out.name + '-whole-project').joinpath('SYSTEM_VALIDATION_REPORT.md').is_file())

    def test_revision_mismatch_does_not_publish_partial_evidence(self):
        self.execution['sourceRevision'] = '0' * 40
        self.save_execution()
        self.assert_rejected_without_publication()

    def test_missing_required_commands_are_rejected(self):
        del self.execution['commands']['npm run demo:verify']
        self.save_execution()
        self.assert_rejected_without_publication()

    def test_partial_browser_matrix_is_rejected(self):
        self.junit(self.root / 'frontend/reports/browser-junit.xml', [('fixture.spec.ts', 'edge')])
        self.assert_rejected_without_publication()

    def test_suite_error_without_failed_case_is_rejected(self):
        path = self.root / 'reports/junit.xml'
        tree = ET.parse(path)
        tree.getroot().find('testsuite').set('errors', '1')
        tree.write(path)
        self.assert_rejected_without_publication()

    def test_count_mismatch_is_rejected(self):
        path = self.root / 'reports/junit.xml'
        tree = ET.parse(path)
        tree.getroot().set('tests', '100')
        tree.write(path)
        self.assert_rejected_without_publication()

    def test_explicit_failure_report_preserves_failed_case_and_exit_code(self):
        path = self.root / 'frontend/reports/browser-junit.xml'
        tree = ET.parse(path)
        tree.getroot().set('errors', '1')
        suite = tree.getroot().find('testsuite')
        suite.set('errors', '1')
        ET.SubElement(suite.find('testcase'), 'error', message='Primary content took 3726 ms')
        tree.write(path)
        self.execution['commands']['npm run test:browser --prefix frontend'] = 1
        self.save_execution()
        self.assert_rejected_without_publication()
        result = self.generate('--include-failures')
        self.assertEqual(result.returncode, 0, result.stderr)
        report = (self.out / 'SYSTEM_VALIDATION_REPORT.md').read_text(encoding='utf-8')
        self.assertNotIn('**Automated validation passed;', report)
        self.assertNotIn('final automated run passed', report)
        self.assertIn('Local failed/skipped cases', report)
        manifest = json.loads((self.out / 'evidence/manifest.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['result'], 'FAILED_OR_INCOMPLETE')
        self.assertEqual(manifest['testCounts']['browser system']['FAIL'], 1)
        self.assertEqual(manifest['execution']['commands']['npm run test:browser --prefix frontend'], 1)
        self.assertEqual(len(list(ET.parse(self.out / 'evidence/browser-junit.xml').getroot().iter('error'))), 1)

    def test_clean_run_publishes_current_date_without_historical_timeout_claim(self):
        summary = self.root / 'frontend/coverage/coverage-summary.json'
        values = json.loads(summary.read_text())
        for item in values.values():
            item['branches'] = {'covered': 1, 'total': 3, 'skipped': 0, 'pct': 33.33}
        summary.write_text(json.dumps(values))
        result = self.generate()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = (self.out / 'SYSTEM_VALIDATION_REPORT.md').read_text(encoding='utf-8')
        self.assertNotIn('initial Edge bulk-moderation timeout', report)
        self.assertIn('3 verified cases', report)
        self.assertIn(self.date, (self.out / 'README.md').read_text(encoding='utf-8'))
        self.assertFalse((self.out / 'INITIAL_BROWSER_RUN.md').exists())
        manifest = json.loads((self.out / 'evidence/manifest.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['wholeProjectCoverage']['branches'], {'covered': 2, 'total': 4, 'pct': 50.0})
        for path, digest in manifest['evidenceSha256'].items():
            self.assertEqual(hashlib.sha256((self.out / path).read_bytes().replace(b'\r\n', b'\n')).hexdigest(), digest)


if __name__ == '__main__':
    unittest.main()
