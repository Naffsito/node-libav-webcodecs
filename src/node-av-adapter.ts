/*
 * Node-AV Adapter
 * Provides a libav.js-compatible interface using native NAPI bindings.
 * This allows the WebCodecs polyfill to work in Node.js environments.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Load the native module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require_ = createRequire(import.meta.url);

// Try to load the native module from various locations
let native: any;
try {
  native = require_(path.join(__dirname, '..', 'native', 'zig-out', 'lib', 'libavjs.node'));
} catch (e) {
  try {
    native = require_(path.join(__dirname, '..', 'native', 'zig-out', 'lib', 'libavjs.node'));
  } catch (e2) {
    throw new Error('Failed to load native libavjs module. Make sure to build it first with: cd native && zig build');
  }
}

/**
 * Frame data structure compatible with libav.js
 */
export interface LibAVFrame {
  data: Uint8Array | Uint8Array[] | Int16Array | Int16Array[] | Float32Array | Float32Array[];
  layout?: { offset: number; stride: number }[];
  format?: number;
  width?: number;
  height?: number;
  channels?: number;
  channel_layout?: number;
  sample_rate?: number;
  nb_samples?: number;
  pts?: number;
  ptshi?: number;
  time_base_num?: number;
  time_base_den?: number;
  crop?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  sample_aspect_ratio?: [number, number];
  key_frame?: number;
  pict_type?: number;
}

/**
 * Packet data structure compatible with libav.js
 */
export interface LibAVPacket {
  data: Uint8Array;
  pts?: number;
  ptshi?: number;
  dts?: number;
  dtshi?: number;
  duration?: number;
  durationhi?: number;
  flags?: number;
  stream_index?: number;
  time_base_num?: number;
  time_base_den?: number;
}

/**
 * Codec context properties compatible with libav.js
 */
export interface AVCodecContextProps {
  pix_fmt?: number;
  sample_fmt?: number;
  width?: number;
  height?: number;
  sample_rate?: number;
  channels?: number;
  channel_layout?: number;
  bit_rate?: number;
  framerate_num?: number;
  framerate_den?: number;
  frame_size?: number;
  sample_aspect_ratio_num?: number;
  sample_aspect_ratio_den?: number;
  profile?: number;
  level?: number;
}

/**
 * LibAV.js-compatible codec configuration
 */
export interface LibAVJSCodec {
  codec: string;
  ctx?: AVCodecContextProps;
  options?: Record<string, string>;
}

// Constants from native module
const AVERROR_EOF = native.AVERROR_EOF;
// Note: native.AVERROR_EAGAIN is already negative (-35 on macOS)
// But the libav.js API expects EAGAIN to be positive and users negate it
const AVERROR_EAGAIN = native.AVERROR_EAGAIN;
const EAGAIN_POSITIVE = Math.abs(native.AVERROR_EAGAIN);

// Sample formats
const AV_SAMPLE_FMT_U8 = native.AV_SAMPLE_FMT_U8;
const AV_SAMPLE_FMT_S16 = native.AV_SAMPLE_FMT_S16;
const AV_SAMPLE_FMT_S32 = native.AV_SAMPLE_FMT_S32;
const AV_SAMPLE_FMT_FLT = native.AV_SAMPLE_FMT_FLT;
const AV_SAMPLE_FMT_U8P = native.AV_SAMPLE_FMT_U8P;
const AV_SAMPLE_FMT_S16P = native.AV_SAMPLE_FMT_S16P;
const AV_SAMPLE_FMT_S32P = native.AV_SAMPLE_FMT_S32P;
const AV_SAMPLE_FMT_FLTP = native.AV_SAMPLE_FMT_FLTP;

// Pixel formats
const AV_PIX_FMT_YUV420P = native.AV_PIX_FMT_YUV420P;
const AV_PIX_FMT_YUV422P = native.AV_PIX_FMT_YUV422P;
const AV_PIX_FMT_YUV444P = native.AV_PIX_FMT_YUV444P;
const AV_PIX_FMT_RGBA = native.AV_PIX_FMT_RGBA;
const AV_PIX_FMT_BGRA = native.AV_PIX_FMT_BGRA;
const AV_PIX_FMT_NV12 = native.AV_PIX_FMT_NV12;

/**
 * NodeAVAdapter - Provides libav.js-compatible interface using native NAPI bindings
 */
export class NodeAVAdapter {
  // Sample format constants (matching libav.js)
  readonly AV_SAMPLE_FMT_U8 = AV_SAMPLE_FMT_U8;
  readonly AV_SAMPLE_FMT_S16 = AV_SAMPLE_FMT_S16;
  readonly AV_SAMPLE_FMT_S32 = AV_SAMPLE_FMT_S32;
  readonly AV_SAMPLE_FMT_FLT = AV_SAMPLE_FMT_FLT;
  readonly AV_SAMPLE_FMT_U8P = AV_SAMPLE_FMT_U8P;
  readonly AV_SAMPLE_FMT_S16P = AV_SAMPLE_FMT_S16P;
  readonly AV_SAMPLE_FMT_S32P = AV_SAMPLE_FMT_S32P;
  readonly AV_SAMPLE_FMT_FLTP = AV_SAMPLE_FMT_FLTP;

