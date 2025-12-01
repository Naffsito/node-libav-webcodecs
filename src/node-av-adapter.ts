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

// Determine platform-specific path
function getPlatformDir(): string {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  } else if (platform === 'linux') {
    return arch === 'arm64' ? 'linux-arm64' : 'linux-x64';
  } else if (platform === 'win32') {
    return arch === 'arm64' ? 'win32-arm64' : 'win32-x64';
  }
  return `${platform}-${arch}`;
}

// Try to load the native module from various locations
let native: any;
const platformDir = getPlatformDir();
const searchPaths = [
  // Development: local build
  path.join(__dirname, '..', 'native', 'zig-out', 'lib', 'libavjs.node'),
  // Published: platform-specific dist folder
  path.join(__dirname, '..', 'dist', platformDir, 'libavjs.node'),
];

let loadError: Error | null = null;
for (const searchPath of searchPaths) {
  try {
    native = require_(searchPath);
    break;
  } catch (e) {
    loadError = e as Error;
  }
}

if (!native) {
  throw new Error(
    `Failed to load native libavjs module for ${platformDir}. ` +
    `Searched: ${searchPaths.join(', ')}. ` +
    `Make sure to build it first with: cd native && zig build. ` +
    `Last error: ${loadError?.message}`
  );
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

/**
 * Filter IO settings for initializing filter graphs
 */
export interface FilterIOSettings {
  type?: number;  // AVMEDIA_TYPE_VIDEO (0) or AVMEDIA_TYPE_AUDIO (1)
  // Video settings
  width?: number;
  height?: number;
  pix_fmt?: number;
  frame_rate?: number;
  time_base?: [number, number];
  // Audio settings
  sample_rate?: number;
  sample_fmt?: number;
  channel_layout?: number;
  frame_size?: number;
}

/**
 * Filter config options
 */
export interface FilterConfig {
  fin?: boolean;
  ignoreSinkTimebase?: boolean;
  copyoutFrame?: string;
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
   * Copied exactly from libav.js - handles signed 32-bit values
   */
  i64tof64(lo: number, hi: number): number {
    // Common positive case
    if (!hi && lo >= 0) return lo;

    // Common negative case
    if (hi === -1 && lo < 0) return lo;

    /* Lo bit negative numbers are really just the 32nd bit being
     * set, so we make up for that with an additional 2^32 */
    return (
      hi * 0x100000000 +
      lo +
      ((lo < 0) ? 0x100000000 : 0)
    );
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
    
    // Handle 64-bit pts properly using splitI64 for signed values
    const ptsBigInt = native.AVFrame_pts(framePtr) as bigint;
    const [ptsLow, ptsHigh] = this.splitI64(ptsBigInt);

    const outFrame: LibAVFrame = {
      data: new Uint8Array(0),
      channel_layout: native.AVFrame_channel_layout(framePtr),
      channels: channels,
      format: format,
      nb_samples: nb_samples,
      pts: ptsLow,
      ptshi: ptsHigh,
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
    
    // Handle 64-bit pts properly using splitI64 for signed values
    const ptsBigInt = native.AVFrame_pts(framePtr) as bigint;
    const [ptsLow, ptsHigh] = this.splitI64(ptsBigInt);
    
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
      pts: ptsLow,
      ptshi: ptsHigh,
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
   * Split a 64-bit BigInt into low and high 32-bit parts (signed)
   * Matches libav.js format where both parts are signed int32
   */
  private splitI64(value: bigint): [number, number] {
    // Use DataView to get correct signed 32-bit representation
    // This matches how libav.js/WASM returns values
    const dv = new DataView(new ArrayBuffer(8));
    dv.setBigInt64(0, value, true);  // little-endian
    const lo = dv.getInt32(0, true);  // signed low 32 bits
    const hi = dv.getInt32(4, true);  // signed high 32 bits
    return [lo, hi];
  }

  /**
   * Copy out a packet from native memory
   */
  private copyoutPacket(pktPtr: bigint, tbNum: number, tbDen: number): LibAVPacket {
    const size = native.AVPacket_size(pktPtr);
    const dataPtr = native.AVPacket_data(pktPtr);
    
    // Handle 64-bit values properly - native returns BigInt (signed i64)
    const ptsBigInt = native.AVPacket_pts(pktPtr) as bigint;
    const dtsBigInt = native.AVPacket_dts(pktPtr) as bigint;
    const durationBigInt = native.AVPacket_duration(pktPtr) as bigint;

    const [ptsLow, ptsHigh] = this.splitI64(ptsBigInt);
    const [dtsLow, dtsHigh] = this.splitI64(dtsBigInt);
    const [durLow, durHigh] = this.splitI64(durationBigInt);

    return {
      data: size > 0 ? native.copyout_u8(dataPtr, BigInt(size)) : new Uint8Array(0),
      pts: ptsLow,
      ptshi: ptsHigh,
      dts: dtsLow,
      dtshi: dtsHigh,
      duration: durLow,
      durationhi: durHigh,
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

  // Filter graph storage
  private filterGraphs: Map<number, {
    graph: bigint;
    srcCtxs: bigint[];
    sinkCtxs: bigint[];
  }> = new Map();
  private filterCtxs: Map<number, bigint> = new Map();
  private nextFilterId = 1;

  /**
   * Filter IO settings interface
   */
  private isVideoFilter(settings: FilterIOSettings): boolean {
    return settings.type === 0; // AVMEDIA_TYPE_VIDEO
  }

  /**
   * Initialize a filter graph
   * Returns [filter_graph_id, buffersrc_ctx_id, buffersink_ctx_id]
   */
  async ff_init_filter_graph(
    filtersDescr: string,
    input: FilterIOSettings | FilterIOSettings[],
    output: FilterIOSettings | FilterIOSettings[]
  ): Promise<[number, number | number[], number | number[]]> {
    const multipleInputs = Array.isArray(input);
    const multipleOutputs = Array.isArray(output);
    const inputs = multipleInputs ? input : [input];
    const outputs = multipleOutputs ? output : [output];

    const srcCtxs: bigint[] = [];
    const sinkCtxs: bigint[] = [];
    const srcCtxIds: number[] = [];
    const sinkCtxIds: number[] = [];
    let ioOutputs = 0n;
    let ioInputs = 0n;
    let filterGraph = 0n;

    try {
      // Get filter references
      const buffersrc = native.avfilter_get_by_name('buffer\0');
      const abuffersrc = native.avfilter_get_by_name('abuffer\0');
      const format = native.avfilter_get_by_name('format\0');
      const aformat = native.avfilter_get_by_name('aformat\0');
      const buffersink = native.avfilter_get_by_name('buffersink\0');
      const abuffersink = native.avfilter_get_by_name('abuffersink\0');

      // Allocate filter graph
      filterGraph = native.avfilter_graph_alloc();
      if (filterGraph === 0n) {
        throw new Error('Failed to allocate filter graph');
      }

      // Create inputs (our outputs to the graph - "outputs" in avfilter terminology)
      for (let ii = 0; ii < inputs.length; ii++) {
        const inp = inputs[ii];
        const nm = `in${multipleInputs ? ii : ''}\0`;

        // Allocate AVFilterInOut
        const nextIoOutputs = native.avfilter_inout_alloc();
        if (nextIoOutputs === 0n) {
          throw new Error('Failed to allocate outputs');
        }
        native.AVFilterInOut_next_s(nextIoOutputs, ioOutputs);
        ioOutputs = nextIoOutputs;

        let tmpSrcCtx: bigint;
        if (this.isVideoFilter(inp)) {
          // Video filter
          if (buffersrc === 0n) throw new Error('Failed to load buffer filter');
          const frameRate = inp.frame_rate ?? 30;
          const timeBase = inp.time_base ?? [1, frameRate];
          const args = `time_base=${timeBase[0]}/${timeBase[1]}:frame_rate=${frameRate}:pix_fmt=${inp.pix_fmt ?? 0}:width=${inp.width ?? 640}:height=${inp.height ?? 360}\0`;
          tmpSrcCtx = native.avfilter_graph_create_filter_js(buffersrc, nm, args, filterGraph);
        } else {
          // Audio filter
          if (abuffersrc === 0n) throw new Error('Failed to load abuffer filter');
          const sampleRate = inp.sample_rate ?? 48000;
          const timeBase = inp.time_base ?? [1, sampleRate];
          const channelLayout = inp.channel_layout ?? 4; // MONO
          const args = `time_base=${timeBase[0]}/${timeBase[1]}:sample_rate=${sampleRate}:sample_fmt=${inp.sample_fmt ?? 3}:channel_layout=0x${channelLayout.toString(16)}\0`;
          tmpSrcCtx = native.avfilter_graph_create_filter_js(abuffersrc, nm, args, filterGraph);
        }

        if (tmpSrcCtx === 0n) {
          throw new Error('Cannot create buffer source');
        }
        srcCtxs.push(tmpSrcCtx);

        // Configure inout
        const instr = native.av_strdup(nm);
        if (instr === 0n) throw new Error('Failed to allocate output name');
        native.AVFilterInOut_name_s(ioOutputs, instr);
        native.AVFilterInOut_filter_ctx_s(ioOutputs, tmpSrcCtx);
        native.AVFilterInOut_pad_idx_s(ioOutputs, 0);
      }

      // Create outputs (our inputs from the graph - "inputs" in avfilter terminology)
      for (let oi = 0; oi < outputs.length; oi++) {
        const out = outputs[oi];
        const nm = `out${multipleOutputs ? oi : ''}\0`;

        // Allocate AVFilterInOut
        const nextIoInputs = native.avfilter_inout_alloc();
        if (nextIoInputs === 0n) {
          throw new Error('Failed to allocate inputs');
        }
        native.AVFilterInOut_next_s(nextIoInputs, ioInputs);
        ioInputs = nextIoInputs;

        let formatCtx: bigint;
        let tmpSinkCtx: bigint;

        if (this.isVideoFilter(out)) {
          // Video filter
          if (format === 0n || buffersink === 0n) throw new Error('Failed to load format or buffersink filter');
          const formatArgs = `pix_fmts=0x${(out.pix_fmt ?? 0).toString(16)}\0`;
          formatCtx = native.avfilter_graph_create_filter_js(format, `${nm}format\0`, formatArgs, filterGraph);
          tmpSinkCtx = native.avfilter_graph_create_filter_js(buffersink, nm, '\0', filterGraph);
        } else {
          // Audio filter
          if (aformat === 0n || abuffersink === 0n) throw new Error('Failed to load aformat or abuffersink filter');
          const formatArgs = `sample_fmts=${out.sample_fmt ?? 3}:channel_layouts=0x${(out.channel_layout ?? 4).toString(16)}:sample_rates=${out.sample_rate ?? 48000}\0`;
          formatCtx = native.avfilter_graph_create_filter_js(aformat, `${nm}format\0`, formatArgs, filterGraph);
          tmpSinkCtx = native.avfilter_graph_create_filter_js(abuffersink, nm, '\0', filterGraph);
        }

        if (formatCtx === 0n) throw new Error('Cannot create format filter');
        if (tmpSinkCtx === 0n) throw new Error('Cannot create buffer sink');

        // Link format to sink
        native.avfilter_link(formatCtx, 0, tmpSinkCtx, 0);
        sinkCtxs.push(tmpSinkCtx);

        // Configure inout
        const outstr = native.av_strdup(nm);
        if (outstr === 0n) throw new Error('Failed to allocate input name');
        native.AVFilterInOut_name_s(ioInputs, outstr);
        native.AVFilterInOut_filter_ctx_s(ioInputs, formatCtx);
        native.AVFilterInOut_pad_idx_s(ioInputs, 0);
      }

      // Parse filter graph
      const parseRet = native.avfilter_graph_parse_js(filterGraph, filtersDescr + '\0', ioInputs, ioOutputs);
      if (parseRet < 0) {
        throw new Error(`Failed to initialize filters: ${native.ff_error(parseRet)}`);
      }
      ioInputs = 0n;
      ioOutputs = 0n;

      // Set frame sizes for output sinks
      for (let oi = 0; oi < outputs.length; oi++) {
        const out = outputs[oi];
        if (out.frame_size) {
          native.av_buffersink_set_frame_size(sinkCtxs[oi], out.frame_size);
        }
      }

      // Configure graph
      const configRet = native.avfilter_graph_config(filterGraph);
      if (configRet < 0) {
        throw new Error(`Failed to configure filter graph: ${native.ff_error(configRet)}`);
      }

      // Store and return IDs
      const graphId = this.nextFilterId++;
      this.filterGraphs.set(graphId, { graph: filterGraph, srcCtxs, sinkCtxs });

      // Store filter contexts for later use
      for (const ctx of srcCtxs) {
        const ctxId = this.nextFilterId++;
        this.filterCtxs.set(ctxId, ctx);
        srcCtxIds.push(ctxId);
      }
      for (const ctx of sinkCtxs) {
        const ctxId = this.nextFilterId++;
        this.filterCtxs.set(ctxId, ctx);
        sinkCtxIds.push(ctxId);
      }

      return [
        graphId,
        multipleInputs ? srcCtxIds : srcCtxIds[0],
        multipleOutputs ? sinkCtxIds : sinkCtxIds[0]
      ];

    } catch (ex) {
      // Clean up on error
      if (ioOutputs !== 0n) native.avfilter_inout_free_js(ioOutputs);
      if (ioInputs !== 0n) native.avfilter_inout_free_js(ioInputs);
      if (filterGraph !== 0n) native.avfilter_graph_free_js(filterGraph);
      throw ex;
    }
  }

  /**
   * Filter frames through a filter graph
   */
  async ff_filter_multi(
    buffersrcCtxId: number | number[],
    buffersinkCtxId: number,
    frameId: number,
    inFrames: LibAVFrame[] | LibAVFrame[][],
    config: boolean | FilterConfig | (boolean | FilterConfig)[] = false
  ): Promise<LibAVFrame[]> {
    const outFrames: LibAVFrame[] = [];
    let tbNum = -1;
    let tbDen = -1;

    // Normalize to arrays
    const srcIds = Array.isArray(buffersrcCtxId) ? buffersrcCtxId : [buffersrcCtxId];
    const frameArrays = (Array.isArray(inFrames[0]) ? inFrames : [inFrames]) as LibAVFrame[][];
    const configs = Array.isArray(config) ? config : srcIds.map(() => config);

    // Normalize config objects
    const normalizedConfigs = configs.map(c => {
      if (c === true) return { fin: true };
      if (c === false) return {};
      return c;
    });

    // Get sink context
    const sinkCtx = this.filterCtxs.get(buffersinkCtxId);
    if (!sinkCtx) throw new Error(`Buffer sink context not found: ${buffersinkCtxId}`);

    // Get frame pointer
    const framePtr = this.getFramePtr(frameId);
    if (!framePtr) throw new Error(`Frame not found: ${frameId}`);

    // Find max frame count
    const maxFrames = Math.max(...frameArrays.map(arr => arr.length));

    // Process frames in order
    for (let fi = 0; fi <= maxFrames; fi++) {
      for (let ti = 0; ti < srcIds.length; ti++) {
        const srcCtx = this.filterCtxs.get(srcIds[ti]);
        if (!srcCtx) continue;

        const inFrame = frameArrays[ti]?.[fi];
        const cfg = normalizedConfigs[ti];

        if (inFrame) {
          // Copy frame to native memory and add to filter
          this.copyinFrame(framePtr, inFrame, 0n);
          const ret = native.av_buffersrc_add_frame_flags(srcCtx, framePtr, 8); // AV_BUFFERSRC_FLAG_KEEP_REF
          if (ret < 0) {
            throw new Error(`Error feeding filter graph: ${native.ff_error(ret)}`);
          }
          native.av_frame_unref(framePtr);
        } else if (cfg.fin && fi === maxFrames) {
          // Flush this source
          native.av_buffersrc_add_frame_flags(srcCtx, 0n, 0);
        }

        // Receive all available frames from sink
        while (true) {
          const ret = native.av_buffersink_get_frame(sinkCtx, framePtr);
          if (ret === AVERROR_EAGAIN || ret === AVERROR_EOF) {
            break;
          }
          if (ret < 0) {
            throw new Error(`Error receiving from filter: ${native.ff_error(ret)}`);
          }

          // Get time base from sink
          if (tbNum < 0) {
            tbNum = native.av_buffersink_get_time_base_num(sinkCtx);
            tbDen = native.av_buffersink_get_time_base_den(sinkCtx);
          }

          // Copy out frame
          const outFrame = this.copyoutFrame(framePtr, tbNum, tbDen);
          outFrames.push(outFrame);
          native.av_frame_unref(framePtr);
        }
      }
    }

    return outFrames;
  }

  async avfilter_graph_free_js(graphId: number): Promise<void> {
    const graphInfo = this.filterGraphs.get(graphId);
    if (graphInfo) {
      native.avfilter_graph_free_js(graphInfo.graph);
      this.filterGraphs.delete(graphId);
      // Note: filter contexts are freed with the graph
    }
  }

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
