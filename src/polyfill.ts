/**
 * Single-file polyfill for WebCodecs and browser APIs in Node.js
 * 
 * Usage:
 *   import 'node-libav-webcodecs/polyfill';
 * 
 * This sets up all required globals on globalThis:
 * - WebCodecs: VideoEncoder, VideoDecoder, AudioEncoder, AudioDecoder,
 *              VideoFrame, AudioData, EncodedVideoChunk, EncodedAudioChunk
 * - Browser APIs: Canvas, OffscreenCanvas, document, window, etc.
 * 
 * NOTE: Audio encoding/decoding is not currently working.
 */

// Browser API polyfills (canvas, document, window, audio context, etc.)
import './browser-polyfills';

// WebCodecs API polyfills
export { init } from './webcodecs-polyfills';
