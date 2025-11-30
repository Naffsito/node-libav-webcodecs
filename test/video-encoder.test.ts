import { describe, it, expect, beforeAll } from 'vitest';
import { NodeAVAdapter, createNodeAVAdapter } from '../src/node-av-adapter';

describe('Video Encoding', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  describe('VP8 encoding', () => {
    it('should find libvpx encoder', async () => {
      const found = await adapter.avcodec_find_encoder_by_name('libvpx');
      expect(found).toBeGreaterThan(0);
    });

    it('should initialize VP8 encoder', async () => {
      const [codec, contextId, frameId, pktId, frameSize] = await adapter.ff_init_encoder('libvpx', {
        codec: 'libvpx',
        ctx: {
          pix_fmt: adapter.AV_PIX_FMT_YUV420P,
          width: 320,
          height: 240,
          bit_rate: 500000,
          framerate_num: 30,
          framerate_den: 1,
        }
      });

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });

    it('should encode a black frame to VP8', async () => {
      const width = 320;
      const height = 240;

      const [, contextId, frameId, pktId] = await adapter.ff_init_encoder('libvpx', {
        codec: 'libvpx',
        ctx: {
          pix_fmt: adapter.AV_PIX_FMT_YUV420P,
          width,
          height,
          bit_rate: 500000,
          framerate_num: 30,
          framerate_den: 1,
        }
      });

      // Create YUV420P frame (black = Y=0, U=128, V=128)
      const ySize = width * height;
      const uvSize = (width / 2) * (height / 2);
      
      const yPlane = new Uint8Array(ySize).fill(0);   // Y = 0 (black)
      const uPlane = new Uint8Array(uvSize).fill(128); // U = 128 (neutral)
      const vPlane = new Uint8Array(uvSize).fill(128); // V = 128 (neutral)

      // Combine planes
      const frameData = new Uint8Array(ySize + uvSize * 2);
      frameData.set(yPlane, 0);
      frameData.set(uPlane, ySize);
      frameData.set(vPlane, ySize + uvSize);

      // Encode frame
      const packets = await adapter.ff_encode_multi(contextId, frameId, pktId, [{
        data: [yPlane, uPlane, vPlane],
        format: adapter.AV_PIX_FMT_YUV420P,
        width,
        height,
        pts: 0,
        ptshi: 0,
        key_frame: 1,
        pict_type: 1,
      }]);

      // Encode a few more frames
      for (let i = 1; i < 5; i++) {
        await adapter.ff_encode_multi(contextId, frameId, pktId, [{
          data: [yPlane, uPlane, vPlane],
          format: adapter.AV_PIX_FMT_YUV420P,
          width,
          height,
          pts: i * 3000, // 30fps = ~3000 time units per frame
          ptshi: 0,
          key_frame: 0,
          pict_type: 0,
        }]);
      }

      // Flush encoder
      const flushPackets = await adapter.ff_encode_multi(contextId, frameId, pktId, [], true);
      
      // Should have encoded packets
      const totalPackets = packets.length + flushPackets.length;
      expect(totalPackets).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });
  });

  describe('VP9 encoding', () => {
    it('should find libvpx-vp9 encoder', async () => {
      const found = await adapter.avcodec_find_encoder_by_name('libvpx-vp9');
      expect(found).toBeGreaterThan(0);
    });

    it('should initialize VP9 encoder', async () => {
      const [codec, contextId, frameId, pktId] = await adapter.ff_init_encoder('libvpx-vp9', {
        codec: 'libvpx-vp9',
        ctx: {
          pix_fmt: adapter.AV_PIX_FMT_YUV420P,
          width: 320,
          height: 240,
          bit_rate: 500000,
          framerate_num: 30,
          framerate_den: 1,
        }
      });

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_encoder(contextId, frameId, pktId);
    });
  });
});

describe('Video Decoding', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  describe('VP8 decoding', () => {
    it('should find libvpx decoder', async () => {
      const found = await adapter.avcodec_find_decoder_by_name('libvpx');
      expect(found).toBeGreaterThan(0);
    });

    it('should initialize VP8 decoder', async () => {
      const [codec, contextId, pktId, frameId] = await adapter.ff_init_decoder('libvpx');

      expect(codec).toBe(1);
      expect(contextId).toBeGreaterThan(0);

      // Cleanup
      await adapter.ff_free_decoder(contextId, pktId, frameId);
    });
  });

  describe('VP8 round-trip', () => {
    it('should encode and decode VP8 video', async () => {
      const width = 320;
      const height = 240;

      // Initialize encoder
      const [, encCtxId, encFrameId, encPktId] = await adapter.ff_init_encoder('libvpx', {
        codec: 'libvpx',
        ctx: {
          pix_fmt: adapter.AV_PIX_FMT_YUV420P,
          width,
          height,
          bit_rate: 500000,
          framerate_num: 30,
          framerate_den: 1,
        }
      });

      // Create YUV420P frames
      const ySize = width * height;
      const uvSize = (width / 2) * (height / 2);
      
      const allPackets: Uint8Array[] = [];

      // Encode several frames
      for (let f = 0; f < 5; f++) {
        // Create gradient pattern for Y (varies per frame)
        const yPlane = new Uint8Array(ySize);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            yPlane[y * width + x] = ((x + y + f * 10) % 256);
          }
        }
        const uPlane = new Uint8Array(uvSize).fill(128);
        const vPlane = new Uint8Array(uvSize).fill(128);

        const packets = await adapter.ff_encode_multi(encCtxId, encFrameId, encPktId, [{
          data: [yPlane, uPlane, vPlane],
          format: adapter.AV_PIX_FMT_YUV420P,
          width,
          height,
          pts: f * 3000,
          ptshi: 0,
          key_frame: f === 0 ? 1 : 0,
          pict_type: f === 0 ? 1 : 0,
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
      const [, decCtxId, decPktId, decFrameId] = await adapter.ff_init_decoder('libvpx');

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
        expect(frame.width).toBe(width);
        expect(frame.height).toBe(height);
        expect(frame.format).toBe(adapter.AV_PIX_FMT_YUV420P);
      }

      // Cleanup decoder
      await adapter.ff_free_decoder(decCtxId, decPktId, decFrameId);
    });
  });
});
