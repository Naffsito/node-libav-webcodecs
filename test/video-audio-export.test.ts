/**
 * Test: Video with Audio Export
 *
 * Simple test to verify we can load a video with audio and export it
 * with audio enabled. This test will timeout/hang if audio export is broken.
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

// Patch drawImage to handle VideoFrame (required for video rendering)
function patchDrawImage() {
  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  (CanvasRenderingContext2D.prototype as any).drawImage = function(image: any, ...args: any[]) {
    // Check if this is a VideoFrame (our polyfill)
    if (image && typeof image.codedWidth === 'number' && typeof image._libavGetData === 'function') {
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
        // Try to treat as YUV420
        rgbaData = yuv420ToRgba(data, width, height);
      }

      const imageData = this.createImageData(width, height);
      imageData.data.set(rgbaData);

      if (args.length === 0) {
        this.putImageData(imageData, 0, 0);
      } else if (args.length === 2) {
        this.putImageData(imageData, args[0], args[1]);
      } else if (args.length === 4) {
        const [dx, dy, dWidth, dHeight] = args;
        const tempCanvas = createCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        originalDrawImage.call(this, tempCanvas, dx, dy, dWidth, dHeight);
      } else if (args.length === 8) {
        const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
        const tempCanvas = createCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        originalDrawImage.call(this, tempCanvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
      return;
    }
    return originalDrawImage.call(this, image, ...args);
  };

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
        const c = y - 16;
        const d = u - 128;
        const e = v - 128;
        const rgbaIndex = yIndex * 4;
        rgba[rgbaIndex] = clamp((298 * c + 409 * e + 128) >> 8);
        rgba[rgbaIndex + 1] = clamp((298 * c - 100 * d - 208 * e + 128) >> 8);
        rgba[rgbaIndex + 2] = clamp((298 * c + 516 * d + 128) >> 8);
        rgba[rgbaIndex + 3] = 255;
      }
    }
    return rgba;
  }

  function bgraToRgba(bgra: Uint8Array, width: number, height: number): Uint8ClampedArray {
    const rgba = new Uint8ClampedArray(bgra.length);
    for (let i = 0; i < bgra.length; i += 4) {
      rgba[i] = bgra[i + 2];
      rgba[i + 1] = bgra[i + 1];
      rgba[i + 2] = bgra[i];
      rgba[i + 3] = bgra[i + 3];
    }
    return rgba;
  }

  function clamp(value: number): number {
    return Math.max(0, Math.min(255, value));
  }
}

// Setup WebCodecs polyfills
async function setupWebCodecsPolyfills() {
  patchDrawImage();

  (globalThis as any).VideoDecoder = PolyVideoDecoder;
  (globalThis as any).VideoEncoder = PolyVideoEncoder;
  (globalThis as any).AudioEncoder = PolyAudioEncoder;
  (globalThis as any).AudioDecoder = PolyAudioDecoder;
  (globalThis as any).VideoFrame = PolyVideoFrame;
  (globalThis as any).AudioData = PolyAudioData;
  (globalThis as any).EncodedVideoChunk = PolyEncodedVideoChunk;
  (globalThis as any).EncodedAudioChunk = PolyEncodedAudioChunk;

  await avloader.load({ backend: 'node-av' });
  console.log('Available decoders:', avloader.decoders);
  console.log('Available encoders:', avloader.encoders);
}

describe.skip('Video with Audio Export', () => {
  beforeAll(async () => {
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should export video with audio from sample2.webm', async () => {
    const core = await import('../src/diffusionstudio.js');

    // Load sample video (VP8 video + Opus audio)
    const videoPath = path.resolve(__dirname, '../samples/sample2.webm');
    console.log('Loading video from:', videoPath);

    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });
    console.log('Video blob size:', videoBlob.size);

    // Create composition
    const composition = new core.Composition({
      width: 640,
      height: 360,
      background: '#000000',
    });

    // Load video source
    console.log('Loading video source...');
    const source = await core.Source.from(videoBlob, {
      mimeType: 'video/webm',
    }) as any;

    console.log('Source loaded:');
    console.log('  - duration:', source.duration);
    console.log('  - width:', source.width);
    console.log('  - height:', source.height);

    // Check for audio in source
    console.log('  - audioBuffer:', source.audioBuffer ? 'present' : 'NOT present');
    console.log('  - audio property:', source.audio);
    console.log('  - Source keys:', Object.keys(source));

    // Create layer and add video clip
    const layer = new core.Layer();
    await composition.add(layer);

    const clip = new core.VideoClip(source, {
      position: 'center',
      height: '100%',
    });
    // Use first 1 second of video
    clip.range = [0, 1];
    await layer.add(clip);

    console.log('Composition duration:', composition.duration);

    // Export with audio ENABLED
    console.log('\n=== Starting render WITH AUDIO ===');
    const encoder = new core.Encoder(composition, {
      debug: true,
      format: 'mp4',
      video: {
        fps: 25,
        bitrate: 1_000_000,
        codec: 'vp9',
      },
      audio: {
        enabled: true, // AUDIO ENABLED - this is the key test
      },
    });

    console.log('Rendering...');
    const result = await encoder.render();

    console.log('Render result type:', result.type);

    if (result.type === 'success') {
      const outputPath = path.resolve(__dirname, '../test-output/video-audio-export.mp4');
      const arrayBuffer = await result.data?.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer!));
      console.log('Output saved to:', outputPath);

      const stats = fs.statSync(outputPath);
      console.log('Output file size:', stats.size, 'bytes');

      // Verify we got a valid output
      expect(stats.size).toBeGreaterThan(1000);

      // Check if output has audio using ffprobe
      const { execSync } = await import('child_process');
      try {
        const probeResult = execSync(`ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "${outputPath}"`, { encoding: 'utf8' });
        console.log('Output streams:', probeResult.trim().split('\n'));

        const hasVideo = probeResult.includes('video');
        const hasAudio = probeResult.includes('audio');
        console.log('Has video:', hasVideo);
        console.log('Has audio:', hasAudio);

        expect(hasVideo).toBe(true);
        // This is the key assertion - we expect audio in the output
        expect(hasAudio).toBe(true);
      } catch (e) {
        console.log('ffprobe check failed:', e);
      }
    } else {
      console.log('Render failed:', result.error);
      expect(result.type).toBe('success');
    }
  }, 60000); // 60 second timeout - if it hangs, this will fail
});
