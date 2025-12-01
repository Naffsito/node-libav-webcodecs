/**
 * Browser API polyfills needed for diffusionstudio and WebCodecs in Node.js
 */

import { createCanvas, GlobalFonts, Path2D, Image, DOMMatrix } from '@napi-rs/canvas';
import {
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
  AudioWorkletNode,
  AudioBuffer as NodeAudioBuffer,
} from 'node-web-audio-api';
import * as fs from 'fs';

// ============================================================================
// Register system fonts for @napi-rs/canvas
// ============================================================================

const fontPaths = [
  // macOS
  { path: '/System/Library/Fonts/Helvetica.ttc', family: 'Helvetica' },
  { path: '/System/Library/Fonts/Geneva.ttf', family: 'Geneva' },
  { path: '/Library/Fonts/Arial Unicode.ttf', family: 'Arial' },
  // Linux
  { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
  { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', family: 'Liberation Sans' },
];

for (const font of fontPaths) {
  if (fs.existsSync(font.path)) {
    try {
      GlobalFonts.registerFromPath(font.path, font.family);
    } catch (e) {
      // Ignore font registration errors
    }
  }
}

// ============================================================================
// FontFace polyfill for node-canvas
// ============================================================================

if (!(globalThis as any).FontFace) {
  (globalThis as any).FontFace = class FontFace {
    family: string;
    source: string;
    status: string = 'unloaded';
    loaded: Promise<FontFace>;
    private _resolve!: (value: FontFace) => void;

    constructor(family: string, source: string, descriptors?: any) {
      this.family = family;
      this.source = typeof source === 'string' ? source : '';
      this.loaded = new Promise((resolve) => {
        this._resolve = resolve;
      });
    }

    async load(): Promise<FontFace> {
      try {
        // Extract URL from source (handles "url(...)" format)
        let url = this.source;
        const urlMatch = this.source.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          url = urlMatch[1];
        }

        // Fetch the font file
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        
        // Write to temp file and register with @napi-rs/canvas
        const tempPath = `/tmp/font-${this.family}-${Date.now()}.ttf`;
        fs.writeFileSync(tempPath, Buffer.from(buffer));
        GlobalFonts.registerFromPath(tempPath, this.family);
        
        this.status = 'loaded';
        this._resolve(this);
        return this;
      } catch (e) {
        this.status = 'error';
        throw e;
      }
    }
  };
}

// Document.fonts polyfill - set up immediately
const fontsSet = new Set<any>();
const fontsPolyfill = {
  add: (font: any) => { fontsSet.add(font); return fontsSet; },
  delete: (font: any) => fontsSet.delete(font),
  has: (font: any) => fontsSet.has(font),
  clear: () => fontsSet.clear(),
  forEach: (cb: any) => fontsSet.forEach(cb),
  entries: () => fontsSet.entries(),
  keys: () => fontsSet.keys(),
  values: () => fontsSet.values(),
  get size() { return fontsSet.size; },
  ready: Promise.resolve(),
  status: 'loaded',
  [Symbol.iterator]: () => fontsSet[Symbol.iterator](),
};

// Will be assigned to document.fonts later when document is created

/**
 * IMPORTANT: node-web-audio-api OfflineAudioContext Limitation
 * 
 * Unlike browsers, node-web-audio-api does NOT support scheduling audio nodes
 * after startRendering() has been called. Audio scheduled after startRendering()
 * will produce silence.
 * 
 * This is by design - the Rust backend only processes control messages at:
 * - Before rendering starts
 * - During suspend() callbacks
 * - After event handlers
 * 
 * Solutions:
 * 1. Schedule ALL audio BEFORE calling startRendering()
 * 2. Use suspend(time) callbacks to schedule audio at specific points
 * 
 * See: docs/node-web-audio-api-offline-rendering-issue.md
 */

// ============================================================================
// drawImage patch to handle VideoFrame
// ============================================================================

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

// Store reference to patch context prototype later
let contextPrototypePatched = false;

function patchContextPrototype(ctx: any) {
  if (contextPrototypePatched) return;
  contextPrototypePatched = true;
  
  const proto = Object.getPrototypeOf(ctx);
  
  // Patch measureText to add missing fontBoundingBox properties
  const originalMeasureText = proto.measureText;
  proto.measureText = function(text: string) {
    const metrics = originalMeasureText.call(this, text);
    
    // Add missing fontBoundingBox properties that browsers provide
    if (metrics.fontBoundingBoxAscent === undefined) {
      // Use emHeight values as fallback, or estimate from font size
      const emAscent = (metrics as any).emHeightAscent;
      const emDescent = (metrics as any).emHeightDescent;
      
      (metrics as any).fontBoundingBoxAscent = emAscent ?? metrics.actualBoundingBoxAscent * 1.2;
      (metrics as any).fontBoundingBoxDescent = emDescent ?? metrics.actualBoundingBoxDescent * 1.2;
    }
    
    return metrics;
  };

  // Patch drawImage to handle VideoFrame
  const originalDrawImage = proto.drawImage;
  proto.drawImage = function(image: any, ...args: any[]) {
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
}

// ============================================================================
// Canvas polyfills
// ============================================================================

// Create a dummy canvas to get the class constructors
const _dummyCanvas = createCanvas(1, 1);
const _dummyCtx = _dummyCanvas.getContext('2d');

// Patch the context prototype
patchContextPrototype(_dummyCtx);

// Get the Canvas class from the prototype chain
const CanvasClass = _dummyCanvas.constructor;
const CanvasRenderingContext2DClass = _dummyCtx.constructor;

(globalThis as any).HTMLCanvasElement = CanvasClass;
(globalThis as any).CanvasRenderingContext2D = CanvasRenderingContext2DClass;
(globalThis as any).Image = Image;

// Use @napi-rs/canvas's Path2D
(globalThis as any).Path2D = Path2D;

// DOMMatrix polyfill - use DOMMatrix from @napi-rs/canvas
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
      const ctx = originalGetContext('2d');
      patchContextPrototype(ctx);
      return ctx;
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
    fonts: fontsPolyfill,
  };
}

// Ensure document.fonts exists even if document was already defined
if ((globalThis as any).document && !(globalThis as any).document.fonts) {
  (globalThis as any).document.fonts = fontsPolyfill;
}

// Window polyfill
if (!(globalThis as any).window) {
  (globalThis as any).window = globalThis;
}

// OffscreenCanvas polyfill using @napi-rs/canvas
if (!(globalThis as any).OffscreenCanvas) {
  (globalThis as any).OffscreenCanvas = class OffscreenCanvas {
    private canvas: any;
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

// Use node-web-audio-api for AudioContext, OfflineAudioContext, and AudioBuffer
if (!(globalThis as any).AudioContext) {
  (globalThis as any).AudioContext = NodeAudioContext;
}
if (!(globalThis as any).OfflineAudioContext) {
  (globalThis as any).OfflineAudioContext = NodeOfflineAudioContext;
}
if (!(globalThis as any).AudioWorkletNode) {
  (globalThis as any).AudioWorkletNode = AudioWorkletNode;
}
if (!(globalThis as any).AudioBuffer) {
  (globalThis as any).AudioBuffer = NodeAudioBuffer;
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
      return new (globalThis as any).File([], this.name);
    }

    async createWritable() {
      const chunks: BlobPart[] = [];
      return {
        write: async (data: Uint8Array) => {
          chunks.push(data as BlobPart);
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
    readyState = 0;

    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    addEventListener() {}
    removeEventListener() {}
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

export {};
