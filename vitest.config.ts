import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 30000,
    // Run sequentially in main thread
    fileParallelism: false,
    isolate: true,
    pool: 'threads'
  },
});