  // Pixel format constants
  readonly AV_PIX_FMT_YUV420P = AV_PIX_FMT_YUV420P;
  readonly AV_PIX_FMT_YUV422P = AV_PIX_FMT_YUV422P;
  readonly AV_PIX_FMT_YUV444P = AV_PIX_FMT_YUV444P;
  readonly AV_PIX_FMT_RGBA = AV_PIX_FMT_RGBA;
  readonly AV_PIX_FMT_BGRA = AV_PIX_FMT_BGRA;
  readonly AV_PIX_FMT_NV12 = AV_PIX_FMT_NV12;

  // Error codes
  readonly EAGAIN = EAGAIN_POSITIVE;  // Positive value; user negates it for comparison

  // Internal storage for codec contexts
  private contexts: Map<number, {
    codec: bigint;
    ctx: bigint;
    frame: bigint;
    pkt: bigint;
    frameSize: number;
    isEncoder: boolean;
  }> = new Map();
  private nextContextId = 1;

  // Frame and packet storage (for standalone frame/packet allocation)
  private frames: Map<number, bigint> = new Map();
  private packets: Map<number, bigint> = new Map();

  // Software scaler contexts
  private swsContexts: Map<number, bigint> = new Map();
  private nextSwsId = 1;

  /**
   * Convert a 64-bit float to two 32-bit integers (low, high)
   */
  f64toi64(val: number): [number, number] {
    const low = val >>> 0;
    const high = Math.floor(val / 0x100000000) >>> 0;
    return [low, high];
  }

  /**
   * Convert two 32-bit integers to a 64-bit float
   */
  i64tof64(low: number, high: number): number {
    return low + high * 0x100000000;
  }

  /**
   * Find an encoder by name
   */
  async avcodec_find_encoder_by_name(name: string): Promise<number> {
    const codec = native.avcodec_find_encoder_by_name(name + '\0');
    return codec === 0n ? 0 : 1;
  }

  /**
   * Find a decoder by name
   */
  async avcodec_find_decoder_by_name(name: string): Promise<number> {
    const codec = native.avcodec_find_decoder_by_name(name + '\0');
    return codec === 0n ? 0 : 1;
  }

  /**
   * Initialize a decoder - returns [codec, context_id, packet_id, frame_id]
   */
  async ff_init_decoder(
    codecName: string,
    codecpara?: any
  ): Promise<[number, number, number, number]> {
    const codec = native.avcodec_find_decoder_by_name(codecName + '\0');
    if (codec === 0n) {
      throw new Error(`Decoder not found: ${codecName}`);
    }

    const ctx = native.avcodec_alloc_context3(codec);
    if (ctx === 0n) {
      throw new Error('Could not allocate codec context');
    }

    // Apply codec parameters if provided
    if (codecpara) {
      if (codecpara.channels !== undefined) {
        native.AVCodecContext_channels_s(ctx, codecpara.channels);
      }
      if (codecpara.sample_rate !== undefined) {
        native.AVCodecContext_sample_rate_s(ctx, codecpara.sample_rate);
      }
      if (codecpara.sample_fmt !== undefined) {
        native.AVCodecContext_sample_fmt_s(ctx, codecpara.sample_fmt);
      }
    }

    // Open the codec
    const ret = native.avcodec_open2(ctx, codec);
    if (ret < 0) {
      native.avcodec_free_context_js(ctx);
      throw new Error(`Could not open codec: ${native.ff_error(ret)}`);
    }

    const frame = native.av_frame_alloc();
    if (frame === 0n) {
      native.avcodec_free_context_js(ctx);
      throw new Error('Could not allocate frame');
    }

    const pkt = native.av_packet_alloc();
    if (pkt === 0n) {
      native.av_frame_free_js(frame);
      native.avcodec_free_context_js(ctx);
      throw new Error('Could not allocate packet');
    }

    const contextId = this.nextContextId++;
    this.contexts.set(contextId, { codec, ctx, frame, pkt, frameSize: 0, isEncoder: false });

    return [1, contextId, contextId, contextId];
  }

