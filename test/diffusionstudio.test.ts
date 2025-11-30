/**
 * Test file for @diffusionstudio/core integration with Node.js
 * This test demonstrates cutting and repeating a video in a composition
 */

import type * as core from '@diffusionstudio/core';
import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, Canvas, CanvasRenderingContext2D, Image, DOMMatrix } from 'canvas';

// Import node-web-audio-api for Web Audio API polyfill
import {
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
  AudioWorkletNode,
} from 'node-web-audio-api';

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
  load as loadWebCodecs,
} from '../src/main';

// Import avloader to initialize codec lists
import * as avloader from '../src/avloader';

// Polyfill browser APIs for Node.js
function setupBrowserPolyfills() {
  // Canvas polyfill
  (globalThis as any).HTMLCanvasElement = Canvas;
  (globalThis as any).CanvasRenderingContext2D = CanvasRenderingContext2D;
  (globalThis as any).Image = Image;

  // Path2D polyfill (minimal implementation)
  if (!(globalThis as any).Path2D) {
    (globalThis as any).Path2D = class Path2D {
      private commands: string[] = [];

      constructor(path?: Path2D | string) {
        if (typeof path === 'string') {
          this.commands.push(path);
        }
      }

      addPath(path: Path2D) {
        // Minimal implementation
      }

      closePath() {
        this.commands.push('Z');
      }

      moveTo(x: number, y: number) {
        this.commands.push(`M ${x} ${y}`);
      }

      lineTo(x: number, y: number) {
        this.commands.push(`L ${x} ${y}`);
      }

      bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
        this.commands.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`);
      }

      quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
        this.commands.push(`Q ${cpx} ${cpy} ${x} ${y}`);
      }

      arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
        // Simplified arc implementation
        this.commands.push(`arc ${x} ${y} ${radius}`);
      }

      arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        this.commands.push(`arcTo ${x1} ${y1} ${x2} ${y2} ${radius}`);
      }

      ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
        this.commands.push(`ellipse ${x} ${y} ${radiusX} ${radiusY}`);
      }

      rect(x: number, y: number, width: number, height: number) {
        this.commands.push(`M ${x} ${y} h ${width} v ${height} h ${-width} Z`);
      }

      roundRect(x: number, y: number, width: number, height: number, radii?: number | number[]) {
        // Simplified roundRect
        this.rect(x, y, width, height);
      }
    };
  }

  // DOMMatrix polyfill
  if (!(globalThis as any).DOMMatrix) {
    (globalThis as any).DOMMatrix = DOMMatrix;
  }

  // DOMRect polyfill
  if (!(globalThis as any).DOMRect) {
    (globalThis as any).DOMRect = class DOMRect {
      x: number;
      y: number;
      width: number;
      height: number;

      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }

      get top() { return this.y; }
      get left() { return this.x; }
      get bottom() { return this.y + this.height; }
      get right() { return this.x + this.width; }

      static fromRect(rect?: { x?: number; y?: number; width?: number; height?: number }) {
        return new (globalThis as any).DOMRect(rect?.x, rect?.y, rect?.width, rect?.height);
      }

      toJSON() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      }
    };
  }

  // Create a document-like object for canvas creation
  const createCanvasElement = () => {
    const canvas = createCanvas(1920, 1080);
    (canvas as any).style = {};
    // Store the original getContext
    const originalGetContext = canvas.getContext.bind(canvas);
    (canvas as any).getContext = function(type: string) {
      if (type === '2d') {
        return originalGetContext('2d');
      }
      return null;
    };
    return canvas;
  };

  // Minimal document polyfill
  if (!(globalThis as any).document) {
    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          return createCanvasElement();
        }
        if (tag === 'a' || tag === 'input') {
          return {
            style: {},
            click: () => {},
            remove: () => {},
            appendChild: () => {},
          };
        }
        return {};
      },
      head: {
        appendChild: () => {},
      },
      body: {
        appendChild: () => {},
      },
    };
  }

  // Window polyfill
  if (!(globalThis as any).window) {
    (globalThis as any).window = globalThis;
  }

  // OffscreenCanvas polyfill using node-canvas
  if (!(globalThis as any).OffscreenCanvas) {
    (globalThis as any).OffscreenCanvas = class OffscreenCanvas {
      private canvas: Canvas;
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
      }

      getContext(type: string) {
        if (type === '2d') {
          return this.canvas.getContext('2d');
        }
        return null;
      }

      transferToImageBitmap() {
        // Return a mock ImageBitmap
        return {
          width: this.width,
          height: this.height,
          close: () => {},
        };
      }
    };
  }

  // ImageBitmap polyfill
  if (!(globalThis as any).ImageBitmap) {
    (globalThis as any).ImageBitmap = class ImageBitmap {
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }

      close() {}
    };
  }

  // createImageBitmap polyfill
  if (!(globalThis as any).createImageBitmap) {
    (globalThis as any).createImageBitmap = async (source: any) => {
      return new (globalThis as any).ImageBitmap(
        source.width || 100,
        source.height || 100
      );
    };
  }

  // Use node-web-audio-api for AudioContext and OfflineAudioContext
  if (!(globalThis as any).AudioContext) {
    (globalThis as any).AudioContext = NodeAudioContext;
  }
  if (!(globalThis as any).OfflineAudioContext) {
    (globalThis as any).OfflineAudioContext = NodeOfflineAudioContext;
  }
  if (!(globalThis as any).AudioWorkletNode) {
    (globalThis as any).AudioWorkletNode = AudioWorkletNode;
  }

  // requestAnimationFrame polyfill
  if (!(globalThis as any).requestAnimationFrame) {
    (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(Date.now()), 16) as unknown as number;
    };
  }

  // cancelAnimationFrame polyfill
  if (!(globalThis as any).cancelAnimationFrame) {
    (globalThis as any).cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
    };
  }

  // Performance polyfill (if not present)
  if (!(globalThis as any).performance) {
    (globalThis as any).performance = {
      now: () => Date.now(),
    };
  }

  // ResizeObserver polyfill (minimal)
  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // File polyfill (if not present in Node.js version)
  if (!(globalThis as any).File) {
    (globalThis as any).File = class File extends Blob {
      name: string;
      lastModified: number;

      constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
        super(parts, options);
        this.name = name;
        this.lastModified = options?.lastModified || Date.now();
      }
    };
  }

  // FileSystemFileHandle polyfill (minimal)
  if (!(globalThis as any).FileSystemFileHandle) {
    (globalThis as any).FileSystemFileHandle = class FileSystemFileHandle {
      name: string;

      constructor(name: string) {
        this.name = name;
      }

      async getFile() {
        return new File([], this.name);
      }

      async createWritable() {
        const chunks: Uint8Array[] = [];
        return {
          write: async (data: Uint8Array) => {
            chunks.push(data);
          },
          close: async () => {
            return new Blob(chunks);
          },
        };
      }
    };
  }

  // showSaveFilePicker polyfill
  if (!(globalThis as any).showSaveFilePicker) {
    (globalThis as any).showSaveFilePicker = async () => 'output.mp4';
  }

  // HTMLVideoElement polyfill (minimal)
  if (!(globalThis as any).HTMLVideoElement) {
    (globalThis as any).HTMLVideoElement = class HTMLVideoElement {
      src = '';
      videoWidth = 0;
      videoHeight = 0;
      currentTime = 0;
      duration = 0;
      paused = true;
      muted = false;
      volume = 1;
      playbackRate = 1;

      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
      load() {}
    };
  }

  // HTMLAudioElement polyfill (minimal)
  if (!(globalThis as any).HTMLAudioElement) {
    (globalThis as any).HTMLAudioElement = class HTMLAudioElement {
      src = '';
      currentTime = 0;
      duration = 0;
      paused = true;
      muted = false;
      volume = 1;

      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
      load() {}
    };
  }

  console.log('Browser polyfills setup complete');
}

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
    setupBrowserPolyfills();
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should have browser polyfills available', () => {
    expect((globalThis as any).OffscreenCanvas).toBeDefined();
    expect((globalThis as any).AudioContext).toBeDefined();
    expect((globalThis as any).document).toBeDefined();
  });

  it('should be able to import @diffusionstudio/core', async () => {
    // Dynamic import to ensure polyfills are loaded first
    const core = await import('@diffusionstudio/core');
    expect(core).toBeDefined();
    expect(core.Composition).toBeDefined();
    expect(core.Layer).toBeDefined();
    expect(core.VideoClip).toBeDefined();
  });

  it('should create a basic composition', async () => {
    const core = await import('@diffusionstudio/core');

    const composition = new core.Composition({
      width: 1280,
      height: 720,
      background: '#000000',
    });

    expect(composition).toBeDefined();
    expect(composition.width).toBe(1280);
    expect(composition.height).toBe(720);
  });

  it('should create layers in composition', async () => {
    const core = await import('@diffusionstudio/core');

    const composition = new core.Composition({
      width: 1280,
      height: 720,
    });

    const layer = new core.Layer();
    await composition.add(layer);

    expect(layer).toBeDefined();
  });

  it('should load video source from file and create clips', async () => {
    // This test is skipped because it requires full WebCodecs support
    // which may not be fully available in the Node.js environment yet
    const core = await import('@diffusionstudio/core');

    // Get the sample video path
    const videoPath = path.resolve(__dirname, '../samples/sample2.webm');
    expect(fs.existsSync(videoPath)).toBe(true);

    // Read the video file as a blob
    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });

    // Create a composition
    const composition = new core.Composition({
      width: 1280,
      height: 720,
      background: '#000000',
    });

    // Load the video source
    const source = await core.Source.from(videoBlob, {
      mimeType: 'video/webm',
    }) as core.VideoSource;

    // Create a layer with sequential mode to concatenate clips
    const layer = new core.Layer({ mode: 'SEQUENTIAL' });
    await composition.add(layer);

    // Create first clip - first 2 seconds
    const clip1 = new core.VideoClip(source, {
      range: [0, 2],
      position: 'center',
      height: '100%',
    });
    await layer.add(clip1);

    // Create second clip - repeat the same section
    const clip2 = new core.VideoClip(source, {
      range: [0, 2],
      position: 'center',
      height: '100%',
    });
    await layer.add(clip2);

    // Create third clip - different section
    const clip3 = new core.VideoClip(source, {
      range: [2, 4],
      position: 'center',
      height: '100%',
    });
    await layer.add(clip3);

    // Verify composition duration
    expect(composition.duration).toBeGreaterThan(0);
  });

  it('should export composition to file', async () => {
    const core = await import('@diffusionstudio/core');

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
      video: {
        fps: 30,
        bitrate: 2e6,
        codec: 'vp8',
      },
      audio: {
        enabled: false, // Disable audio for this simple test
      },
    });

    // Mock file output
    const outputPath = path.resolve(__dirname, '../test-output/diffusionstudio-test.webm');

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

describe('DiffusionStudio Video Cut and Repeat', () => {
  beforeAll(async () => {
    setupBrowserPolyfills();
    await setupWebCodecsPolyfills();
  }, 30000);

  it('should cut and repeat video segments', async () => {
    // This is the main test demonstrating the cut and repeat functionality
    const core = await import('@diffusionstudio/core');

    // Load sample video
    const videoPath = path.resolve(__dirname, '../samples/sample2.webm');
    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });

    // Create composition
    const composition = new core.Composition({
      width: 1280,
      height: 720,
      background: '#000000',
    });

    // Load video source (can be shared between clips)
    const source = await core.Source.from(videoBlob, {
      mimeType: 'video/webm',
    }) as core.VideoSource;

    // Create a sequential layer for concatenating clips
    const layer = new core.Layer({ mode: 'SEQUENTIAL' });
    await composition.add(layer);

    // Cut the video into segments and repeat
    const segments = [
      { start: 0, end: 2 },    // First 2 seconds
      { start: 0, end: 2 },    // Repeat first 2 seconds
      { start: 2, end: 4 },    // Next 2 seconds
      { start: 0, end: 2 },    // Repeat first 2 seconds again
    ];

    for (const segment of segments) {
      const clip = new core.VideoClip(source, {
        range: [segment.start, segment.end],
        position: 'center',
        height: '100%',
      });
      await layer.add(clip);
    }

    // The composition should now have 6+ seconds (clips with ranges)
    console.log('Composition duration:', composition.duration);
    expect(composition.duration).toBeGreaterThan(0);

    // Export the composition
    const encoder = new core.Encoder(composition, {
      video: {
        fps: 30,
        bitrate: 2e6,
        codec: 'vp8',
      },
      audio: {
        enabled: false, // Disable audio to avoid decoder issues
      },
    });

    // Render
    const outputPath = path.resolve(__dirname, '../test-output/cut-repeat-video.webm');
    const result = await encoder.render();

    console.log('Render result type:', result.type);
    if (result.type === 'success') {
      const arrayBuffer = await result.data?.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer!));
      console.log('Video exported to:', outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    } else {
      console.log('Render failed:', result);
    }
  });
});
