/**
 * Debug test for audio worklet / OfflineAudioContext rendering
 * This tests if audio can flow through the rendering pipeline
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
  AudioBuffer as NodeAudioBuffer,
} from 'node-web-audio-api';

// Setup polyfills
(globalThis as any).AudioContext = NodeAudioContext;
(globalThis as any).OfflineAudioContext = NodeOfflineAudioContext;
(globalThis as any).AudioBuffer = NodeAudioBuffer;

import {
  AudioEncoder as PolyAudioEncoder,
  AudioData as PolyAudioData,
  EncodedAudioChunk as PolyEncodedAudioChunk,
} from '../src/main';
import * as avloader from '../src/avloader';

async function setupWebCodecs() {
  (globalThis as any).AudioEncoder = PolyAudioEncoder;
  (globalThis as any).AudioData = PolyAudioData;
  (globalThis as any).EncodedAudioChunk = PolyEncodedAudioChunk;
  await avloader.load({ backend: 'node-av' });
}

describe('Audio Worklet Debug', () => {
  beforeAll(async () => {
    await setupWebCodecs();
  }, 30000);

  it('should render audio through OfflineAudioContext', async () => {
    // Create a simple sine wave AudioBuffer
    const sampleRate = 48000;
    const duration = 0.5; // 500ms
    const numSamples = Math.floor(sampleRate * duration);
    
    const audioBuffer = new NodeAudioBuffer({
      numberOfChannels: 2,
      length: numSamples,
      sampleRate: sampleRate,
    });

    // Fill with a 440Hz sine wave
    for (let channel = 0; channel < 2; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < numSamples; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
      }
    }

    console.log('Created AudioBuffer:', {
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
    });

    // Check the data for NaN
    const channel0 = audioBuffer.getChannelData(0);
    let hasNaN = false;
    let hasInf = false;
    for (let i = 0; i < Math.min(1000, channel0.length); i++) {
      if (Number.isNaN(channel0[i])) hasNaN = true;
      if (!Number.isFinite(channel0[i])) hasInf = true;
    }
    console.log('AudioBuffer data check: hasNaN=', hasNaN, 'hasInf=', hasInf);
    expect(hasNaN).toBe(false);
    expect(hasInf).toBe(false);

    // Create OfflineAudioContext
    const offlineCtx = new NodeOfflineAudioContext({
      numberOfChannels: 2,
      sampleRate: sampleRate,
      length: numSamples,
    });

    // Create buffer source and connect
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    // Render
    console.log('Starting OfflineAudioContext render...');
    const renderedBuffer = await offlineCtx.startRendering();
    console.log('Render complete:', {
      numberOfChannels: renderedBuffer.numberOfChannels,
      length: renderedBuffer.length,
      sampleRate: renderedBuffer.sampleRate,
    });

    // Check rendered buffer for NaN
    const renderedData = renderedBuffer.getChannelData(0);
    hasNaN = false;
    hasInf = false;
    let nonZeroCount = 0;
    for (let i = 0; i < Math.min(1000, renderedData.length); i++) {
      if (Number.isNaN(renderedData[i])) hasNaN = true;
      if (!Number.isFinite(renderedData[i])) hasInf = true;
      if (renderedData[i] !== 0) nonZeroCount++;
    }
    console.log('Rendered data check: hasNaN=', hasNaN, 'hasInf=', hasInf, 'nonZeroSamples=', nonZeroCount);
    
    expect(hasNaN).toBe(false);
    expect(hasInf).toBe(false);
    expect(nonZeroCount).toBeGreaterThan(0); // Should have actual audio data
  });

  it('should encode audio from Float32Array (f32-planar format)', async () => {
    const sampleRate = 48000;
    const numSamples = 1024;
    const numberOfChannels = 2;

    // Create f32-planar data (channels are separate, not interleaved)
    const audioData = new Float32Array(numSamples * numberOfChannels);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      for (let i = 0; i < numSamples; i++) {
        const idx = ch * numSamples + i;
        audioData[idx] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
      }
    }

    console.log('Created f32-planar audio data:', {
      length: audioData.length,
      numberOfChannels,
      numSamples,
    });

    // Check for NaN/Inf
    let hasNaN = false;
    let hasInf = false;
    for (let i = 0; i < audioData.length; i++) {
      if (Number.isNaN(audioData[i])) hasNaN = true;
      if (!Number.isFinite(audioData[i])) hasInf = true;
    }
    console.log('f32-planar data check: hasNaN=', hasNaN, 'hasInf=', hasInf);
    expect(hasNaN).toBe(false);
    expect(hasInf).toBe(false);

    // Create AudioData
    const ad = new PolyAudioData({
      format: 'f32-planar',
      sampleRate: sampleRate,
      numberOfFrames: numSamples,
      numberOfChannels: numberOfChannels,
      timestamp: 0,
      data: audioData,
    });

    console.log('Created AudioData:', {
      format: ad.format,
      sampleRate: ad.sampleRate,
      numberOfFrames: ad.numberOfFrames,
      numberOfChannels: ad.numberOfChannels,
    });

    // Create AAC encoder
    const encodedChunks: any[] = [];
    const encoder = new PolyAudioEncoder({
      output: (chunk, metadata) => {
        console.log('Encoded chunk:', {
          type: chunk.type,
          byteLength: chunk.byteLength,
          timestamp: chunk.timestamp,
        });
        encodedChunks.push(chunk);
      },
      error: (e) => {
        console.error('Encoder error:', e);
      },
    });

    // Configure for AAC (mp4a)
    const config = {
      codec: 'mp4a.40.2',
      sampleRate: sampleRate,
      numberOfChannels: numberOfChannels,
      bitrate: 128000,
    };

    const supported = await PolyAudioEncoder.isConfigSupported(config);
    console.log('AAC encoder supported:', supported.supported);
    expect(supported.supported).toBe(true);

    encoder.configure(config);

    // Encode
    console.log('Encoding AudioData...');
    encoder.encode(ad);
    await encoder.flush();
    encoder.close();

    console.log('Encoded chunks:', encodedChunks.length);
    expect(encodedChunks.length).toBeGreaterThan(0);
  }, 30000);
});
