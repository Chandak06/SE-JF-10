import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', css: true, restoreMocks: true,
    // Keep DOM suites isolated without exhausting memory on evaluation laptops.
    maxWorkers: 1,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    // Multi-field user-event flows need the same bounded budget as backend tests.
    testTimeout: 15_000,
    reporters: ['default', 'junit'], outputFile: { junit: 'reports/junit.xml' } },
})
