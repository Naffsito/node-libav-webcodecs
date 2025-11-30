/*
 * Node-AV Adapter
 * Provides a libav.js-compatible interface using node-av native bindings.
 * This allows the WebCodecs polyfill to work in Node.js environments.
 */

import {
  Codec,
  CodecContext,
  Frame,
  Packet,
  FFmpegError,
} from 'node-av/lib';

import {
  AV_CODEC_ID_FLAC,
  AV_CODEC_ID_OPUS,
  AV_CODEC_ID_VORBIS,
  AV_CODEC_ID_VP8,
  AV_CODEC_ID_VP9,
  AV_CODEC_ID_AV1,
  AV_SAMPLE_FMT_U8,
  AV_SAMPLE_FMT_S16,
  AV_SAMPLE_FMT_S32,
  AV_SAMPLE_FMT_FLT,
  AV_SAMPLE_FMT_U8P,
  AV_SAMPLE_FMT_S16P,
  AV_SAMPLE_FMT_S32P,
  AV_SAMPLE_FMT_FLTP,
  AV_PIX_FMT_YUV420P,
  AV_PIX_FMT_YUV422P,
  AV_PIX_FMT_YUV444P,
  AV_PIX_FMT_RGBA,
  AV_PIX_FMT_BGRA,
  AV_PIX_FMT_NV12,
  AVMEDIA_TYPE_AUDIO,
  AVMEDIA_TYPE_VIDEO,
  AVERROR_EOF,
  AVERROR_EAGAIN,
} from 'node-av/constants';

import type { AVCodecID, AVSampleFormat, AVPixelFormat } from 'node-av/constants';

/**
 * Frame data structure compatible with libav.js
 */
export interface LibAVFrame {
  data: Uint8Array | Uint8Array[];
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
 * NodeAVAdapter - Provides libav.js-compatible interface using node-av
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
  readonly EAGAIN = -AVERROR_EAGAIN;

