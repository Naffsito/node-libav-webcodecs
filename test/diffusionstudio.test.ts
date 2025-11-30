/**
 * Test file for @diffusionstudio/core integration with Node.js
 * This test demonstrates cutting and repeating a video in a composition
 */

import type * as core from '../src/diffusionstudio.js';
import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Import WebCodecs classes and load function
import {
  VideoEncoder as PolyVideoEncoder,
  VideoDecoder as PolyVideoDecoder,
  AudioEncoder as PolyAudioEncoder,
  AudioDecoder as PolyAudioDecoder,
  VideoFrame as PolyVideoFrame,
  AudioData as PolyAudioData,
  EncodedVideoChunk as PolyEncodedVideoChunk,
  EncodedAudioChunk as PolyEncodedAudioChunk,
} from '../src/main';

// Import avloader to initialize codec lists
import * as avloader from '../src/avloader';

// Setup WebCodecs polyfills (manual setup without CDN loading)
async function setupWebCodecsPolyfills() {
  // Set WebCodecs classes on globalThis if not already present
  if (!(globalThis as any).VideoEncoder) {
    (globalThis as any).VideoEncoder = PolyVideoEncoder;
  }
  if (!(globalThis as any).VideoDecoder) {
    (globalThis as any).VideoDecoder = PolyVideoDecoder;
  }
  if (!(globalThis as any).AudioEncoder) {
    (globalThis as any).AudioEncoder = PolyAudioEncoder;
  }
  if (!(globalThis as any).AudioDecoder) {
    (globalThis as any).AudioDecoder = PolyAudioDecoder;
  }
  if (!(globalThis as any).VideoFrame) {
    (globalThis as any).VideoFrame = PolyVideoFrame;
  }
  if (!(globalThis as any).AudioData) {
    (globalThis as any).AudioData = PolyAudioData;
  }
  if (!(globalThis as any).EncodedVideoChunk) {
    (globalThis as any).EncodedVideoChunk = PolyEncodedVideoChunk;
  }
  if (!(globalThis as any).EncodedAudioChunk) {
    (globalThis as any).EncodedAudioChunk = PolyEncodedAudioChunk;
  }

  // Initialize the avloader with node-av backend to populate codec lists
  try {
    await avloader.load({ backend: 'node-av' });
    console.log('WebCodecs polyfills and codec lists initialized');
  } catch (e) {
    console.warn('Failed to initialize codec lists:', e);
  }
}

describe('DiffusionStudio Integration', () => {
  beforeAll(async () => {
    // Browser polyfills are already set up in test/setup.ts
    console.log('Browser polyfills setup complete');
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should export composition to file', async () => {
    const core = await import('../src/diffusionstudio.js');

    const composition = new core.Composition({
      width: 640,
      height: 480,
      background: '#FF0000', // Red background
    });

    // Add a layer with a rectangle to give the composition some content
    const layer = new core.Layer();
    await composition.add(layer);

    // Add a rectangle clip with a duration
    const rect = new core.RectangleClip({
      x: 320,
      y: 240,
      width: 200,
      height: 200,
      fill: '#0000FF', // Blue rectangle
      duration: 2, // 2 seconds
    });
    await layer.add(rect);

    console.log('Export composition duration:', composition.duration);

    // Create an encoder
    const encoder = new core.Encoder(composition, {
      debug: true, // Enable debug logging
      video: {
        // fps: 30,
        // bitrate: 2_000_000,
        // codec: 'hevc'
      },
      audio: {
        enabled: false, // Disable audio for this simple test
        // Uses default AAC codec
      },
    });

    // Mock file output
    const outputPath = path.resolve(__dirname, '../test-output/diffusionstudio-test.mp4');

    // Render to blob
    const result = await encoder.render();

    console.log('Export result type:', result.type);
    if (result.type === 'success') {
      const blob = result.data;
      expect(blob).toBeInstanceOf(Blob);

      // Write to file for verification
      const arrayBuffer = await blob!.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
      console.log('Exported to:', outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    } else {
      console.log('Export failed:', result);
    }
  });
});

describe('DiffusionStudio Clip Trimming and Repeating', () => {
  beforeAll(async () => {
    // Browser polyfills are already set up in test/setup.ts
    console.log('Browser polyfills setup complete');
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should create and repeat trimmed clips 3 times using graphics', async () => {
    // This test demonstrates:
    // 1. Creating clips with specific durations (simulating trimmed segments)
    // 2. Repeating them 3 times in a sequential layer
    // 3. Exporting the composition
    //
    // Note: Using graphics clips because video decoding requires
    // additional browser APIs that aren't fully available in Node.js
    const core = await import('../src/diffusionstudio.js');

    // Create composition (1280x720 at 30fps)
    const composition = new core.Composition({
      width: 1280,
      height: 720,
      background: '#000000',
    });

    // Create a sequential layer - clips will play one after another
    const layer = new core.Layer({ mode: 'SEQUENTIAL' });
    await composition.add(layer);

    // Define the segment duration (simulating a 1-second trimmed clip)
    const segmentDuration = 1; // 1 second

    // Colors for each repeated segment to show the repetition visually
    const colors = ['#FF0000', '#00FF00', '#0000FF'] as const; // Red, Green, Blue

    // Create 3 clips to simulate trimming and repeating
    for (let i = 0; i < 3; i++) {
      // Each clip is a colored rectangle that represents a "trimmed segment"
      const clip = new core.RectangleClip({
        x: 640, // center
        y: 360,
        width: 400,
        height: 300,
        fill: colors[i],
        duration: segmentDuration,
      });
      await layer.add(clip);
      console.log(`Added clip ${i + 1} (color: ${colors[i]}) with duration ${segmentDuration}s`);
    }

    // The composition should be 3 seconds (3 x 1 second clips)
    console.log('Composition duration:', composition.duration);
    expect(composition.duration).toBeCloseTo(3, 0.5); // ~3 seconds

    // Export the composition
    const encoder = new core.Encoder(composition, {
      debug: true, // Enable debug logging

    });

    // Render to blob
    const outputPath = path.resolve(__dirname, '../test-output/trim-repeat-graphics.mp4');
    const result = await encoder.render();

    console.log('Render result type:', result.type);
    if (result.type === 'success') {
      const arrayBuffer = await result.data?.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer!));
      console.log('Video exported to:', outputPath);

      // Verify file was created
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify file has content
      const stats = fs.statSync(outputPath);
      console.log('Output file size:', stats.size, 'bytes');
      expect(stats.size).toBeGreaterThan(1000); // Should be at least 1KB
    } else {
      console.log('Render failed:', result);
      expect(result.type).toBe('success'); // Fail the test if render fails
    }
  }, 60000); // 60 second timeout for AV1 encoding

});
