import { describe, it, expect } from 'vitest';
import * as avloader from '../src/avloader';
import { VideoEncoder, VideoFrame } from '../src/main';

// Polyfill DOMRect for Node.js
if (typeof globalThis.DOMRect === 'undefined') {
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
    get right() { return this.x + this.width; }
    get bottom() { return this.y + this.height; }
    toJSON() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
  };
}

describe('VideoEncoder Debug', () => {
  it('should configure and encode a frame', async () => {
    // Initialize
    await avloader.load({ backend: 'node-av' });
    console.log('Encoders available:', avloader.encoders);
    
    // Test encoder support
    const config = {
      codec: 'vp8',
      width: 640,
      height: 480,
      bitrate: 2_000_000,
      framerate: 30
    };
    
    const encResult = avloader.encoder('vp8', config);
    console.log('Encoder config result:', encResult);
    
    const support = await VideoEncoder.isConfigSupported(config);
    console.log('isConfigSupported:', support);
    expect(support.supported).toBe(true);
    
    // Try to create and configure encoder
    let chunks: any[] = [];
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        console.log('Got chunk:', chunk.type, chunk.byteLength);
        chunks.push(chunk);
      },
      error: (e) => {
        console.error('Encoder error:', e);
      }
    });
    
    console.log('Initial state:', encoder.state);
    encoder.configure(config);
    console.log('After configure:', encoder.state);
    
    // Wait a bit for async config
    await new Promise(r => setTimeout(r, 500));
    console.log('After wait:', encoder.state);
    expect(encoder.state).toBe('configured');
    
    // Create a test frame
    const frameData = new Uint8Array(640 * 480 * 4); // RGBA
    frameData.fill(128); // Gray
    
    const frame = new VideoFrame(frameData, {
      format: 'RGBA',
      codedWidth: 640,
      codedHeight: 480,
      timestamp: 0
    });
    
    console.log('Created frame:', frame.codedWidth, 'x', frame.codedHeight);
    encoder.encode(frame);
    frame.close();
    
    await encoder.flush();
    console.log('Encoded chunks:', chunks.length);
    expect(chunks.length).toBeGreaterThan(0);
    
    encoder.close();
  });
});
