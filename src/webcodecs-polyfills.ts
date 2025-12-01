/**
 * WebCodecs API polyfills for Node.js
 * 
 * Sets up WebCodecs classes on globalThis:
 * - VideoEncoder, VideoDecoder
 * - AudioEncoder, AudioDecoder
 * - VideoFrame, AudioData
 * - EncodedVideoChunk, EncodedAudioChunk
 * 
 * NOTE: Audio encoding/decoding is not currently working.
 */

import {
  VideoEncoder as PolyVideoEncoder,
  VideoDecoder as PolyVideoDecoder,
  AudioEncoder as PolyAudioEncoder,
  AudioDecoder as PolyAudioDecoder,
  VideoFrame as PolyVideoFrame,
  AudioData as PolyAudioData,
  EncodedVideoChunk as PolyEncodedVideoChunk,
  EncodedAudioChunk as PolyEncodedAudioChunk,
} from './main';

import * as avloader from './avloader';

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

let _initPromise: Promise<void> | null = null;

/**
 * Initialize the WebCodecs polyfill codec lists.
 * This is called automatically on import, but you can await this
 * to ensure initialization is complete.
 */
export async function init(): Promise<void> {
  if (!_initPromise) {
    _initPromise = avloader.load({ backend: 'node-av' }).catch((e) => {
      console.warn('Failed to initialize WebCodecs codec lists:', e);
    });
  }
  return _initPromise;
}

// Auto-initialize on import
init();

export {};
