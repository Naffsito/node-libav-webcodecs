/**
 * Example: Test diffusionstudio playback by mounting player on fake canvas
 * 
 * Run with: pnpm tsx example-playback.ts
 */

import { init } from './src/polyfill';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await init();

  const core = await import('./src/diffusionstudio.js');

  console.log('Loading video...');

  // Load video file (video-only webm to avoid audio issues)
  const videoPath = path.resolve(__dirname, 'samples/sample2-video-only.webm');
  const videoBuffer = fs.readFileSync(videoPath);
  const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });

  const source = await core.Source.from(videoBlob, {
    mimeType: 'video/webm',
  });

  console.log('Video loaded:', source.width, 'x', source.height, '-', source.duration.toFixed(2), 's');

  // Create composition
  const composition = new core.Composition({
    width: 640,
    height: 360,
    background: '#000000',
  });

  // Add the video clip
  const videoLayer = new core.Layer();
  await composition.add(videoLayer);

  const clip = new core.VideoClip(source, {
    x: 0,
    y: 0,
    width: 640,
    height: 360,
  });
  clip.range = [0, 3];
  clip.start = 0;
  clip.duration = 3;
  await videoLayer.add(clip);
  console.log('Added video clip');

  // Add text overlay
  const textLayer = new core.Layer();
  await composition.add(textLayer);

  await textLayer.add(new core.TextClip({
    text: 'Playback Test',
    position: 'center',
    color: '#FFFFFF',
    duration: 3,
  }));

  console.log('Composition ready, duration:', composition.duration, 'seconds');

  // Create a fake div element for mounting the player
  const playerDiv = createFakeDiv();
  
  // Mount the player
  console.log('Mounting player...');
  composition.mount(playerDiv);

  // Get the canvas that was mounted
  const canvas = playerDiv._children[0];
  if (!canvas) {
    console.error('No canvas was mounted!');
    process.exit(1);
  }
  console.log('Canvas mounted:', canvas.width, 'x', canvas.height);

  // Create output directory for frames (clean up any existing frames)
  const framesDir = path.resolve(__dirname, 'frames');
  if (fs.existsSync(framesDir)) {
    for (const file of fs.readdirSync(framesDir)) {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(framesDir, file));
      }
    }
  } else {
    fs.mkdirSync(framesDir);
  }

  // Seek to start and start playback
  console.log('Starting playback...');
  await composition.seek(0);
  await composition.play();

  let frameCount = 0;
  const startTime = Date.now();
  const duration = 3000; // 3 seconds
  const interval = 20; // 20ms between frames
  let hasSeekedBack = false;

  // Save frames at regular intervals
  const saveFrames = async () => {
    while (Date.now() - startTime < duration) {
      // Wait for next frame
      await new Promise(resolve => setTimeout(resolve, interval));

      const elapsed = Date.now() - startTime;

      // After 1 second, seek back to the beginning
      if (!hasSeekedBack && elapsed >= 1000) {
        console.log(`\n--- Seeking back to 0s after 1 second (currentTime: ${composition.currentTime.toFixed(2)}s) ---\n`);
        hasSeekedBack = true;
        await composition.seek(0);
        await composition.play();
      }

      // Get the canvas and save the frame
      if (canvas && typeof canvas.toBuffer === 'function') {
        try {
          const buffer = canvas.toBuffer('image/png');
          const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(4, '0')}.png`);
          fs.writeFileSync(framePath, buffer);
          frameCount++;
          
          if (frameCount % 10 === 0) {
            console.log(`Saved frame ${frameCount}, time: ${composition.currentTime.toFixed(2)}s`);
          }
        } catch (err) {
          console.error('Error saving frame:', err);
        }
      }
    }
  };

  await saveFrames();

  // Stop playback
  await composition.pause();

  console.log(`\nPlayback complete!`);
  console.log(`Saved ${frameCount} frames to ${framesDir}`);
  console.log(`Average frame rate: ${(frameCount / (duration / 1000)).toFixed(1)} fps`);

  process.exit(0);
}

// Create a fake div element that can receive canvas children
function createFakeDiv() {
  const div: any = {
    _children: [] as any[],
    style: {},
    appendChild(child: any) {
      this._children.push(child);
      return child;
    },
    removeChild(child: any) {
      const index = this._children.indexOf(child);
      if (index !== -1) {
        this._children.splice(index, 1);
      }
      return child;
    },
    contains(child: any) {
      return this._children.includes(child);
    },
    get firstChild() {
      return this._children[0] || null;
    },
    get childNodes() {
      return this._children;
    },
    get children() {
      return this._children;
    },
  };
  return div;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