  /**
   * Initialize an encoder - returns [codec, context_id, frame_id, packet_id, frame_size]
   */
  async ff_init_encoder(
    codecName: string,
    config?: LibAVJSCodec
  ): Promise<[number, number, number, number, number]> {
    const codec = native.avcodec_find_encoder_by_name(codecName + '\0');
    if (codec === 0n) {
      throw new Error(`Encoder not found: ${codecName}`);
    }

    const ctx = native.avcodec_alloc_context3(codec);
    if (ctx === 0n) {
      throw new Error('Could not allocate codec context');
    }

    // Track if this is a video encoder (has width/height set)
    let isVideoEncoder = false;
    let hasFramerate = false;

    // Apply context properties
    if (config?.ctx) {
      const ctxProps = config.ctx;
      if (ctxProps.sample_fmt !== undefined) native.AVCodecContext_sample_fmt_s(ctx, ctxProps.sample_fmt);
      if (ctxProps.sample_rate !== undefined) native.AVCodecContext_sample_rate_s(ctx, ctxProps.sample_rate);
      if (ctxProps.channels !== undefined) native.AVCodecContext_channels_s(ctx, ctxProps.channels);
      if (ctxProps.channel_layout !== undefined) native.AVCodecContext_channel_layout_s(ctx, BigInt(ctxProps.channel_layout));
      if (ctxProps.bit_rate !== undefined) native.AVCodecContext_bit_rate_s(ctx, BigInt(ctxProps.bit_rate));
      if (ctxProps.pix_fmt !== undefined) native.AVCodecContext_pix_fmt_s(ctx, ctxProps.pix_fmt);
      if (ctxProps.width !== undefined) {
        native.AVCodecContext_width_s(ctx, ctxProps.width);
        isVideoEncoder = true;
      }
      if (ctxProps.height !== undefined) {
        native.AVCodecContext_height_s(ctx, ctxProps.height);
        isVideoEncoder = true;
      }
      if (ctxProps.framerate_num !== undefined && ctxProps.framerate_den !== undefined) {
        native.AVCodecContext_framerate_s(ctx, ctxProps.framerate_num, ctxProps.framerate_den);
        // Set time_base as inverse of framerate for video encoders
        native.AVCodecContext_time_base_s(ctx, ctxProps.framerate_den, ctxProps.framerate_num);
        hasFramerate = true;
      }
    }

    // For video encoders, ensure framerate and time_base are set
    // libvpx and other video encoders require this
    if (isVideoEncoder && !hasFramerate) {
      // Default to 30fps if no framerate specified
      native.AVCodecContext_framerate_s(ctx, 30, 1);
      native.AVCodecContext_time_base_s(ctx, 1, 30);
    }

    // Set default time_base if not already set (for audio encoders)
    const tbDen = native.AVCodecContext_time_base_den(ctx);
    if (tbDen === 0) {
      native.AVCodecContext_time_base_s(ctx, 1, 1000);
    }

    // Open codec
    const ret = native.avcodec_open2(ctx, codec);
    if (ret < 0) {
      native.avcodec_free_context_js(ctx);
      throw new Error(`Could not open codec: ${native.ff_error(ret)}`);
    }

    const frame = native.av_frame_alloc();
    if (frame === 0n) {
      native.avcodec_free_context_js(ctx);
      throw new Error('Could not allocate frame');
    }

    const pkt = native.av_packet_alloc();
    if (pkt === 0n) {
      native.av_frame_free_js(frame);
      native.avcodec_free_context_js(ctx);
      throw new Error('Could not allocate packet');
    }

    const frameSize = native.AVCodecContext_frame_size(ctx) || 1024;
    const contextId = this.nextContextId++;
    this.contexts.set(contextId, { codec, ctx, frame, pkt, frameSize, isEncoder: true });

    return [1, contextId, contextId, contextId, frameSize];
  }

  /**
   * Free a decoder
   */
  async ff_free_decoder(contextId: number, _pktId: number, _frameId: number): Promise<void> {
    const context = this.contexts.get(contextId);
    if (context) {
      native.av_frame_free_js(context.frame);
      native.av_packet_free_js(context.pkt);
      native.avcodec_free_context_js(context.ctx);
      this.contexts.delete(contextId);
    }
  }

  /**
   * Free an encoder
   */
  async ff_free_encoder(contextId: number, _frameId: number, _pktId: number): Promise<void> {
    await this.ff_free_decoder(contextId, _pktId, _frameId);
  }

  /**
   * Decode multiple packets - returns decoded frames
   */
  async ff_decode_multi(
    contextId: number,
    _pktId: number,
    _frameId: number,
    packets: LibAVPacket[],
    flush = false
  ): Promise<LibAVFrame[]> {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const { ctx, frame, pkt } = context;
    const decodedFrames: LibAVFrame[] = [];
    const tbNum = native.AVCodecContext_time_base_num(ctx);
    const tbDen = native.AVCodecContext_time_base_den(ctx);

    // Send packets to decoder
    for (const packet of packets) {
      // Set up packet
      native.av_packet_unref(pkt);
      if (packet.data && packet.data.length > 0) {
        const ret = native.av_new_packet(pkt, packet.data.length);
        if (ret < 0) {
          throw new Error(`Failed to allocate packet buffer: ${native.ff_error(ret)}`);
        }
        const dataPtr = native.AVPacket_data(pkt);
        native.copyin_u8(dataPtr, packet.data);
      }

      if (packet.pts !== undefined) {
        const pts = this.i64tof64(packet.pts, packet.ptshi || 0);
        native.AVPacket_pts_s(pkt, BigInt(pts));
      }
      if (packet.dts !== undefined) {
        const dts = this.i64tof64(packet.dts, packet.dtshi || 0);
        native.AVPacket_dts_s(pkt, BigInt(dts));
      }

      const sendRet = native.avcodec_send_packet(ctx, pkt);
      if (sendRet < 0 && sendRet !== AVERROR_EOF && sendRet !== AVERROR_EAGAIN) {
        throw new Error(`Error sending packet: ${native.ff_error(sendRet)}`);
      }
      native.av_packet_unref(pkt);

      // Receive all available frames
      while (true) {
        const recvRet = native.avcodec_receive_frame(ctx, frame);
        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }
        if (recvRet < 0) {
          throw new Error(`Error receiving frame: ${native.ff_error(recvRet)}`);
        }

        const outFrame = this.copyoutFrame(frame, tbNum, tbDen);
        decodedFrames.push(outFrame);
        native.av_frame_unref(frame);
      }
    }

