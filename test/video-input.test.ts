/**
 * Minimal test for video input processing with DiffusionStudio
 * Goal: Load a video file, process it, and render to output
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, Canvas, CanvasRenderingContext2D, Image, DOMMatrix } from 'canvas';

// Import node-web-audio-api
import {
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
  AudioWorkletNode as NodeAudioWorkletNode,
} from 'node-web-audio-api';

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

// Setup all browser polyfills
function setupPolyfills() {
  // Canvas
  (globalThis as any).HTMLCanvasElement = Canvas;
  (globalThis as any).CanvasRenderingContext2D = CanvasRenderingContext2D;
  (globalThis as any).Image = Image;
  (globalThis as any).DOMMatrix = DOMMatrix;

  // Patch drawImage to handle VideoFrame
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

  // Path2D
  if (!(globalThis as any).Path2D) {
    (globalThis as any).Path2D = class Path2D {
      constructor() {}
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
      roundRect() {}
    };
  }

  // DOMRect
  if (!(globalThis as any).DOMRect) {
    (globalThis as any).DOMRect = class DOMRect {
      constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
      get top() { return this.y; }
      get left() { return this.x; }
      get bottom() { return this.y + this.height; }
      get right() { return this.x + this.width; }
      static fromRect(rect?: any) {
        return new (globalThis as any).DOMRect(rect?.x, rect?.y, rect?.width, rect?.height);
      }
      toJSON() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      }
    };
  }

  // Document
  const createCanvasElement = () => {
    const canvas = createCanvas(1920, 1080);
    (canvas as any).style = {};
    const originalGetContext = canvas.getContext.bind(canvas);
    (canvas as any).getContext = function(type: string) {
      if (type === '2d') return originalGetContext('2d');
      return null;
    };
    return canvas;
  };

  if (!(globalThis as any).document) {
    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') return createCanvasElement();
        if (tag === 'a' || tag === 'input') {
          return { style: {}, click: () => {}, remove: () => {}, appendChild: () => {} };
        }
        return {};
      },
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
    };
  }

  // Window
  if (!(globalThis as any).window) {
    (globalThis as any).window = globalThis;
  }

  // OffscreenCanvas
  if (!(globalThis as any).OffscreenCanvas) {
    (globalThis as any).OffscreenCanvas = class OffscreenCanvas {
      private canvas: Canvas;
      constructor(public width: number, public height: number) {
        this.canvas = createCanvas(width, height);
      }
      getContext(type: string) {
        if (type === '2d') return this.canvas.getContext('2d');
        return null;
      }
      transferToImageBitmap() {
        return { width: this.width, height: this.height, close: () => {} };
      }
    };
  }

  // ImageBitmap
  if (!(globalThis as any).ImageBitmap) {
    (globalThis as any).ImageBitmap = class ImageBitmap {
      constructor(public width: number, public height: number) {}
      close() {}
    };
  }

  // createImageBitmap
  if (!(globalThis as any).createImageBitmap) {
    (globalThis as any).createImageBitmap = async (source: any) => {
      return new (globalThis as any).ImageBitmap(source.width || 100, source.height || 100);
    };
  }

  // Audio
  (globalThis as any).AudioContext = NodeAudioContext;
  (globalThis as any).OfflineAudioContext = NodeOfflineAudioContext;
  (globalThis as any).AudioWorkletNode = NodeAudioWorkletNode;

  // Animation
  if (!(globalThis as any).requestAnimationFrame) {
    (globalThis as any).requestAnimationFrame = (cb: Function) => setTimeout(() => cb(Date.now()), 16);
  }
  if (!(globalThis as any).cancelAnimationFrame) {
    (globalThis as any).cancelAnimationFrame = clearTimeout;
  }

  // Performance
  if (!(globalThis as any).performance) {
    (globalThis as any).performance = { now: () => Date.now() };
  }

  // ResizeObserver
  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  }

  // File
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

  // FileSystemFileHandle
  if (!(globalThis as any).FileSystemFileHandle) {
    (globalThis as any).FileSystemFileHandle = class FileSystemFileHandle {
      kind = 'file';
      constructor(public name: string = 'file') {}
      async getFile() {
        return new (globalThis as any).File([], this.name);
      }
      async createWritable() {
        const chunks: Uint8Array[] = [];
        return {
          write: async (data: Uint8Array) => { chunks.push(data); },
          close: async () => new Blob(chunks),
        };
      }
    };
  }

  // HTMLVideoElement - needs to be more complete for DiffusionStudio
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
      readyState = 0;
      
      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
      load() {}
      addEventListener() {}
      removeEventListener() {}
    };
  }

  // HTMLAudioElement
  if (!(globalThis as any).HTMLAudioElement) {
    (globalThis as any).HTMLAudioElement = class HTMLAudioElement {
      src = '';
      currentTime = 0;
      duration = 0;
      paused = true;
      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
      load() {}
    };
  }

  // WebCodecs
  (globalThis as any).VideoDecoder = PolyVideoDecoder;
  (globalThis as any).VideoEncoder = PolyVideoEncoder;
  (globalThis as any).AudioEncoder = PolyAudioEncoder;
  (globalThis as any).AudioDecoder = PolyAudioDecoder;
  (globalThis as any).VideoFrame = PolyVideoFrame;
  (globalThis as any).AudioData = PolyAudioData;
  (globalThis as any).EncodedVideoChunk = PolyEncodedVideoChunk;
  (globalThis as any).EncodedAudioChunk = PolyEncodedAudioChunk;

  console.log('All polyfills setup complete');
}

describe('Video Input Processing', () => {
  beforeAll(async () => {
    setupPolyfills();
    await avloader.load({ backend: 'node-av' });
    console.log('Decoders:', avloader.decoders);
    console.log('Encoders:', avloader.encoders);
  }, 30000);

  it('should load and render a video file', async () => {
    const core = await import('@diffusionstudio/core');

    // Load video-only sample (no audio to avoid audio decoding issues)
    const videoPath = path.resolve(__dirname, '../samples/sample2-video-only.webm');
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

    // Create layer and add video clip
    const layer = new core.Layer();
    await composition.add(layer);

    // Add the video clip (use full duration, no trimming)
    const clip = new core.VideoClip(source, {
      position: 'center',
      height: '100%',
    });
    await layer.add(clip);
    
    console.log('Clip added, composition duration:', composition.duration);

    // Render
    const encoder = new core.Encoder(composition, {
      video: {
        fps: 25,  // Match source fps
        bitrate: 1_000_000,
        codec: 'vp8',
      },
      audio: {
        enabled: false,
      },
    });

    console.log('Starting render...');
    const result = await encoder.render();
    
    console.log('Render result:', result.type);
    if (result.type === 'success') {
      const outputPath = path.resolve(__dirname, '../test-output/video-input-test.webm');
      const arrayBuffer = await result.data?.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer!));
      console.log('Output saved to:', outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log('Output size:', stats.size, 'bytes');
      expect(stats.size).toBeGreaterThan(1000);
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
