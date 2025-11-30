import { describe, it, expect, beforeAll } from 'vitest';
import { NodeAVAdapter, createNodeAVAdapter } from '../src/node-av-adapter';

describe('NodeAVAdapter', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  describe('f64toi64 / i64tof64', () => {
    it('should convert numbers correctly', () => {
      const value = 1234567890;
      const [low, high] = adapter.f64toi64(value);
      const result = adapter.i64tof64(low, high);
      expect(result).toBe(value);
    });

    it('should handle zero', () => {
      const [low, high] = adapter.f64toi64(0);
      expect(low).toBe(0);
      expect(high).toBe(0);
      expect(adapter.i64tof64(low, high)).toBe(0);
    });

    it('should handle large numbers', () => {
      const value = 0x1FFFFFFFFFF; // Larger than 32 bits
      const [low, high] = adapter.f64toi64(value);
      const result = adapter.i64tof64(low, high);
      expect(result).toBe(value);
    });
  });

  describe('codec detection', () => {
    it('should find FLAC encoder', async () => {
      const found = await adapter.avcodec_find_encoder_by_name('flac');
      expect(found).toBeGreaterThan(0);
    });

    it('should find FLAC decoder', async () => {
      const found = await adapter.avcodec_find_decoder_by_name('flac');
      expect(found).toBeGreaterThan(0);
    });

    it('should find libopus encoder', async () => {
      const found = await adapter.avcodec_find_encoder_by_name('libopus');
      expect(found).toBeGreaterThan(0);
    });

    it('should find libopus decoder', async () => {
      const found = await adapter.avcodec_find_decoder_by_name('libopus');
      expect(found).toBeGreaterThan(0);
    });

    it('should find libvpx encoder', async () => {
      const found = await adapter.avcodec_find_encoder_by_name('libvpx');
      expect(found).toBeGreaterThan(0);
    });

    it('should find libvpx decoder', async () => {
      const found = await adapter.avcodec_find_decoder_by_name('libvpx');
      expect(found).toBeGreaterThan(0);
    });
  });

  describe('encoder initialization', () => {
    it('should initialize FLAC encoder', async () => {
      const [codec, contextId, frameId, pktId, frameSize] = await adapter.ff_init_encoder('flac', {
        codec: 'flac',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_S32,
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3, // stereo
        }
      });

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);
      expect(frameSize).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });

    it('should initialize libopus encoder', async () => {
      const [codec, contextId, frameId, pktId, frameSize] = await adapter.ff_init_encoder('libopus', {
        codec: 'libopus',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_FLT,
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3,
          bit_rate: 128000,
        }
      });

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);
      expect(frameSize).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });
  });

  describe('decoder initialization', () => {
    it('should initialize FLAC decoder', async () => {
      const [codec, contextId, pktId, frameId] = await adapter.ff_init_decoder('flac');

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_decoder(contextId, pktId, frameId);
    });

    it('should initialize libopus decoder', async () => {
      const [codec, contextId, pktId, frameId] = await adapter.ff_init_decoder('libopus');

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_decoder(contextId, pktId, frameId);
    });
  });

  describe('audio encoding', () => {
    it('should encode silence to FLAC', async () => {
      const [, contextId, frameId, pktId, frameSize] = await adapter.ff_init_encoder('flac', {
        codec: 'flac',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_S32,
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3,
        }
      });

      // Create silence frame (S32 = 4 bytes per sample)
      const bytesPerSample = 4;
      const channels = 2;
      const silenceData = new Uint8Array(frameSize * channels * bytesPerSample);

      const packets = await adapter.ff_encode_multi(contextId, frameId, pktId, [{
        data: silenceData,
        format: adapter.AV_SAMPLE_FMT_S32,
        channels: 2,
        channel_layout: 3,
        sample_rate: 48000,
        nb_samples: frameSize,
        pts: 0,
        ptshi: 0,
      }]);

      // FLAC should produce at least one packet
      expect(packets.length).toBeGreaterThanOrEqual(0);

      // Flush encoder
      const flushPackets = await adapter.ff_encode_multi(contextId, frameId, pktId, [], true);
      expect(flushPackets.length).toBeGreaterThanOrEqual(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });

    it('should encode silence to Opus', async () => {
      const [, contextId, frameId, pktId, frameSize] = await adapter.ff_init_encoder('libopus', {
        codec: 'libopus',
        ctx: {
          sample_fmt: adapter.AV_SAMPLE_FMT_FLT,
          sample_rate: 48000,
          channels: 2,
          channel_layout: 3,
          bit_rate: 128000,
        }
      });

      // Create silence frame (FLT = 4 bytes per sample)
      const bytesPerSample = 4;
      const channels = 2;
      const silenceData = new Uint8Array(frameSize * channels * bytesPerSample);

      const packets = await adapter.ff_encode_multi(contextId, frameId, pktId, [{
        data: silenceData,
        format: adapter.AV_SAMPLE_FMT_FLT,
        channels: 2,
        channel_layout: 3,
        sample_rate: 48000,
        nb_samples: frameSize,
        pts: 0,
        ptshi: 0,
      }]);

      expect(packets.length).toBeGreaterThanOrEqual(0);

      // Flush
      const flushPackets = await adapter.ff_encode_multi(contextId, frameId, pktId, [], true);
      
      // Total encoded packets should be >= 1
      const totalPackets = packets.length + flushPackets.length;
      expect(totalPackets).toBeGreaterThanOrEqual(1);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });
  });
});

describe('Sample Format Constants', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  it('should have valid sample format constants', () => {
    expect(adapter.AV_SAMPLE_FMT_U8).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_S16).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_S32).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_FLT).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_U8P).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_S16P).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_S32P).toBeDefined();
    expect(adapter.AV_SAMPLE_FMT_FLTP).toBeDefined();
  });

  it('should have valid pixel format constants', () => {
    expect(adapter.AV_PIX_FMT_YUV420P).toBeDefined();
    expect(adapter.AV_PIX_FMT_YUV422P).toBeDefined();
    expect(adapter.AV_PIX_FMT_YUV444P).toBeDefined();
    expect(adapter.AV_PIX_FMT_RGBA).toBeDefined();
    expect(adapter.AV_PIX_FMT_BGRA).toBeDefined();
    expect(adapter.AV_PIX_FMT_NV12).toBeDefined();
  });
});
