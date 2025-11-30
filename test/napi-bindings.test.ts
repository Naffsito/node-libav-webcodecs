/**
 * Tests for the libavjs NAPI bindings
 */

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require_ = createRequire(import.meta.url);

// Load the native module directly
const nativePath = path.join(__dirname, '..', 'native', 'zig-out', 'lib', 'libavjs.node');
const native = require_(nativePath);

// Load the high-level wrapper
const libavjs = await import(path.join(__dirname, '..', 'native', 'src', 'libavjs.js'));

describe('NAPI native bindings', () => {
  describe('Constants', () => {
    it('should export sample format constants', () => {
      expect(native.AV_SAMPLE_FMT_U8).toBe(0);
      expect(native.AV_SAMPLE_FMT_S16).toBe(1);
      expect(native.AV_SAMPLE_FMT_S32).toBe(2);
      expect(native.AV_SAMPLE_FMT_FLT).toBe(3);
      expect(native.AV_SAMPLE_FMT_U8P).toBe(5);
      expect(native.AV_SAMPLE_FMT_S16P).toBe(6);
      expect(native.AV_SAMPLE_FMT_S32P).toBe(7);
      expect(native.AV_SAMPLE_FMT_FLTP).toBe(8);
    });

    it('should export pixel format constants', () => {
      expect(native.AV_PIX_FMT_YUV420P).toBe(0);
      expect(typeof native.AV_PIX_FMT_RGBA).toBe('number');
      expect(typeof native.AV_PIX_FMT_BGRA).toBe('number');
    });

    it('should export media type constants', () => {
      expect(native.AVMEDIA_TYPE_AUDIO).toBe(1);
      expect(native.AVMEDIA_TYPE_VIDEO).toBe(0);
    });
  });

  describe('Codec functions', () => {
    it('should find libopus encoder by name', () => {
      const codec = native.avcodec_find_encoder_by_name('libopus\0');
      expect(codec).toBeGreaterThan(0);
    });

    it('should find libopus decoder by name', () => {
      const codec = native.avcodec_find_decoder_by_name('libopus\0');
      expect(codec).toBeGreaterThan(0);
    });

    it('should find libvpx-vp8 encoder by name', () => {
      const codec = native.avcodec_find_encoder_by_name('libvpx\0');
      expect(codec).toBeGreaterThan(0);
    });

    it('should find flac encoder by name', () => {
      const codec = native.avcodec_find_encoder_by_name('flac\0');
      expect(codec).toBeGreaterThan(0);
    });

    it('should return 0 for non-existent codec', () => {
      const codec = native.avcodec_find_encoder_by_name('nonexistent\0');
      expect(Number(codec)).toBe(0);
    });

    it('should allocate and free codec context', () => {
      const codec = native.avcodec_find_encoder_by_name('libopus\0');
      expect(codec).toBeGreaterThan(0);

      const ctx = native.avcodec_alloc_context3(codec);
      expect(ctx).toBeGreaterThan(0);

      // Set some properties
      native.AVCodecContext_sample_rate_s(ctx, 48000);
      expect(native.AVCodecContext_sample_rate(ctx)).toBe(48000);

      native.AVCodecContext_channels_s(ctx, 2);
      expect(native.AVCodecContext_channels(ctx)).toBe(2);

      native.AVCodecContext_sample_fmt_s(ctx, native.AV_SAMPLE_FMT_FLT);
      expect(native.AVCodecContext_sample_fmt(ctx)).toBe(native.AV_SAMPLE_FMT_FLT);

      // Free
      native.avcodec_free_context_js(ctx);
    });
  });

  describe('AVFrame functions', () => {
    it('should allocate and free frame', () => {
      const frame = native.av_frame_alloc();
      expect(frame).toBeGreaterThan(0);

      // Set properties
      native.AVFrame_format_s(frame, native.AV_SAMPLE_FMT_FLTP);
      expect(native.AVFrame_format(frame)).toBe(native.AV_SAMPLE_FMT_FLTP);

      native.AVFrame_nb_samples_s(frame, 1024);
      expect(native.AVFrame_nb_samples(frame)).toBe(1024);

      native.AVFrame_sample_rate_s(frame, 48000);
      expect(native.AVFrame_sample_rate(frame)).toBe(48000);

      native.AVFrame_channels_s(frame, 2);
      expect(native.AVFrame_channels(frame)).toBe(2);

      // Free
      native.av_frame_free_js(frame);
    });

    it('should allocate video frame buffer', () => {
      const frame = native.av_frame_alloc();
      expect(Number(frame)).toBeGreaterThan(0);

      native.AVFrame_format_s(frame, native.AV_PIX_FMT_YUV420P);
      native.AVFrame_width_s(frame, 320);
      native.AVFrame_height_s(frame, 240);

      const ret = native.av_frame_get_buffer(frame, 0);
      expect(ret).toBe(0);

      // Check linesize
      const linesize0 = native.AVFrame_linesize_a(frame, BigInt(0));
      expect(linesize0).toBeGreaterThanOrEqual(320);

      native.av_frame_free_js(frame);
    });
  });

  describe('AVPacket functions', () => {
    it('should allocate and free packet', () => {
      const pkt = native.av_packet_alloc();
      expect(pkt).toBeGreaterThan(0);

      // Set properties
      native.AVPacket_pts_s(pkt, BigInt(1000));
      expect(native.AVPacket_pts(pkt)).toBe(BigInt(1000));

      native.AVPacket_dts_s(pkt, BigInt(900));
      expect(native.AVPacket_dts(pkt)).toBe(BigInt(900));

      native.AVPacket_duration_s(pkt, BigInt(100));
      expect(native.AVPacket_duration(pkt)).toBe(BigInt(100));

      native.AVPacket_flags_s(pkt, 1);
      expect(native.AVPacket_flags(pkt)).toBe(1);

      // Free
      native.av_packet_free_js(pkt);
    });
  });

  describe('Memory copy functions', () => {
    it('should copy u8 data out and back', () => {
      // Allocate a buffer
      const size = 256;
      const ptr = native.av_malloc(BigInt(size));
      expect(Number(ptr)).toBeGreaterThan(0);

      // Copy some data in
      const inputData = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        inputData[i] = i % 256;
      }
      native.copyin_u8(ptr, inputData);

      // Copy it out
      const outputData = native.copyout_u8(ptr, BigInt(size));
      expect(outputData).toBeInstanceOf(Uint8Array);
      expect(outputData.length).toBe(size);
      
      for (let i = 0; i < size; i++) {
        expect(outputData[i]).toBe(i % 256);
      }

      native.av_free(ptr);
    });

    it('should copy s16 data out and back', () => {
      const count = 128;
      const ptr = native.av_malloc(BigInt(count * 2));
      expect(Number(ptr)).toBeGreaterThan(0);

      const inputData = new Int16Array(count);
      for (let i = 0; i < count; i++) {
        inputData[i] = i * 100 - 6400;
      }
      native.copyin_s16(ptr, inputData);

      const outputData = native.copyout_s16(ptr, BigInt(count));
      expect(outputData).toBeInstanceOf(Int16Array);
      expect(outputData.length).toBe(count);
      
      for (let i = 0; i < count; i++) {
        expect(outputData[i]).toBe(inputData[i]);
      }

      native.av_free(ptr);
    });

    it('should copy f32 data out and back', () => {
      const count = 128;
      const ptr = native.av_malloc(BigInt(count * 4));
      expect(Number(ptr)).toBeGreaterThan(0);

      const inputData = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        inputData[i] = Math.sin(i * 0.1);
      }
      native.copyin_f32(ptr, inputData);

      const outputData = native.copyout_f32(ptr, BigInt(count));
      expect(outputData).toBeInstanceOf(Float32Array);
      expect(outputData.length).toBe(count);
      
      for (let i = 0; i < count; i++) {
        expect(Math.abs(outputData[i] - inputData[i])).toBeLessThan(0.0001);
      }

      native.av_free(ptr);
    });
  });

  describe('Pixel format descriptors', () => {
    it('should get pixel format descriptor', () => {
      const desc = native.av_pix_fmt_desc_get(native.AV_PIX_FMT_YUV420P);
      expect(desc).toBeGreaterThan(0);

      const nbComponents = native.AVPixFmtDescriptor_nb_components(desc);
      expect(nbComponents).toBe(3);

      const log2ChromaH = native.AVPixFmtDescriptor_log2_chroma_h(desc);
      expect(log2ChromaH).toBe(1); // YUV420P has 2x vertical chroma subsampling
    });
  });
});

