/**
 * Example: Create a video with DiffusionStudio in Node.js
 * 
 * Run with: npx vite-node example.ts
 */

import { init } from './src/polyfill';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  await init();
  
  const core = await import('./src/diffusionstudio.js');

  console.log('Creating composition...');

  // Create composition (1280x720)
  const composition = new core.Composition({
    width: 1280,
    height: 720,
    background: '#1a1a2e',
  });

  // Layer 1: Background rectangle
  const bgLayer = new core.Layer();
  await composition.add(bgLayer);
  await bgLayer.add(new core.RectangleClip({
    x: 640, y: 360,
    width: 1280, height: 720,
    fill: '#16213e',
    duration: 3,
  }));

  // Layer 2: Accent bars
  const shapesLayer = new core.Layer();
  await composition.add(shapesLayer);
  await shapesLayer.add(new core.RectangleClip({
    x: 100, y: 360,
    width: 20, height: 400,
    fill: '#e94560',
    duration: 3,
  }));
  await shapesLayer.add(new core.RectangleClip({
    x: 1180, y: 360,
    width: 20, height: 400,
    fill: '#0f3460',
    duration: 3,
  }));

  // Layer 3: Title
  const textLayer = new core.Layer();
  await composition.add(textLayer);
  await textLayer.add(new core.TextClip({
    text: 'Hello from Node.js!',
    x: 640, y: 300,
    color: '#FFFFFF',
    fontSize: 64,
    align: 'center',
    baseline: 'middle',
    duration: 3,
  }));

  // Layer 4: Subtitle
  const subtitleLayer = new core.Layer();
  await composition.add(subtitleLayer);
  await subtitleLayer.add(new core.TextClip({
    text: 'WebCodecs + DiffusionStudio',
    x: 640, y: 400,
    color: '#e94560',
    fontSize: 32,
    align: 'center',
    baseline: 'middle',
    duration: 3,
  }));

  console.log('Composition duration:', composition.duration, 'seconds');
  console.log('Encoding to MP4...');
  
  const encoder = new core.Encoder(composition, {
    debug: true,
    video: { fps: 30, bitrate: 2_000_000 },
    audio: { enabled: false },
  });

  const result = await encoder.render();

  if (result.type === 'success') {
    const outputPath = path.resolve(import.meta.dirname, 'output-example.mp4');
    const buffer = Buffer.from(await result.data!.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log('\nSuccess! Output:', outputPath);
    console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
    process.exit(0);
  } else if (result.type === 'error') {
    console.error('Failed:', result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
