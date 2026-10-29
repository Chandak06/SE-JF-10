import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['backend/tests/**/*.test.ts'],
    // Run load suites independently: simultaneous 50-session bcrypt/MongoDB
    // workloads measure test contention rather than the selected workload.
    maxWorkers: 1,
    testTimeout: 15_000,
    hookTimeout: 180_000,
    reporters: ['default', 'junit'],
    outputFile: { junit: 'reports/junit.xml' },
    coverage: {
      provider: 'v8',
      include: ['backend/src/**/*.ts'],
      exclude: ['backend/src/server.ts', 'backend/src/types/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { lines: 85, functions: 85, statements: 85, branches: 80 }
    }
  }
});