describe('libavjs high-level API', () => {
  describe('Encoder initialization', () => {
    it('should initialize and free opus encoder', () => {
      const [codec, ctx, frame, pkt, frameSize] = libavjs.ff_init_encoder('libopus', {
        ctx: {
          sample_fmt: libavjs.AV_SAMPLE_FMT_FLT,
          sample_rate: 48000,
          channels: 2,
        },
        time_base: [1, 48000]
      });

      expect(codec).toBeGreaterThan(0);
      expect(ctx).toBeGreaterThan(0);
      expect(frame).toBeGreaterThan(0);
      expect(pkt).toBeGreaterThan(0);
      expect(frameSize).toBeGreaterThan(0);

      libavjs.ff_free_encoder(ctx, frame, pkt);
    });

    it('should initialize and free flac encoder', () => {
      const [codec, ctx, frame, pkt, frameSize] = libavjs.ff_init_encoder('flac', {
        ctx: {
          sample_fmt: libavjs.AV_SAMPLE_FMT_S16,
          sample_rate: 44100,
          channels: 2,
        },
        time_base: [1, 44100]
      });

      expect(codec).toBeGreaterThan(0);
      expect(ctx).toBeGreaterThan(0);
      expect(frame).toBeGreaterThan(0);
      expect(pkt).toBeGreaterThan(0);

      libavjs.ff_free_encoder(ctx, frame, pkt);
    });

    it('should throw for non-existent encoder', () => {
      expect(() => {
        libavjs.ff_init_encoder('nonexistent', {});
      }).toThrow('Codec not found');
    });
  });

  describe('Audio encoding', () => {
    it('should encode audio frames with opus', () => {
      const [codec, ctx, frame, pkt, frameSize] = libavjs.ff_init_encoder('libopus', {
        ctx: {
          sample_fmt: libavjs.AV_SAMPLE_FMT_FLT,
          sample_rate: 48000,
          channels: 2,
        },
        time_base: [1, 48000]
      });

      expect(frameSize).toBeGreaterThan(0);

      // Create some test audio data
      const numFrames = 3;
      const frames: any[] = [];
      for (let f = 0; f < numFrames; f++) {
        const data: Float32Array[] = [];
        for (let ch = 0; ch < 2; ch++) {
          const channelData = new Float32Array(frameSize);
          for (let i = 0; i < frameSize; i++) {
            channelData[i] = Math.sin((f * frameSize + i) * 0.01) * 0.5;
          }
          data.push(channelData);
        }
        frames.push({
          data,
          format: libavjs.AV_SAMPLE_FMT_FLTP,
          channels: 2,
          channel_layout: 3,
          sample_rate: 48000,
          nb_samples: frameSize,
          pts: f * frameSize,
          ptshi: 0
        });
      }

      // Encode
      const packets = libavjs.ff_encode_multi(ctx, frame, pkt, frames, { fin: true });
      
      expect(packets.length).toBeGreaterThan(0);
      for (const packet of packets) {
        expect(packet.data).toBeInstanceOf(Uint8Array);
        expect(packet.data.length).toBeGreaterThan(0);
      }

      libavjs.ff_free_encoder(ctx, frame, pkt);
    });

    it('should encode audio frames with flac', () => {
      const [codec, ctx, frame, pkt, frameSize] = libavjs.ff_init_encoder('flac', {
        ctx: {
          sample_fmt: libavjs.AV_SAMPLE_FMT_S16,
          sample_rate: 44100,
          channels: 2,
        },
        time_base: [1, 44100]
      });

      // Create test data
      const numSamples = 4096;
      const data = new Int16Array(numSamples * 2);
      for (let i = 0; i < numSamples * 2; i++) {
        data[i] = Math.floor(Math.sin(i * 0.01) * 16000);
      }

      const inputFrame = {
        data,
        format: libavjs.AV_SAMPLE_FMT_S16,
        channels: 2,
        channel_layout: 3,
        sample_rate: 44100,
        nb_samples: numSamples,
        pts: 0,
        ptshi: 0
      };

      const packets = libavjs.ff_encode_multi(ctx, frame, pkt, [inputFrame], { fin: true });
      
      expect(packets.length).toBeGreaterThan(0);
      for (const packet of packets) {
        expect(packet.data).toBeInstanceOf(Uint8Array);
        expect(packet.data.length).toBeGreaterThan(0);
      }

      libavjs.ff_free_encoder(ctx, frame, pkt);
    });
  });

  describe('Decoder initialization', () => {
    it('should initialize and free opus decoder', () => {
      const [codec, ctx, pkt, frame] = libavjs.ff_init_decoder('libopus', {
        time_base: [1, 48000]
      });

      expect(codec).toBeGreaterThan(0);
      expect(ctx).toBeGreaterThan(0);
      expect(pkt).toBeGreaterThan(0);
      expect(frame).toBeGreaterThan(0);

      libavjs.ff_free_decoder(ctx, pkt, frame);
    });

    it('should initialize and free flac decoder', () => {
      const [codec, ctx, pkt, frame] = libavjs.ff_init_decoder('flac', {
        time_base: [1, 44100]
      });

      expect(codec).toBeGreaterThan(0);
      expect(ctx).toBeGreaterThan(0);

      libavjs.ff_free_decoder(ctx, pkt, frame);
    });
  });

  describe('Encode/Decode round trip', () => {
    it('should encode and decode with flac', () => {
      // Encode
      const [encCodec, encCtx, encFrame, encPkt, frameSize] = libavjs.ff_init_encoder('flac', {
        ctx: {
          sample_fmt: libavjs.AV_SAMPLE_FMT_S16,
          sample_rate: 44100,
          channels: 2,
        },
        time_base: [1, 44100]
      });

      const numSamples = 4096;
      const originalData = new Int16Array(numSamples * 2);
      for (let i = 0; i < numSamples * 2; i++) {
        originalData[i] = Math.floor(Math.sin(i * 0.01) * 16000);
      }

      const inputFrame = {
        data: originalData,
        format: libavjs.AV_SAMPLE_FMT_S16,
        channels: 2,
        channel_layout: 3,
        sample_rate: 44100,
        nb_samples: numSamples,
        pts: 0,
        ptshi: 0
      };

      const packets = libavjs.ff_encode_multi(encCtx, encFrame, encPkt, [inputFrame], { fin: true });
      expect(packets.length).toBeGreaterThan(0);

      libavjs.ff_free_encoder(encCtx, encFrame, encPkt);

      // Decode
      const [decCodec, decCtx, decPkt, decFrame] = libavjs.ff_init_decoder('flac', {
        time_base: [1, 44100]
      });

      const decodedFrames = libavjs.ff_decode_multi(decCtx, decPkt, decFrame, packets, { fin: true });
      expect(decodedFrames.length).toBeGreaterThan(0);

      // Check decoded data
      let totalSamples = 0;
      for (const frame of decodedFrames) {
        expect(frame.format).toBe(libavjs.AV_SAMPLE_FMT_S16);
        expect(frame.channels).toBe(2);
        expect(frame.sample_rate).toBe(44100);
        totalSamples += frame.nb_samples;
      }

      // Should have decoded approximately the same number of samples
      expect(totalSamples).toBeGreaterThanOrEqual(numSamples - 1024);

      libavjs.ff_free_decoder(decCtx, decPkt, decFrame);
    });
  });
});