  // Internal storage for codec contexts
  private contexts: Map<number, {
    codecCtx: CodecContext;
    codec: Codec;
    frame: Frame;
    packet: Packet;
  }> = new Map();
  private nextContextId = 1;

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
    const codec = Codec.findEncoderByName(name);
    return codec ? 1 : 0;
  }

  /**
   * Find a decoder by name
   */
  async avcodec_find_decoder_by_name(name: string): Promise<number> {
    const codec = Codec.findDecoderByName(name);
    return codec ? 1 : 0;
  }

  /**
   * Initialize a decoder - returns [codec, context_id, packet_id, frame_id]
   */
  async ff_init_decoder(
    codecName: string,
    codecpara?: any
  ): Promise<[number, number, number, number]> {
    const codec = Codec.findDecoderByName(codecName);
    if (!codec) {
      throw new Error(`Decoder not found: ${codecName}`);
    }

    const codecCtx = new CodecContext();
    codecCtx.allocContext3(codec);

    // Apply codec parameters if provided
    if (codecpara) {
      if (codecpara.channels !== undefined) {
        codecCtx.channelLayout = { nbChannels: codecpara.channels, order: 0, mask: BigInt((1 << codecpara.channels) - 1) };
      }
      if (codecpara.sample_rate !== undefined) {
        codecCtx.sampleRate = codecpara.sample_rate;
      }
      if (codecpara.extradata && codecpara.extradata_size > 0) {
        codecCtx.extraData = Buffer.from(codecpara.extradata);
      }
    }

    // Open the codec
    const ret = await codecCtx.open2(codec, null);
    if (ret < 0) {
      codecCtx.freeContext();
      throw new FFmpegError(ret);
    }

    const frame = new Frame();
    frame.alloc();

    const packet = new Packet();
    packet.alloc();

    const contextId = this.nextContextId++;
    this.contexts.set(contextId, { codecCtx, codec, frame, packet });

    return [1, contextId, contextId, contextId];
  }

  /**
   * Initialize an encoder - returns [codec, context_id, frame_id, packet_id, frame_size]
   */
  async ff_init_encoder(
    codecName: string,
    config?: LibAVJSCodec
  ): Promise<[number, number, number, number, number]> {
    const codec = Codec.findEncoderByName(codecName);
    if (!codec) {
      throw new Error(`Encoder not found: ${codecName}`);
    }

    const codecCtx = new CodecContext();
    codecCtx.allocContext3(codec);

    // Apply context properties
    if (config?.ctx) {
      const ctx = config.ctx;
      if (ctx.sample_fmt !== undefined) codecCtx.sampleFormat = ctx.sample_fmt as AVSampleFormat;
      if (ctx.sample_rate !== undefined) codecCtx.sampleRate = ctx.sample_rate;
      if (ctx.channels !== undefined) {
        codecCtx.channelLayout = { 
          nbChannels: ctx.channels, 
          order: 0, 
          mask: BigInt(ctx.channel_layout || ((1 << ctx.channels) - 1))
        };
      }
      if (ctx.channel_layout !== undefined && ctx.channels === undefined) {
        const nbChannels = Math.log2(ctx.channel_layout + 1);
        codecCtx.channelLayout = { nbChannels, order: 0, mask: BigInt(ctx.channel_layout) };
      }
      if (ctx.bit_rate !== undefined) codecCtx.bitRate = BigInt(ctx.bit_rate);
      if (ctx.pix_fmt !== undefined) codecCtx.pixelFormat = ctx.pix_fmt as AVPixelFormat;
      if (ctx.width !== undefined) codecCtx.width = ctx.width;
      if (ctx.height !== undefined) codecCtx.height = ctx.height;
      if (ctx.framerate_num !== undefined && ctx.framerate_den !== undefined) {
        codecCtx.framerate = { num: ctx.framerate_num, den: ctx.framerate_den };
        // Set time_base as inverse of framerate for video encoders
        codecCtx.timeBase = { num: ctx.framerate_den, den: ctx.framerate_num };
      } else if (ctx.width !== undefined) {
        // Default time_base for video if framerate not specified
        codecCtx.timeBase = { num: 1, den: 1000 };
      }
    }

    // For video codecs, ensure time_base is set
    if (codec.type === AVMEDIA_TYPE_VIDEO && !codecCtx.timeBase.den) {
      codecCtx.timeBase = { num: 1, den: 1000 };
    }

    // Open the codec
    const ret = await codecCtx.open2(codec, null);
    if (ret < 0) {
      codecCtx.freeContext();
      throw new FFmpegError(ret);
    }

    const frame = new Frame();
    frame.alloc();

    const packet = new Packet();
    packet.alloc();

    const contextId = this.nextContextId++;
    this.contexts.set(contextId, { codecCtx, codec, frame, packet });

    const frameSize = codecCtx.frameSize || 1024;

    return [1, contextId, contextId, contextId, frameSize];
  }

  /**
   * Free a decoder
   */
  async ff_free_decoder(contextId: number, _pktId: number, _frameId: number): Promise<void> {
    const ctx = this.contexts.get(contextId);
    if (ctx) {
      ctx.frame.free();
      ctx.packet.free();
      ctx.codecCtx.freeContext();
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
    const ctx = this.contexts.get(contextId);
    if (!ctx) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const { codecCtx, frame, packet } = ctx;
    const decodedFrames: LibAVFrame[] = [];

    // Send packets to decoder
    for (const pkt of packets) {
      // Copy packet data - use Buffer.from to create a proper buffer
      packet.unref();
      packet.data = Buffer.from(pkt.data);
      
      if (pkt.pts !== undefined) {
        packet.pts = BigInt(this.i64tof64(pkt.pts, pkt.ptshi || 0));
      }
      if (pkt.dts !== undefined) {
        packet.dts = BigInt(this.i64tof64(pkt.dts, pkt.dtshi || 0));
      }
      if (pkt.duration !== undefined) {
        packet.duration = BigInt(this.i64tof64(pkt.duration, pkt.durationhi || 0));
      }

      const sendRet = await codecCtx.sendPacket(packet);
      if (sendRet < 0 && sendRet !== AVERROR_EOF) {
        // EAGAIN is ok, means we need to receive frames first
        if (sendRet !== AVERROR_EAGAIN) {
          throw new FFmpegError(sendRet);
        }
      }

      // Receive all available frames
      while (true) {
        const recvRet = await codecCtx.receiveFrame(frame);
        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }
        if (recvRet < 0) {
          throw new FFmpegError(recvRet);
        }

        decodedFrames.push(this.frameToLibAV(frame, codecCtx));
        frame.unref();
      }
    }

    // Flush decoder if requested
    if (flush) {
      const flushRet = await codecCtx.sendPacket(null);
      if (flushRet >= 0 || flushRet === AVERROR_EOF) {
        while (true) {
          const recvRet = await codecCtx.receiveFrame(frame);
          if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
            break;
          }
          if (recvRet < 0) {
            throw new FFmpegError(recvRet);
          }

          decodedFrames.push(this.frameToLibAV(frame, codecCtx));
          frame.unref();
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
    const ctx = this.contexts.get(contextId);
    if (!ctx) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const { codecCtx, frame, packet } = ctx;
    const encodedPackets: LibAVPacket[] = [];

    // Send frames to encoder
    for (const frm of frames) {
      this.libAVToFrame(frm, frame, codecCtx);

      const sendRet = await codecCtx.sendFrame(frame);
      if (sendRet < 0 && sendRet !== AVERROR_EOF) {
        if (sendRet !== AVERROR_EAGAIN) {
          throw new FFmpegError(sendRet);
        }
      }

      // Receive all available packets
      while (true) {
        const recvRet = await codecCtx.receivePacket(packet);
        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }
        if (recvRet < 0) {
          throw new FFmpegError(recvRet);
        }

        encodedPackets.push(this.packetToLibAV(packet));
        packet.unref();
      }
    }

    // Flush encoder if requested
    if (flush) {
      const flushRet = await codecCtx.sendFrame(null);
      if (flushRet >= 0 || flushRet === AVERROR_EOF) {
        while (true) {
          const recvRet = await codecCtx.receivePacket(packet);
          if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
            break;
          }
          if (recvRet < 0) {
            throw new FFmpegError(recvRet);
          }

          encodedPackets.push(this.packetToLibAV(packet));
          packet.unref();
        }
      }
    }

    return encodedPackets;
  }

  /**
   * Set codec context time base
   */
  async AVCodecContext_time_base_s(contextId: number, num: number, den: number): Promise<void> {
    const ctx = this.contexts.get(contextId);
    if (ctx) {
      ctx.codecCtx.timeBase = { num, den };
    }
  }

  /**
   * Copy frame to buffer
   */
  async ff_copyin_frame(contextId: number, frameData: LibAVFrame): Promise<void> {
    const ctx = this.contexts.get(contextId);
    if (!ctx) {
      throw new Error(`Context not found: ${contextId}`);
    }
    this.libAVToFrame(frameData, ctx.frame, ctx.codecCtx);
  }

  /**
   * Copy buffer to Uint8Array
   */
  async copyout_u8(ptr: number, size: number): Promise<Uint8Array> {
    // In node-av, this would be handled differently
    // This is a placeholder for the libav.js memory interface
    return new Uint8Array(size);
  }

  /**
   * Copy Uint8Array to buffer
   */
  async copyin_u8(ptr: number, data: Uint8Array): Promise<void> {
    // Placeholder for libav.js memory interface
  }

  /**
   * Allocate memory
   */
  async calloc(count: number, size: number): Promise<number> {
    // Placeholder - node-av handles memory differently
    return 0;
  }

  /**
   * Free memory
   */
  async free(ptr: number): Promise<void> {
    // Placeholder
  }

  /**
   * Allocate codec parameters
   */
  async avcodec_parameters_alloc(): Promise<number> {
    // Return a dummy pointer - node-av uses objects directly
    return 1;
  }

  /**
   * Free codec parameters
   */
  async avcodec_parameters_free_js(ptr: number): Promise<void> {
    // No-op for node-av
  }

  /**
   * Set codec parameters properties
   */
  async AVCodecParameters_channels_s(ptr: number, channels: number): Promise<void> {}
  async AVCodecParameters_sample_rate_s(ptr: number, sampleRate: number): Promise<void> {}
  async AVCodecParameters_codec_type_s(ptr: number, type: number): Promise<void> {}
  async AVCodecParameters_extradata_s(ptr: number, extradata: number): Promise<void> {}
  async AVCodecParameters_extradata_size_s(ptr: number, size: number): Promise<void> {}

  /**
   * Get codec context extradata
   */
  async AVCodecContext_extradata(contextId: number): Promise<number> {
    const ctx = this.contexts.get(contextId);
    if (ctx && ctx.codecCtx.extraData) {
      return 1; // Non-zero means extradata exists
    }
    return 0;
  }

  async AVCodecContext_extradata_size(contextId: number): Promise<number> {
    const ctx = this.contexts.get(contextId);
    if (ctx && ctx.codecCtx.extraData) {
      return ctx.codecCtx.extraData.length;
    }
    return 0;
  }

  // ============================================
  // Filter graph functions (stubs for compatibility)
  // ============================================

  /**
   * Initialize a filter graph (stub - not fully implemented)
   * Returns [filter_graph, buffersrc_ctx, buffersink_ctx]
   */
  async ff_init_filter_graph(
    _filterName: string,
    _inputCtx: any,
    _outputCtx: any
  ): Promise<[number, number, number]> {
    // For audio resampling, we would use node-av's Resampler
    // For now, return dummy values that indicate "no filter needed"
    console.warn('NodeAVAdapter: ff_init_filter_graph not fully implemented - audio will not be resampled');
    return [1, 1, 1]; // Dummy filter graph ID
  }

  /**
   * Run frames through a filter graph (stub)
   */
  async ff_filter_multi(
    _buffersrc_ctx: number,
    _buffersink_ctx: number,
    _framePtr: number,
    frames: LibAVFrame[],
    _fin: boolean = false
  ): Promise<LibAVFrame[]> {
    // Pass-through for now - no actual filtering
    return frames;
  }

  /**
   * Free a filter graph (stub)
   */
  async avfilter_graph_free_js(_filterGraph: number): Promise<void> {
    // No-op
  }

  // ============================================
  // Frame management functions
  // ============================================

  /**
   * Allocate a frame
   */
  async av_frame_alloc(): Promise<number> {
    const frame = new Frame();
    frame.alloc();
    const frameId = this.nextContextId++;
    // Store frame in a separate map (we can reuse contexts map for simplicity)
    this.contexts.set(frameId, { 
      codecCtx: null as any, 
      codec: null as any, 
      frame, 
      packet: null as any 
    });
    return frameId;
  }

  /**
   * Free a frame
   */
  async av_frame_free_js(frameId: number): Promise<void> {
    const ctx = this.contexts.get(frameId);
    if (ctx?.frame) {
      ctx.frame.free();
      this.contexts.delete(frameId);
    }
  }

  /**
   * Set frame properties
   */
  async AVFrame_pts_s(frameId: number, pts: number): Promise<void> {
    const ctx = this.contexts.get(frameId);
    if (ctx?.frame) {
      ctx.frame.pts = BigInt(pts);
    }
  }

  async AVFrame_ptshi_s(_frameId: number, _ptshi: number): Promise<void> {
    // High bits of pts - usually not needed for reasonable timestamps
  }

  async AVFrame_key_frame_s(frameId: number, keyFrame: number): Promise<void> {
    const ctx = this.contexts.get(frameId);
    if (ctx?.frame) {
      ctx.frame.keyFrame = keyFrame === 1;
    }
  }

  async AVFrame_pict_type_s(frameId: number, pictType: number): Promise<void> {
    const ctx = this.contexts.get(frameId);
    if (ctx?.frame) {
      ctx.frame.pictType = pictType;
    }
  }

  async AVFrame_sample_aspect_ratio_s(frameId: number, num: number, den: number): Promise<void> {
    const ctx = this.contexts.get(frameId);
    if (ctx?.frame) {
      ctx.frame.sampleAspectRatio = { num, den };
    }
  }

  // ============================================
  // Software scaler functions (stubs)
  // ============================================

  /**
   * Get a software scaler context (stub)
   */
  async sws_getContext(
    _srcW: number, _srcH: number, _srcFormat: number,
    _dstW: number, _dstH: number, _dstFormat: number,
    _flags: number, _srcFilter: number, _dstFilter: number, _param: number
  ): Promise<number> {
    console.warn('NodeAVAdapter: sws_getContext not fully implemented - video will not be scaled');
    return 1; // Dummy scaler ID
  }

  /**
   * Scale a frame (stub - pass-through)
   */
  async sws_scale_frame(_sws: number, _dstFrame: number, _srcFrame: number): Promise<number> {
    // Would need to implement actual scaling using node-av or sharp
    return 0; // Success
  }

  /**
   * Free a scaler context (stub)
   */
  async sws_freeContext(_sws: number): Promise<void> {
    // No-op
  }

  // ============================================
  // Codec functions
  // ============================================

  /**
   * Send a frame to the encoder
   */
  async avcodec_send_frame(contextId: number, frameId: number | null): Promise<number> {
    const ctx = this.contexts.get(contextId);
    if (!ctx) return -1;
    
    if (frameId === null) {
      // Flush
      return await ctx.codecCtx.sendFrame(null);
    }
    
    const frameCtx = this.contexts.get(frameId);
    if (!frameCtx?.frame) return -1;
    
    return await ctx.codecCtx.sendFrame(frameCtx.frame);
  }

  /**
   * Receive a packet from the encoder
   */
  async avcodec_receive_packet(contextId: number, _pktId: number): Promise<number> {
    const ctx = this.contexts.get(contextId);
    if (!ctx) return -1;
    
    return await ctx.codecCtx.receivePacket(ctx.packet);
  }

  /**
   * Copy out a packet
   */
  async ff_copyout_packet(pktId: number): Promise<LibAVPacket> {
    const ctx = this.contexts.get(pktId);
    if (!ctx?.packet) {
      return { data: new Uint8Array(0) };
    }
    return this.packetToLibAV(ctx.packet);
  }

  /**
   * Convert node-av Frame to libav.js-compatible format
   */
  private frameToLibAV(frame: Frame, codecCtx: CodecContext): LibAVFrame {
    const isAudio = codecCtx.codecType === AVMEDIA_TYPE_AUDIO;
    const data = frame.data;

    if (isAudio) {
      // Audio frame
      const isPlanar = this.isSampleFormatPlanar(frame.format as AVSampleFormat);
      let frameData: Uint8Array | Uint8Array[];

      if (isPlanar && data && data.length > 1) {
        frameData = data.map(d => new Uint8Array(d.buffer, d.byteOffset, d.byteLength));
      } else if (data && data[0]) {
        frameData = new Uint8Array(data[0].buffer, data[0].byteOffset, data[0].byteLength);
      } else {
        frameData = new Uint8Array(0);
      }

      const pts = Number(frame.pts);
      const [ptsLow, ptsHi] = this.f64toi64(pts);

      return {
        data: frameData,
        format: frame.format,
        channels: frame.channelLayout?.nbChannels || 2,
        channel_layout: Number(frame.channelLayout?.mask || 3n),
        sample_rate: frame.sampleRate,
        nb_samples: frame.nbSamples,
        pts: ptsLow,
        ptshi: ptsHi,
      };
    } else {
      // Video frame
      let frameData: Uint8Array[];
      if (data) {
        frameData = data.map(d => new Uint8Array(d.buffer, d.byteOffset, d.byteLength));
      } else {
        frameData = [new Uint8Array(0)];
      }

      const pts = Number(frame.pts);
      const [ptsLow, ptsHi] = this.f64toi64(pts);

      return {
        data: frameData,
        format: frame.format,
        width: frame.width,
        height: frame.height,
        pts: ptsLow,
        ptshi: ptsHi,
        key_frame: frame.keyFrame ? 1 : 0,
      };
    }
  }

  /**
   * Convert libav.js frame to node-av Frame
   */
  private libAVToFrame(libavFrame: LibAVFrame, frame: Frame, codecCtx: CodecContext): void {
    const isAudio = codecCtx.codecType === AVMEDIA_TYPE_AUDIO;

    frame.unref();

    if (isAudio) {
      frame.format = libavFrame.format ?? codecCtx.sampleFormat;
      frame.sampleRate = libavFrame.sample_rate ?? codecCtx.sampleRate;
      frame.nbSamples = libavFrame.nb_samples ?? codecCtx.frameSize;
      
      if (libavFrame.channel_layout !== undefined) {
        const nbChannels = libavFrame.channels ?? Math.log2(libavFrame.channel_layout + 1);
        frame.channelLayout = { nbChannels, order: 0, mask: BigInt(libavFrame.channel_layout) };
      } else if (libavFrame.channels !== undefined) {
        frame.channelLayout = { 
          nbChannels: libavFrame.channels, 
          order: 0, 
          mask: BigInt((1 << libavFrame.channels) - 1) 
        };
      } else {
        frame.channelLayout = codecCtx.channelLayout;
      }
    } else {
      frame.format = libavFrame.format ?? codecCtx.pixelFormat;
      frame.width = libavFrame.width ?? codecCtx.width;
      frame.height = libavFrame.height ?? codecCtx.height;
    }

    if (libavFrame.pts !== undefined) {
      frame.pts = BigInt(this.i64tof64(libavFrame.pts, libavFrame.ptshi || 0));
    }

    // Allocate frame buffer
    const ret = frame.getBuffer();
    if (ret < 0) {
      throw new FFmpegError(ret);
    }

    // Copy data
    const frameData = frame.data;
    if (frameData && libavFrame.data) {
      if (Array.isArray(libavFrame.data)) {
        // Planar data
        for (let i = 0; i < libavFrame.data.length && i < frameData.length; i++) {
          if (frameData[i] && libavFrame.data[i]) {
            const copyLen = Math.min(frameData[i].length, libavFrame.data[i].length);
            frameData[i].set(libavFrame.data[i].subarray(0, copyLen));
          }
        }
      } else {
        // Interleaved data
        if (frameData[0]) {
          const copyLen = Math.min(frameData[0].length, libavFrame.data.length);
          frameData[0].set(libavFrame.data.subarray(0, copyLen));
        }
      }
    }
  }

  /**
   * Convert node-av Packet to libav.js-compatible format
   */
  private packetToLibAV(packet: Packet): LibAVPacket {
    const data = packet.data;
    const packetData = data ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(0);

    const pts = Number(packet.pts);
    const dts = Number(packet.dts);
    const duration = Number(packet.duration);

    const [ptsLow, ptsHi] = this.f64toi64(pts);
    const [dtsLow, dtsHi] = this.f64toi64(dts);
    const [durLow, durHi] = this.f64toi64(duration);

    return {
      data: packetData.slice(), // Copy the data
      pts: ptsLow,
      ptshi: ptsHi,
      dts: dtsLow,
      dtshi: dtsHi,
      duration: durLow,
      durationhi: durHi,
      flags: packet.flags,
    };
  }

  /**
   * Check if sample format is planar
   */
  private isSampleFormatPlanar(format: AVSampleFormat): boolean {
    return format === AV_SAMPLE_FMT_U8P ||
           format === AV_SAMPLE_FMT_S16P ||
           format === AV_SAMPLE_FMT_S32P ||
           format === AV_SAMPLE_FMT_FLTP;
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
