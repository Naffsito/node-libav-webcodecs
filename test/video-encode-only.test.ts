import { describe, it, expect, beforeAll } from 'vitest';
import { NodeAVAdapter, createNodeAVAdapter } from '../src/node-av-adapter';

describe('Video Encoding Only', () => {
  let adapter: NodeAVAdapter;

  beforeAll(() => {
    adapter = createNodeAVAdapter();
  });

  it('should find libvpx encoder', async () => {
    const found = await adapter.avcodec_find_encoder_by_name('libvpx');
    expect(found).toBeGreaterThan(0);
  });

  it('should encode a frame to VP8', async () => {
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

    const ySize = width * height;
    const uvSize = (width / 2) * (height / 2);
    
    const yPlane = new Uint8Array(ySize).fill(0);
    const uPlane = new Uint8Array(uvSize).fill(128);
    const vPlane = new Uint8Array(uvSize).fill(128);

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
    
    expect(packets.length).toBeGreaterThan(0);

    // Cleanup
    await adapter.ff_free_encoder(contextId, frameId, pktId);
  });
});