    // Flush decoder if requested
    if (flush) {
      const flushRet = native.avcodec_send_packet(ctx, 0n);
      if (flushRet >= 0 || flushRet === AVERROR_EOF) {
        while (true) {
          const recvRet = native.avcodec_receive_frame(ctx, frame);
          if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
            break;
          }
          if (recvRet < 0) {
            throw new Error(`Error receiving frame: ${native.ff_error(recvRet)}`);
          }

          const outFrame = this.copyoutFrame(frame, tbNum, tbDen);
          decodedFrames.push(outFrame);
          native.av_frame_unref(frame);
        }
      }
    }

    return decodedFrames;
  }

  /**
   * Encode multiple frames - returns encoded packets
   */
  async ff_encode_multi(
    contextId: number,
    _frameId: number,
    _pktId: number,
    frames: LibAVFrame[],
    flush = false
  ): Promise<LibAVPacket[]> {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const { ctx, frame, pkt } = context;
    const encodedPackets: LibAVPacket[] = [];
    const tbNum = native.AVCodecContext_time_base_num(ctx);
    const tbDen = native.AVCodecContext_time_base_den(ctx);

    // Send frames to encoder
    for (const inFrame of frames) {
      this.copyinFrame(frame, inFrame, ctx);

      const sendRet = native.avcodec_send_frame(ctx, frame);
      if (sendRet < 0 && sendRet !== AVERROR_EOF && sendRet !== AVERROR_EAGAIN) {
        throw new Error(`Error sending frame: ${native.ff_error(sendRet)}`);
      }
      native.av_frame_unref(frame);

      // Receive all available packets
      while (true) {
        const recvRet = native.avcodec_receive_packet(ctx, pkt);
        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }
        if (recvRet < 0) {
          throw new Error(`Error receiving packet: ${native.ff_error(recvRet)}`);
        }

        const outPkt = this.copyoutPacket(pkt, tbNum, tbDen);
        if (outPkt.data.length > 0) {
          encodedPackets.push(outPkt);
        }
        native.av_packet_unref(pkt);
      }
    }

    // Flush encoder if requested
    if (flush) {
      const flushRet = native.avcodec_send_frame(ctx, 0n);
      if (flushRet >= 0 || flushRet === AVERROR_EOF) {
        while (true) {
          const recvRet = native.avcodec_receive_packet(ctx, pkt);
          if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
            break;
          }
          if (recvRet < 0) {
            throw new Error(`Error receiving packet: ${native.ff_error(recvRet)}`);
          }

          const outPkt = this.copyoutPacket(pkt, tbNum, tbDen);
          if (outPkt.data.length > 0) {
            encodedPackets.push(outPkt);
          }
          native.av_packet_unref(pkt);
        }
      }
    }

    return encodedPackets;
  }

  /**
   * Copy out a frame from native memory
   */
  private copyoutFrame(framePtr: bigint, tbNum: number, tbDen: number): LibAVFrame {
    const nb_samples = native.AVFrame_nb_samples(framePtr);
    
    if (nb_samples === 0) {
      // Video frame
      return this.copyoutVideoFrame(framePtr, tbNum, tbDen);
    }

    // Audio frame
    const channels = native.AVFrame_channels(framePtr);
    const format = native.AVFrame_format(framePtr);
    const pts = Number(native.AVFrame_pts(framePtr));

    const outFrame: LibAVFrame = {
      data: new Uint8Array(0),
      channel_layout: native.AVFrame_channel_layout(framePtr),
      channels: channels,
      format: format,
      nb_samples: nb_samples,
      pts: pts >>> 0,
      ptshi: Math.floor(pts / 0x100000000) >>> 0,
      time_base_num: tbNum,
      time_base_den: tbDen,
      sample_rate: native.AVFrame_sample_rate(framePtr)
    };

    // Copy data based on format
    if (format >= 5 /* U8P */) {
      // Planar format
      const data: Uint8Array[] = [];
      for (let ci = 0; ci < channels; ci++) {
        const inData = native.AVFrame_data_a(framePtr, BigInt(ci));
        let outData: Uint8Array;
        switch (format) {
          case 5: // U8P
            outData = native.copyout_u8(inData, BigInt(nb_samples));
            break;
          case 6: // S16P
            outData = new Uint8Array(native.copyout_s16(inData, BigInt(nb_samples)).buffer);
            break;
          case 7: // S32P
            outData = new Uint8Array(native.copyout_s32(inData, BigInt(nb_samples)).buffer);
            break;
          case 8: // FLTP
            outData = new Uint8Array(native.copyout_f32(inData, BigInt(nb_samples)).buffer);
            break;
          default:
            outData = new Uint8Array(0);
        }
        data.push(outData);
      }
      outFrame.data = data;
    } else {
      // Interleaved format
      const ct = channels * nb_samples;
      const inData = native.AVFrame_data_a(framePtr, BigInt(0));
      switch (format) {
        case 0: // U8
          outFrame.data = native.copyout_u8(inData, BigInt(ct));
          break;
        case 1: // S16
          outFrame.data = new Uint8Array(native.copyout_s16(inData, BigInt(ct)).buffer);
          break;
        case 2: // S32
          outFrame.data = new Uint8Array(native.copyout_s32(inData, BigInt(ct)).buffer);
          break;
        case 3: // FLT
          outFrame.data = new Uint8Array(native.copyout_f32(inData, BigInt(ct)).buffer);
          break;
        default:
          outFrame.data = new Uint8Array(0);
      }
    }

    return outFrame;
  }

  /**
   * Copy out a video frame from native memory
   */
  private copyoutVideoFrame(framePtr: bigint, tbNum: number, tbDen: number): LibAVFrame {
    const width = native.AVFrame_width(framePtr);
    const height = native.AVFrame_height(framePtr);
    const format = native.AVFrame_format(framePtr);
    const pts = Number(native.AVFrame_pts(framePtr));
    
    const desc = native.av_pix_fmt_desc_get(format);
    const log2ch = native.AVPixFmtDescriptor_log2_chroma_h(desc);
    
    const layout: { offset: number; stride: number }[] = [];

    // Copy each plane separately since they may not be contiguous
    const planeData: Uint8Array[] = [];
    let totalSize = 0;
    
    for (let p = 0; p < 8; p++) {
      const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
      if (!linesize) break;
      const plane = native.AVFrame_data_a(framePtr, BigInt(p));
      let h = height;
      if (p === 1 || p === 2) h >>= log2ch;
      const planeSize = linesize * h;
      const data = native.copyout_u8(plane, BigInt(planeSize));
      planeData.push(data);
      layout.push({
        offset: totalSize,
        stride: linesize
      });
      totalSize += planeSize;
    }

    // Combine all planes into single buffer
    const data = new Uint8Array(totalSize);
    let offset = 0;
    for (const plane of planeData) {
      data.set(plane, offset);
      offset += plane.length;
    }

    return {
      data,
      layout,
      width,
      height,
      format,
      key_frame: native.AVFrame_key_frame(framePtr),
      pict_type: native.AVFrame_pict_type(framePtr),
      pts: pts >>> 0,
      ptshi: Math.floor(pts / 0x100000000) >>> 0,
      time_base_num: tbNum,
      time_base_den: tbDen,
      sample_aspect_ratio: [
        native.AVFrame_sample_aspect_ratio_num(framePtr),
        native.AVFrame_sample_aspect_ratio_den(framePtr)
      ]
    };
  }

  /**
   * Copy a frame into native memory
   */
  private copyinFrame(framePtr: bigint, inFrame: LibAVFrame, ctx: bigint): void {
    native.av_frame_unref(framePtr);

    if (inFrame.width) {
      // Video frame
      this.copyinVideoFrame(framePtr, inFrame);
      return;
    }

    // Audio frame
    const format = inFrame.format ?? native.AVCodecContext_sample_fmt(ctx);
    let channels = inFrame.channels;
    if (!channels && inFrame.channel_layout) {
      channels = 0;
      let cl = inFrame.channel_layout;
      while (cl) {
        if (cl & 1) channels++;
        cl >>>= 1;
      }
    }
    const channelCount = channels || native.AVCodecContext_channels(ctx) || 2;

    // Set frame properties
    if (inFrame.channel_layout !== undefined) native.AVFrame_channel_layout_s(framePtr, BigInt(inFrame.channel_layout));
    if (channelCount) native.AVFrame_channels_s(framePtr, channelCount);
    native.AVFrame_format_s(framePtr, format);
    if (inFrame.pts !== undefined) {
      const pts = (inFrame.ptshi || 0) * 0x100000000 + (inFrame.pts || 0);
      native.AVFrame_pts_s(framePtr, BigInt(pts));
    }
    if (inFrame.sample_rate !== undefined) native.AVFrame_sample_rate_s(framePtr, inFrame.sample_rate);

    // Calculate nb_samples - prefer explicit value from inFrame if provided
    let nb_samples: number;
    if (inFrame.nb_samples !== undefined) {
      nb_samples = inFrame.nb_samples;
    } else if (format >= 5 /* U8P */ && Array.isArray(inFrame.data)) {
      // Planar format - length of first channel array is nb_samples
      nb_samples = (inFrame.data[0] as any).length;
    } else {
      // Interleaved format - need to account for bytes per sample
      const dataLen = (inFrame.data as any).length;
      let bytesPerSample = 1;
      switch (format) {
        case 1: bytesPerSample = 2; break; // S16
        case 2: bytesPerSample = 4; break; // S32
        case 3: bytesPerSample = 4; break; // FLT
      }
      // Check if data is a TypedArray (not Uint8Array wrapping another type)
      if (inFrame.data instanceof Int16Array) {
        nb_samples = dataLen / channelCount;
      } else if (inFrame.data instanceof Int32Array || inFrame.data instanceof Float32Array) {
        nb_samples = dataLen / channelCount;
      } else {
        // Uint8Array - calculate from bytes
        nb_samples = dataLen / (channelCount * bytesPerSample);
      }
    }

    native.AVFrame_nb_samples_s(framePtr, nb_samples);

    // Allocate buffer
    let ret = native.av_frame_make_writable(framePtr);
    if (ret < 0) {
      ret = native.av_frame_get_buffer(framePtr, 0);
      if (ret < 0) {
        throw new Error(`Failed to allocate frame buffers: ${native.ff_error(ret)}`);
      }
    }

    // Copy data
    if (format >= 5 /* U8P */ && Array.isArray(inFrame.data)) {
      // Planar format
      for (let ci = 0; ci < channelCount; ci++) {
        const dataPtr = native.AVFrame_data_a(framePtr, BigInt(ci));
        const channelData = inFrame.data[ci] as unknown;
        switch (format) {
          case 5: // U8P
            native.copyin_u8(dataPtr, channelData as Uint8Array);
            break;
          case 6: // S16P
            native.copyin_s16(dataPtr, channelData as Int16Array);
            break;
          case 7: // S32P
            native.copyin_s32(dataPtr, channelData as Int32Array);
            break;
          case 8: // FLTP
            native.copyin_f32(dataPtr, channelData as Float32Array);
            break;
        }
      }
    } else {
      // Interleaved format
      const dataPtr = native.AVFrame_data_a(framePtr, BigInt(0));
      const data = inFrame.data as unknown;
      switch (format) {
        case 0: // U8
          native.copyin_u8(dataPtr, data as Uint8Array);
          break;
        case 1: // S16
          native.copyin_s16(dataPtr, data as Int16Array);
          break;
        case 2: // S32
          native.copyin_s32(dataPtr, data as Int32Array);
          break;
        case 3: // FLT
          native.copyin_f32(dataPtr, data as Float32Array);
          break;
      }
    }
  }

  /**
   * Copy a video frame into native memory
   */
  private copyinVideoFrame(framePtr: bigint, inFrame: LibAVFrame): void {
    // Set frame properties
    native.AVFrame_format_s(framePtr, inFrame.format!);
    native.AVFrame_width_s(framePtr, inFrame.width!);
    native.AVFrame_height_s(framePtr, inFrame.height!);
    if (inFrame.key_frame !== undefined) native.AVFrame_key_frame_s(framePtr, inFrame.key_frame);
    if (inFrame.pict_type !== undefined) native.AVFrame_pict_type_s(framePtr, inFrame.pict_type);
    if (inFrame.pts !== undefined) {
      const pts = (inFrame.ptshi || 0) * 0x100000000 + (inFrame.pts || 0);
      native.AVFrame_pts_s(framePtr, BigInt(pts));
    }
    if (inFrame.sample_aspect_ratio) {
      native.AVFrame_sample_aspect_ratio_s(framePtr, inFrame.sample_aspect_ratio[0], inFrame.sample_aspect_ratio[1]);
    }

    const format = inFrame.format!;
    const width = inFrame.width!;
    const height = inFrame.height!;

    const desc = native.av_pix_fmt_desc_get(format);
    const log2cw = native.AVPixFmtDescriptor_log2_chroma_w(desc);
    const log2ch = native.AVPixFmtDescriptor_log2_chroma_h(desc);

    // Allocate buffer
    let ret = native.av_frame_make_writable(framePtr);
    if (ret < 0) {
      ret = native.av_frame_get_buffer(framePtr, 0);
      if (ret < 0) {
        throw new Error(`Failed to allocate frame buffers: ${native.ff_error(ret)}`);
      }
    }

    // If layout is not provided, assume packed
    let layout = inFrame.layout;
    if (!layout) {
      layout = [];
      const flags = Number(native.AVPixFmtDescriptor_flags(desc));
      const nbComponents = Number(native.AVPixFmtDescriptor_nb_components(desc));
      let bpp = 1;
      if (!(flags & 0x10)) bpp *= nbComponents;

      let off = 0;
      for (let p = 0; p < 8; p++) {
        const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
        if (!linesize) break;
        let w = width;
        let h = height;
        if (p === 1 || p === 2) {
          w >>= log2cw;
          h >>= log2ch;
        }
        layout.push({
          offset: off,
          stride: w * bpp
        });
        off += w * h * bpp;
      }
    }

    // Copy data plane by plane
    const frameData = inFrame.data instanceof Uint8Array 
      ? inFrame.data 
      : new Uint8Array(inFrame.data as ArrayBuffer);
    for (let p = 0; p < layout.length; p++) {
      const lplane = layout[p];
      const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
      const dataPtr = native.AVFrame_data_a(framePtr, BigInt(p));
      let h = height;
      if (p === 1 || p === 2) h >>= log2ch;
      
      const stride = Math.min(lplane.stride, linesize);
      for (let y = 0; y < h; y++) {
        const srcOff = lplane.offset + y * lplane.stride;
        const dstOff = dataPtr + BigInt(y * linesize);
        native.copyin_u8(dstOff, frameData.subarray(srcOff, srcOff + stride));
      }
    }
  }

  /**
   * Copy out a packet from native memory
   */
  private copyoutPacket(pktPtr: bigint, tbNum: number, tbDen: number): LibAVPacket {
    const size = native.AVPacket_size(pktPtr);
    const dataPtr = native.AVPacket_data(pktPtr);
    const pts = Number(native.AVPacket_pts(pktPtr));
    const dts = Number(native.AVPacket_dts(pktPtr));
    const duration = Number(native.AVPacket_duration(pktPtr));

    return {
      data: size > 0 ? native.copyout_u8(dataPtr, BigInt(size)) : new Uint8Array(0),
      pts: pts >>> 0,
      ptshi: Math.floor(pts / 0x100000000) >>> 0,
      dts: dts >>> 0,
      dtshi: Math.floor(dts / 0x100000000) >>> 0,
      duration: duration >>> 0,
      durationhi: Math.floor(duration / 0x100000000) >>> 0,
      flags: native.AVPacket_flags(pktPtr),
      stream_index: native.AVPacket_stream_index(pktPtr),
      time_base_num: tbNum,
      time_base_den: tbDen
    };
  }

  /**
   * Set codec context time base
   */
  async AVCodecContext_time_base_s(contextId: number, num: number, den: number): Promise<void> {
    const context = this.contexts.get(contextId);
    if (context) {
      native.AVCodecContext_time_base_s(context.ctx, num, den);
    }
  }

  /**
   * Copy frame to buffer (for standalone frame API or context frame)
   */
  async ff_copyin_frame(frameId: number, frameData: LibAVFrame): Promise<void> {
    // First check if this is a context ID (frame was created via ff_init_encoder)
    const context = this.contexts.get(frameId);
    if (context) {
      this.copyinFrame(context.frame, frameData, context.ctx);
      return;
    }
    
    // Then check standalone frames (created via av_frame_alloc)
    const framePtr = this.frames.get(frameId);
    if (framePtr) {
      this.copyinFrame(framePtr, frameData, 0n);
      return;
    }
    
    throw new Error(`Frame not found: ${frameId}`);
  }

  /**
   * Allocate memory
   */
  async calloc(count: number, size: number): Promise<number> {
    const ptr = native.av_malloc(BigInt(count * size));
    return Number(ptr);
  }

  /**
   * Free memory
   */
  async free(ptr: number): Promise<void> {
    native.av_free(BigInt(ptr));
  }

  /**
   * Copy buffer to Uint8Array
   */
  async copyout_u8(ptr: number, size: number): Promise<Uint8Array> {
    return native.copyout_u8(BigInt(ptr), BigInt(size));
  }

  /**
   * Copy Uint8Array to buffer
   */
  async copyin_u8(ptr: number, data: Uint8Array): Promise<void> {
    native.copyin_u8(BigInt(ptr), data);
  }

  /**
   * Allocate codec parameters
   */
  async avcodec_parameters_alloc(): Promise<number> {
    return 1; // Dummy pointer
  }

  /**
   * Free codec parameters
   */
  async avcodec_parameters_free_js(_ptr: number): Promise<void> {
    // No-op
  }

  // Codec parameter setters (stubs for compatibility)
  async AVCodecParameters_channels_s(_ptr: number, _channels: number): Promise<void> {}
  async AVCodecParameters_sample_rate_s(_ptr: number, _sampleRate: number): Promise<void> {}
  async AVCodecParameters_codec_type_s(_ptr: number, _type: number): Promise<void> {}
  async AVCodecParameters_extradata_s(_ptr: number, _extradata: number): Promise<void> {}
  async AVCodecParameters_extradata_size_s(_ptr: number, _size: number): Promise<void> {}

  /**
   * Get codec context extradata
   */
  async AVCodecContext_extradata(contextId: number): Promise<number> {
    const context = this.contexts.get(contextId);
    if (context) {
      const extradata = native.AVCodecContext_extradata(context.ctx);
      return extradata ? Number(extradata) : 0;
    }
    return 0;
  }

  async AVCodecContext_extradata_size(contextId: number): Promise<number> {
    const context = this.contexts.get(contextId);
    if (context) {
      return native.AVCodecContext_extradata_size(context.ctx);
    }
    return 0;
  }

  // Filter graph functions (stubs)
  async ff_init_filter_graph(_filterName: string, _inputCtx: any, _outputCtx: any): Promise<[number, number, number]> {
    console.warn('NodeAVAdapter: ff_init_filter_graph not fully implemented');
    return [1, 1, 1];
  }

  async ff_filter_multi(_buffersrc_ctx: number, _buffersink_ctx: number, _framePtr: number, frames: LibAVFrame[], _fin: boolean = false): Promise<LibAVFrame[]> {
    return frames;
  }

  async avfilter_graph_free_js(_filterGraph: number): Promise<void> {}

  // Frame management functions
  async av_frame_alloc(): Promise<number> {
    const frame = native.av_frame_alloc();
    const frameId = this.nextContextId++;
    this.frames.set(frameId, frame);
    return frameId;
  }

  async av_frame_free_js(frameId: number): Promise<void> {
    const frame = this.frames.get(frameId);
    if (frame) {
      native.av_frame_free_js(frame);
      this.frames.delete(frameId);
    }
  }

  /**
   * Helper to get frame pointer from context or standalone frame
   */
  private getFramePtr(frameId: number): bigint | undefined {
    // Check contexts first (for frames from ff_init_encoder)
    const ctx = this.contexts.get(frameId);
    if (ctx) return ctx.frame;
    // Then check standalone frames
    return this.frames.get(frameId);
  }

  async AVFrame_pts_s(frameId: number, pts: number): Promise<void> {
    const frame = this.getFramePtr(frameId);
    if (frame) {
      native.AVFrame_pts_s(frame, BigInt(pts));
    }
  }

  async AVFrame_ptshi_s(_frameId: number, _ptshi: number): Promise<void> {}

  async AVFrame_key_frame_s(frameId: number, keyFrame: number): Promise<void> {
    const frame = this.getFramePtr(frameId);
    if (frame) {
      native.AVFrame_key_frame_s(frame, keyFrame);
    }
  }

  async AVFrame_pict_type_s(frameId: number, pictType: number): Promise<void> {
    const frame = this.getFramePtr(frameId);
    if (frame) {
      native.AVFrame_pict_type_s(frame, pictType);
    }
  }

  async AVFrame_sample_aspect_ratio_s(frameId: number, num: number, den: number): Promise<void> {
    const frame = this.getFramePtr(frameId);
    if (frame) {
      native.AVFrame_sample_aspect_ratio_s(frame, num, den);
    }
  }

  // Software scaler functions
  async sws_getContext(
    srcW: number, srcH: number, srcFormat: number,
    dstW: number, dstH: number, dstFormat: number,
    _flags: number, _srcFilter: number, _dstFilter: number, _param: number
  ): Promise<number> {
    const swsCtx = native.sws_getContext(srcW, srcH, srcFormat, dstW, dstH, dstFormat, 0);
    if (swsCtx === 0n) {
      return 0;
    }
    const id = this.nextSwsId++;
    this.swsContexts.set(id, swsCtx);
    return id;
  }

  async sws_scale_frame(swsId: number, dstFrameId: number, srcFrameId: number): Promise<number> {
    const swsCtx = this.swsContexts.get(swsId);
    
    // Source frame - check contexts first, then standalone frames
    let srcFrame = this.contexts.get(srcFrameId)?.frame;
    if (!srcFrame) srcFrame = this.frames.get(srcFrameId);
    
    // Destination frame - check contexts first, then standalone frames
    let dstFrame = this.contexts.get(dstFrameId)?.frame;
    if (!dstFrame) dstFrame = this.frames.get(dstFrameId);
    
    if (!swsCtx || !srcFrame || !dstFrame) {
      return -1;
    }

    return native.sws_scale_frame(swsCtx, dstFrame, srcFrame);
  }

  async sws_freeContext(swsId: number): Promise<void> {
    const swsCtx = this.swsContexts.get(swsId);
    if (swsCtx) {
      native.sws_freeContext(swsCtx);
      this.swsContexts.delete(swsId);
    }
  }

  // Codec functions
  async avcodec_send_frame(contextId: number, frameId: number | null): Promise<number> {
    const context = this.contexts.get(contextId);
    if (!context) return -1;
    
    if (frameId === null) {
      return native.avcodec_send_frame(context.ctx, 0n);
    }
    
    const frame = this.getFramePtr(frameId);
    if (!frame) return -1;
    
    return native.avcodec_send_frame(context.ctx, frame);
  }

  async avcodec_receive_packet(contextId: number, _pktId: number): Promise<number> {
    const context = this.contexts.get(contextId);
    if (!context) return -1;
    
    return native.avcodec_receive_packet(context.ctx, context.pkt);
  }

  async ff_copyout_packet(contextId: number): Promise<LibAVPacket> {
    const context = this.contexts.get(contextId);
    if (!context?.pkt) {
      return { data: new Uint8Array(0) };
    }
    const tbNum = native.AVCodecContext_time_base_num(context.ctx);
    const tbDen = native.AVCodecContext_time_base_den(context.ctx);
    return this.copyoutPacket(context.pkt, tbNum, tbDen);
  }
}

// Singleton instance
let adapterInstance: NodeAVAdapter | null = null;

/**
 * Get or create the NodeAV adapter instance
 */
export function getNodeAVAdapter(): NodeAVAdapter {
  if (!adapterInstance) {
    adapterInstance = new NodeAVAdapter();
  }
  return adapterInstance;
}

/**
 * Create a new NodeAV adapter instance
 */
export function createNodeAVAdapter(): NodeAVAdapter {
  return new NodeAVAdapter();
}
