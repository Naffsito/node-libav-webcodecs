/**
 * Vitest setup file - runs before all tests
 * Sets up browser API polyfills needed for diffusionstudio and WebCodecs
 */

import * as fs from 'fs';
import * as path from 'path';

// Clean up test-output directory before running tests
const testOutputDir = path.resolve(__dirname, '..', 'test-output');
if (fs.existsSync(testOutputDir)) {
  fs.rmSync(testOutputDir, { recursive: true });
  console.log('Cleaned test-output directory');
}
fs.mkdirSync(testOutputDir, { recursive: true });

// Load all browser API polyfills
import './polyfills';

export {};
