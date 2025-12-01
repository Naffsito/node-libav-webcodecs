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

  // Create a 2x2 grid of videos - each clip fills its quadrant exactly
  // Composition: 1280x720, each quadrant: 640x360
  const clipWidth = 640;
  const clipHeight = 360;
  
  // Try top-left origin positioning
  const gridPositions = [
    { x: 0, y: 0 },        // top-left
    { x: 640, y: 0 },      // top-right
    { x: 0, y: 360 },      // bottom-left
    { x: 640, y: 360 },    // bottom-right
  ];

  // Different time ranges for each quadrant
  const timeRanges: [number, number][] = [
    [0, 0.5],
    [0.5, 1.0],
    [1.0, 1.5],
    [1.5, 2.0],
  ];

  for (let i = 0; i < 4; i++) {
    const videoLayer = new core.Layer();
    await composition.add(videoLayer);
    
    const clip = new core.VideoClip(source, {
      x: gridPositions[i].x,
      y: gridPositions[i].y,
      width: clipWidth,
      height: clipHeight,
    });
    clip.range = timeRanges[i];
    clip.duration = 3;
    await videoLayer.add(clip);
    console.log(`Added grid clip ${i + 1}/4 (time: ${timeRanges[i][0]}-${timeRanges[i][1]}s)`);
  }

  // Grid lines - thin lines between quadrants
  const gridLayer = new core.Layer();
  await composition.add(gridLayer);

  // Vertical line at center
  await gridLayer.add(new core.RectangleClip({
    x: 640, y: 360,
    width: 2, height: 720,
    fill: '#FFFFFF',
    alpha: 0.7,
    duration: 3,
  }));

  // Horizontal line at center
  await gridLayer.add(new core.RectangleClip({
    x: 640, y: 360,
    width: 1280, height: 2,
    fill: '#FFFFFF',
    alpha: 0.7,
    duration: 3,
  }));

  // Animated rectangles layer - positioned in corners to not cover center text
  const animLayer = new core.Layer();
  await composition.add(animLayer);

  // Spinning rectangle in top-left corner
  await animLayer.add(new core.RectangleClip({
    x: 80,
    y: 80,
    width: 60,
    height: 60,
    fill: '#e94560',
    duration: 3,
    animations: [
      {
        key: 'rotation',
        frames: [
          { time: 0, value: 0 },
          { time: 3, value: Math.PI * 4 },
        ],
      },
    ],
  }));

  // Spinning rectangle in top-right corner
  await animLayer.add(new core.RectangleClip({
    x: 1200,
    y: 80,
    width: 60,
    height: 60,
    fill: '#0f3460',
    duration: 3,
    animations: [
      {
        key: 'rotation',
        frames: [
          { time: 0, value: 0 },
          { time: 3, value: -Math.PI * 4 },
        ],
      },
    ],
  }));

  // Pulsing rectangle in bottom-left corner
  await animLayer.add(new core.RectangleClip({
    x: 80,
    y: 640,
    width: 60,
    height: 60,
    fill: '#16c79a',
    duration: 3,
    animations: [
      {
        key: 'width',
        easing: 'ease-in-out',
        frames: [
          { time: 0, value: 40 },
          { time: 1.5, value: 100 },
          { time: 3, value: 40 },
        ],
      },
      {
        key: 'height',
        easing: 'ease-in-out',
        frames: [
          { time: 0, value: 40 },
          { time: 1.5, value: 100 },
          { time: 3, value: 40 },
        ],
      },
    ],
  }));

  // Pulsing rectangle in bottom-right corner
  await animLayer.add(new core.RectangleClip({
    x: 1200,
    y: 640,
    width: 60,
    height: 60,
    fill: '#f9ed69',
    duration: 3,
    animations: [
      {
        key: 'width',
        easing: 'ease-in-out',
        frames: [
          { time: 0, value: 40 },
          { time: 1.5, value: 100 },
          { time: 3, value: 40 },
        ],
      },
      {
        key: 'height',
        easing: 'ease-in-out',
        frames: [
          { time: 0, value: 40 },
          { time: 1.5, value: 100 },
          { time: 3, value: 40 },
        ],
      },
    ],
  }));

  // Load font from Google Fonts and add text overlay
  const font = await core.loadFont({
    family: 'Roboto',
    weight: '400',
    source: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxP.ttf',
  });

  const textLayer = new core.Layer();
  await composition.add(textLayer);

  await textLayer.add(new core.TextClip({
    text: 'Rendered in Node.js with WebCodecs',
    position: 'center',
    color: '#FFFFFF',
    font,
    leading: 1.5,
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
