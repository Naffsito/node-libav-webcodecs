/**
 * Browser API polyfills needed for diffusionstudio and WebCodecs in Node.js
 */

import { createCanvas, Canvas, CanvasRenderingContext2D, Image, DOMMatrix } from 'canvas';
import {
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
  AudioWorkletNode,
  AudioBuffer as NodeAudioBuffer,
} from 'node-web-audio-api';

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
