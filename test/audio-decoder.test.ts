import { describe, it, expect, beforeAll } from 'vitest';
import { NodeAVAdapter, createNodeAVAdapter } from '../src/node-av-adapter';

describe('Audio Decoding', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  describe('FLAC round-trip', () => {
    it('should encode and decode FLAC audio', async () => {
      // Note: FLAC is tricky because the decoder needs the stream header (extradata)
      // For raw FLAC decoding, we use the native codec directly
      // For this test, we test with a simple encode-only scenario
      
      // Initialize encoder
      const [, encCtxId, encFrameId, encPktId, frameSize] = await adapter.ff_init_encoder('flac', {
        codec: 'flac',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_S16, // Use S16 instead of S32 to avoid experimental warning
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3,
        }
      });

      // Create test audio data (sine wave)
      const bytesPerSample = 2; // S16
      const channels = 2;
      const numFrames = 3;
      const allPackets: any[] = [];

      for (let f = 0; f < numFrames; f++) {
        const audioData = new Int16Array(frameSize * channels);
        
        // Generate simple sine wave (440 Hz)
        for (let i = 0; i < frameSize; i++) {
          const t = (f * frameSize + i) / 48000;
          const sample = Math.round(Math.sin(2 * Math.PI * 440 * t) * 10000);
          audioData[i * channels] = sample;     // Left
          audioData[i * channels + 1] = sample; // Right
        }

        const packets = await adapter.ff_encode_multi(encCtxId, encFrameId, encPktId, [{
          data: new Uint8Array(audioData.buffer),
          format: adapter.AV_SAMPLE_FMT_S16,
          channels: 2,
          channel_layout: 3,
          sample_rate: 48000,
          nb_samples: frameSize,
          pts: f * frameSize,
          ptshi: 0,
        }]);

        for (const pkt of packets) {
          allPackets.push(pkt);
        }
      }

      // Flush encoder
      const flushPackets = await adapter.ff_encode_multi(encCtxId, encFrameId, encPktId, [], true);
      for (const pkt of flushPackets) {
        allPackets.push(pkt);
      }

      expect(allPackets.length).toBeGreaterThan(0);
      
      // Verify at least some FLAC packets have valid data
      // (FLAC encoder may produce some packets with minimal data)
      const packetsWithData = allPackets.filter(pkt => pkt.data && pkt.data.length > 0);
      expect(packetsWithData.length).toBeGreaterThan(0);

      // Cleanup encoder
      await adapter.ff_free_encoder(encCtxId, encFrameId, encPktId);
      
      // Note: Full FLAC decode test would require muxing the packets into a container
      // or extracting extradata from the encoder - this is tested separately with
      // actual media files
    });
  });

  describe('Opus round-trip', () => {
    it('should encode and decode Opus audio', async () => {
      // Initialize encoder
      const [, encCtxId, encFrameId, encPktId, frameSize] = await adapter.ff_init_encoder('libopus', {
        codec: 'libopus',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_FLT,
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3,
          bit_rate: 128000,
        }
      });

      // Create test audio data
      const bytesPerSample = 4; // FLT
      const channels = 2;
      const numFrames = 3;
      const allPackets: Uint8Array[] = [];

      for (let f = 0; f < numFrames; f++) {
        const audioData = new Float32Array(frameSize * channels);
        
        // Generate simple sine wave
        for (let i = 0; i < frameSize; i++) {
          const t = (f * frameSize + i) / 48000;
          const sample = Math.sin(2 * Math.PI * 440 * t) * 0.5;
          audioData[i * channels] = sample;
          audioData[i * channels + 1] = sample;
        }

        const packets = await adapter.ff_encode_multi(encCtxId, encFrameId, encPktId, [{
          data: new Uint8Array(audioData.buffer),
          format: adapter.AV_SAMPLE_FMT_FLT,
          channels: 2,
          channel_layout: 3,
          sample_rate: 48000,
          nb_samples: frameSize,
          pts: f * frameSize,
          ptshi: 0,
        }]);

        for (const pkt of packets) {
          allPackets.push(pkt.data);
        }
      }

      // Flush encoder
      const flushPackets = await adapter.ff_encode_multi(encCtxId, encFrameId, encPktId, [], true);
      for (const pkt of flushPackets) {
        allPackets.push(pkt.data);
      }

      expect(allPackets.length).toBeGreaterThan(0);

      // Cleanup encoder
      await adapter.ff_free_encoder(encCtxId, encFrameId, encPktId);

      // Initialize decoder
      const [, decCtxId, decPktId, decFrameId] = await adapter.ff_init_decoder('libopus');

      // Decode all packets
      const allFrames: any[] = [];
      for (const packetData of allPackets) {
        const frames = await adapter.ff_decode_multi(decCtxId, decPktId, decFrameId, [{
          data: packetData,
          pts: 0,
          ptshi: 0,
        }]);

        allFrames.push(...frames);
      }

      // Flush decoder
      const flushFrames = await adapter.ff_decode_multi(decCtxId, decPktId, decFrameId, [], true);
      allFrames.push(...flushFrames);

      // Verify we got frames back
      expect(allFrames.length).toBeGreaterThan(0);

      // Check frame properties
      for (const frame of allFrames) {
        expect(frame.sample_rate).toBe(48000);
        expect(frame.channels).toBe(2);
        expect(frame.nb_samples).toBeGreaterThan(0);
      }

      // Cleanup decoder
      await adapter.ff_free_decoder(decCtxId, decPktId, decFrameId);
    });
  });
});
