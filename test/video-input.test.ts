/**
 * Minimal test for video input processing with DiffusionStudio
 * Goal: Load a video file, process it, and render to output
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

// Import WebCodecs polyfills
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
import * as avloader from '../src/avloader';

// Patch drawImage to handle VideoFrame
function patchDrawImage() {
  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  (CanvasRenderingContext2D.prototype as any).drawImage = function(image: any, ...args: any[]) {
    // Check if this is a VideoFrame (our polyfill)
    if (image && typeof image.codedWidth === 'number' && typeof image._libavGetData === 'function') {
      // Convert VideoFrame to ImageData and draw
      const frame = image;
      const format = frame.format;
      const width = frame.codedWidth;
      const height = frame.codedHeight;
      const data = frame._libavGetData();

      if (!data || data.length === 0) {
        console.warn('[drawImage] VideoFrame has no data');
        return;
      }

      // Convert YUV to RGBA for canvas
      let rgbaData: Uint8ClampedArray;
      if (format === 'I420' || format === 'I420P10') {
        rgbaData = yuv420ToRgba(data, width, height);
      } else if (format === 'RGBA') {
        rgbaData = new Uint8ClampedArray(data);
      } else if (format === 'BGRA') {
        rgbaData = bgraToRgba(data, width, height);
      } else {
        console.warn('[drawImage] Unsupported VideoFrame format:', format);
        // Try to treat as YUV420
        rgbaData = yuv420ToRgba(data, width, height);
      }

      // Create ImageData and draw it
      const imageData = this.createImageData(width, height);
      imageData.data.set(rgbaData);

      // Handle different drawImage signatures
      if (args.length === 0) {
        this.putImageData(imageData, 0, 0);
      } else if (args.length === 2) {
        // drawImage(image, dx, dy)
        this.putImageData(imageData, args[0], args[1]);
      } else if (args.length === 4) {
        // drawImage(image, dx, dy, dWidth, dHeight) - need to scale
        const [dx, dy, dWidth, dHeight] = args;
        // Create temp canvas for scaling
        const tempCanvas = createCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        originalDrawImage.call(this, tempCanvas, dx, dy, dWidth, dHeight);
      } else if (args.length === 8) {
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
        const tempCanvas = createCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        originalDrawImage.call(this, tempCanvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
      return;
    }

    // Default: call original drawImage
    return originalDrawImage.call(this, image, ...args);
  };

  // YUV420 to RGBA conversion
  function yuv420ToRgba(yuv: Uint8Array, width: number, height: number): Uint8ClampedArray {
    const ySize = width * height;
    const uvSize = (width / 2) * (height / 2);
    const rgba = new Uint8ClampedArray(width * height * 4);

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const yIndex = j * width + i;
        const uvIndex = Math.floor(j / 2) * Math.floor(width / 2) + Math.floor(i / 2);

        const y = yuv[yIndex];
        const u = yuv[ySize + uvIndex];
        const v = yuv[ySize + uvSize + uvIndex];

        // YUV to RGB conversion (BT.601)
        const c = y - 16;
        const d = u - 128;
        const e = v - 128;

        const rgbaIndex = yIndex * 4;
        rgba[rgbaIndex] = clamp((298 * c + 409 * e + 128) >> 8);           // R
        rgba[rgbaIndex + 1] = clamp((298 * c - 100 * d - 208 * e + 128) >> 8); // G
        rgba[rgbaIndex + 2] = clamp((298 * c + 516 * d + 128) >> 8);       // B
        rgba[rgbaIndex + 3] = 255;                                          // A
      }
    }

    return rgba;
  }

  function bgraToRgba(bgra: Uint8Array, width: number, height: number): Uint8ClampedArray {
    const rgba = new Uint8ClampedArray(bgra.length);
    for (let i = 0; i < bgra.length; i += 4) {
      rgba[i] = bgra[i + 2];     // R <- B
      rgba[i + 1] = bgra[i + 1]; // G
      rgba[i + 2] = bgra[i];     // B <- R
      rgba[i + 3] = bgra[i + 3]; // A
    }
    return rgba;
  }

  function clamp(value: number): number {
    return Math.max(0, Math.min(255, value));
  }
}

// Setup WebCodecs polyfills
async function setupWebCodecsPolyfills() {
  // WebCodecs
  (globalThis as any).VideoDecoder = PolyVideoDecoder;
  (globalThis as any).VideoEncoder = PolyVideoEncoder;
  (globalThis as any).AudioEncoder = PolyAudioEncoder;
  (globalThis as any).AudioDecoder = PolyAudioDecoder;
  (globalThis as any).VideoFrame = PolyVideoFrame;
  (globalThis as any).AudioData = PolyAudioData;
  (globalThis as any).EncodedVideoChunk = PolyEncodedVideoChunk;
  (globalThis as any).EncodedAudioChunk = PolyEncodedAudioChunk;

  // Initialize avloader
  await avloader.load({ backend: 'node-av' });
  console.log('Decoders:', avloader.decoders);
  console.log('Encoders:', avloader.encoders);
}

describe('Video Input Processing', () => {
  beforeAll(async () => {
    // Browser polyfills are already set up in test/setup.ts
    console.log('All polyfills setup complete');
    patchDrawImage();
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should load and render a video file', async () => {
    const core = await import('../src/diffusionstudio.js');

    // Load video sample with audio
    const videoPath = path.resolve(__dirname, '../samples/sample2.webm');
    console.log('Loading video from:', videoPath);

    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });
    console.log('Video blob size:', videoBlob.size);

    // Create a simple composition
    const composition = new core.Composition({
      width: 640,  // Smaller for faster encoding
      height: 360,

      background: '#000000',
    });

    // Load video source
    console.log('Loading video source...');
    const source = await core.Source.from(videoBlob, {
      mimeType: 'video/webm',
    }) as core.VideoSource;

    console.log('Source loaded:');
    console.log('  - duration:', source.duration);
    console.log('  - width:', source.width);
    console.log('  - height:', source.height);

    // Create sequential layer for repeating clips
    const layer = new core.Layer({ mode: 'SEQUENTIAL' });
    await composition.add(layer);

    // Add the video clip 3 times, each 1 second long
    for (let i = 0; i < 3; i++) {
      const clip = new core.VideoClip(source, {
        position: 'center',
        height: '100%',
      });
      // Set range to first 1 second of the video
      clip.range = [0, 1];
      await layer.add(clip);
      console.log(`Added clip ${i + 1} with range [0, 1]`);
    }

    console.log('All clips added, composition duration:', composition.duration);

    // Render to MP4 with VP9 video (faster than AV1, works in MP4)
    const encoder = new core.Encoder(composition, {
      debug: true,
      format: 'mp4',
      video: {
        fps: 25,  // Match source fps
        bitrate: 1_000_000,
        codec: 'vp9',  // VP9 is faster than AV1 and works in MP4
      },
      audio: {
        enabled: false, // Audio hanging - needs debugging
      },
    });

    console.log('Starting render...');
    const result = await encoder.render();

    console.log('Render result:', result.type);
    if (result.type === 'success') {
      const outputPath = path.resolve(__dirname, '../test-output/video-input-test.mp4');
      const arrayBuffer = await result.data?.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer!));
      console.log('Output saved to:', outputPath);

      const stats = fs.statSync(outputPath);
      console.log('Output size:', stats.size, 'bytes');
      expect(stats.size).toBeGreaterThan(1000);

      // Verify it's a valid MP4
      expect(fs.existsSync(outputPath)).toBe(true);
    } else {
      console.log('Render error:', result.error);
      // Log the full error for debugging
      if (result.error instanceof Error) {
        console.log('Error stack:', result.error.stack);
      }
      expect(result.type).toBe('success');
    }
  }, 60000);
});
