/**
 * Example: Load video, repeat 3x, trim, add text overlay
 * 
 * Run with: npx vite-node example.ts
 */

import { init } from './src/polyfill';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  await init();
  
  const core = await import('./src/diffusionstudio.js');

  console.log('Loading video...');
  
  // Load video file (video-only webm to avoid audio issues)
  const videoPath = path.resolve(import.meta.dirname, 'samples/sample2-video-only.webm');
  const videoBuffer = fs.readFileSync(videoPath);
  const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });

  const source = await core.Source.from(videoBlob, {
    mimeType: 'video/webm',
  });

  console.log('Video loaded:', source.width, 'x', source.height, '-', source.duration.toFixed(2), 's');

  // Create composition
  const composition = new core.Composition({
    width: 1280,
    height: 720,
    background: '#000000',
  });

  // Video layer - sequential mode so clips play one after another
  const videoLayer = new core.Layer({ mode: 'SEQUENTIAL' });
  await composition.add(videoLayer);

  // Add video clip 3 times, each trimmed to 1 second
  for (let i = 0; i < 3; i++) {
    const clip = new core.VideoClip(source, {
      position: 'center',
      height: '100%',
    });
    clip.range = [0, 1]; // First 1 second only
    await videoLayer.add(clip);
    console.log(`Added clip ${i + 1}/3`);
  }

  // Text overlay layer
  const textLayer = new core.Layer();
  await composition.add(textLayer);

  await textLayer.add(new core.TextClip({
    text: 'Hello from Node.js!',
    x: 640,
    y: 650,
    color: '#FFFFFF',
    fontSize: 48,
    align: 'center',
    baseline: 'middle',
    duration: 3,
  }));

  console.log('Composition duration:', composition.duration, 'seconds');
  console.log('Encoding...');

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
    console.log('\nDone:', outputPath, `(${(buffer.length / 1024).toFixed(1)} KB)`);
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
