import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 30000,
    // Run sequentially in main thread
    // fileParallelism: false,
    // isolate: false,
    pool: 'threads',
    // Setup file for browser polyfills (runs before all tests)
    setupFiles: ['./test/setup.ts'],
  },
});
