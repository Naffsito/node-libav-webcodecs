/**
 * libavjs-napi - High-level JavaScript wrapper for the native NAPI bindings
 * Provides a libav.js-compatible API using native FFmpeg libraries
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the native module
const require_ = createRequire(import.meta.url);
const native = require_(path.join(__dirname, '..', 'zig-out', 'lib', 'libavjs.node'));

// Re-export constants
const AVERROR_EOF = native.AVERROR_EOF;
const AVERROR_EAGAIN = native.AVERROR_EAGAIN;
const EAGAIN = -11;

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

// Media types
const AVMEDIA_TYPE_AUDIO = native.AVMEDIA_TYPE_AUDIO;
const AVMEDIA_TYPE_VIDEO = native.AVMEDIA_TYPE_VIDEO;

/**
 * Initialize an encoder with all the bells and whistles.
 * Returns [AVCodec, AVCodecContext, AVFrame, AVPacket, frame_size]
 * @param {string} name - libav name of the codec
 * @param {object} opts - Encoder options
 */
function ff_init_encoder(name, opts = {}) {
    const codec = native.avcodec_find_encoder_by_name(name + '\0');
    if (codec === 0n || codec === 0) {
        throw new Error(`Codec not found: ${name}`);
    }

    const c = native.avcodec_alloc_context3(codec);
    if (c === 0n || c === 0) {
        throw new Error('Could not allocate codec context');
    }

    // Apply context properties
    const ctxProps = opts.ctx || {};
    for (const prop in ctxProps) {
        const setter = native[`AVCodecContext_${prop}_s`];
        if (setter) {
            setter(c, ctxProps[prop]);
        }
    }

    // Set time_base
    const time_base = opts.time_base || [1, 1000];
    native.AVCodecContext_time_base_s(c, time_base[0], time_base[1]);

    // Open codec
    const ret = native.avcodec_open2(c, codec);
    if (ret < 0) {
        native.avcodec_free_context_js(c);
        throw new Error(`Could not open codec: ${native.ff_error(ret)}`);
    }

    const frame = native.av_frame_alloc();
    if (frame === 0n || frame === 0) {
        native.avcodec_free_context_js(c);
        throw new Error('Could not allocate frame');
    }

    const pkt = native.av_packet_alloc();
    if (pkt === 0) {
        native.av_frame_free_js(frame);
        native.avcodec_free_context_js(c);
        throw new Error('Could not allocate packet');
    }

    const frame_size = native.AVCodecContext_frame_size(c);

    return [codec, c, frame, pkt, frame_size];
}

/**
 * Initialize a decoder with all the bells and whistles.
 * Returns [AVCodec, AVCodecContext, AVPacket, AVFrame]
 * @param {string|number} name - libav decoder identifier or name
 * @param {object} config - Decoder configuration
 */
function ff_init_decoder(name, config = {}) {
    if (typeof config === 'number') {
        config = { codecpar: config };
    }

    let codec;
    if (typeof name === 'string') {
        codec = native.avcodec_find_decoder_by_name(name + '\0');
    } else {
        codec = native.avcodec_find_decoder(name);
    }
    if (codec === 0) {
        throw new Error(`Codec not found: ${name}`);
    }

    const c = native.avcodec_alloc_context3(codec);
    if (c === 0) {
        throw new Error('Could not allocate codec context');
    }

    // Apply codec parameters if provided
    if (config.codecpar) {
        let codecparPtr = 0;
        let codecpar = config.codecpar;
        if (typeof codecpar === 'object') {
            codecparPtr = native.avcodec_parameters_alloc();
            if (codecparPtr === 0) {
                native.avcodec_free_context_js(c);
                throw new Error('Failed to allocate codec parameters');
            }
            ff_copyin_codecpar(codecparPtr, codecpar);
            codecpar = codecparPtr;
        }
        const ret = native.avcodec_parameters_to_context(c, codecpar);
        if (codecparPtr) {
            native.avcodec_parameters_free_js(codecparPtr);
        }
        if (ret < 0) {
            native.avcodec_free_context_js(c);
            throw new Error(`Could not set codec parameters: ${native.ff_error(ret)}`);
        }
    }

    // Set time_base if provided
    if (config.time_base) {
        native.AVCodecContext_time_base_s(c, config.time_base[0], config.time_base[1]);
    }

    // Open codec
    const ret = native.avcodec_open2(c, codec);
    if (ret < 0) {
        native.avcodec_free_context_js(c);
        throw new Error(`Could not open codec: ${native.ff_error(ret)}`);
    }

    const pkt = native.av_packet_alloc();
    if (pkt === 0) {
        native.avcodec_free_context_js(c);
        throw new Error('Could not allocate packet');
    }

    const frame = native.av_frame_alloc();
    if (frame === 0) {
        native.av_packet_free_js(pkt);
        native.avcodec_free_context_js(c);
        throw new Error('Could not allocate frame');
    }

    return [codec, c, pkt, frame];
}

/**
 * Free everything allocated by ff_init_encoder.
 */
function ff_free_encoder(c, frame, pkt) {
    native.av_frame_free_js(frame);
    native.av_packet_free_js(pkt);
    native.avcodec_free_context_js(c);
}

/**
 * Free everything allocated by ff_init_decoder.
 */
function ff_free_decoder(c, pkt, frame) {
    ff_free_encoder(c, frame, pkt);
}

/**
 * Copy out a frame from native memory to a JS object.
 * @param {number} framePtr - AVFrame pointer
 * @returns {object} Frame object
 */
function ff_copyout_frame(framePtr) {
    const nb_samples = native.AVFrame_nb_samples(framePtr);
    
    if (nb_samples === 0) {
        // Maybe a video frame?
        const width = native.AVFrame_width(framePtr);
        if (width) {
            return ff_copyout_frame_video(framePtr);
        }
    }

    // Audio frame
    const channels = native.AVFrame_channels(framePtr);
    const format = native.AVFrame_format(framePtr);
    
    const outFrame = {
        data: null,
        channel_layout: native.AVFrame_channel_layout(framePtr),
        channels: channels,
        format: format,
        nb_samples: nb_samples,
        pts: native.AVFrame_pts(framePtr),
        ptshi: 0,
        time_base_num: native.AVFrame_time_base_num(framePtr),
        time_base_den: native.AVFrame_time_base_den(framePtr),
        sample_rate: native.AVFrame_sample_rate(framePtr)
    };

    // Handle 64-bit pts (may be BigInt from native)
    const pts = Number(outFrame.pts);
    outFrame.pts = pts >>> 0;
    outFrame.ptshi = Math.floor(pts / 0x100000000) >>> 0;

    // Copy data based on format
    if (format >= 5 /* U8P */) {
        // Planar format
        const data = [];
        for (let ci = 0; ci < channels; ci++) {
            const inData = native.AVFrame_data_a(framePtr, BigInt(ci));
            let outData = null;
            switch (format) {
                case 5: // U8P
                    outData = native.copyout_u8(inData, BigInt(nb_samples));
                    break;
                case 6: // S16P
                    outData = native.copyout_s16(inData, BigInt(nb_samples));
                    break;
                case 7: // S32P
                    outData = native.copyout_s32(inData, BigInt(nb_samples));
                    break;
                case 8: // FLTP
                    outData = native.copyout_f32(inData, BigInt(nb_samples));
                    break;
            }
            if (outData) data.push(outData);
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
                outFrame.data = native.copyout_s16(inData, BigInt(ct));
                break;
            case 2: // S32
                outFrame.data = native.copyout_s32(inData, BigInt(ct));
                break;
            case 3: // FLT
                outFrame.data = native.copyout_f32(inData, BigInt(ct));
                break;
        }
    }

    return outFrame;
}

/**
 * Copy out a video frame.
 * @param {number} framePtr - AVFrame pointer
 * @returns {object} Frame object
 */
function ff_copyout_frame_video(framePtr) {
    const width = native.AVFrame_width(framePtr);
    const height = native.AVFrame_height(framePtr);
    const format = native.AVFrame_format(framePtr);
    
    const desc = native.av_pix_fmt_desc_get(format);
    const log2ch = native.AVPixFmtDescriptor_log2_chroma_h(desc);
    
    const layout = [];
    const pts = native.AVFrame_pts(framePtr);
    
    const outFrame = {
        data: null,
        layout: layout,
        width: width,
        height: height,
        crop: {
            top: native.AVFrame_crop_top(framePtr),
            bottom: native.AVFrame_crop_bottom(framePtr),
            left: native.AVFrame_crop_left(framePtr),
            right: native.AVFrame_crop_right(framePtr)
        },
        format: format,
        key_frame: native.AVFrame_key_frame(framePtr),
        pict_type: native.AVFrame_pict_type(framePtr),
        pts: pts >>> 0,
        ptshi: Math.floor(pts / 0x100000000) >>> 0,
        time_base_num: native.AVFrame_time_base_num(framePtr),
        time_base_den: native.AVFrame_time_base_den(framePtr),
        sample_aspect_ratio: [
            native.AVFrame_sample_aspect_ratio_num(framePtr),
            native.AVFrame_sample_aspect_ratio_den(framePtr)
        ]
    };

    // Figure out the data range
    let dataLo = BigInt(Number.MAX_SAFE_INTEGER);
    let dataHi = BigInt(0);
    for (let p = 0; p < 8; p++) {
        const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
        if (!linesize) break;
        const plane = native.AVFrame_data_a(framePtr, BigInt(p));
        if (plane < dataLo) dataLo = plane;
        let h = height;
        if (p === 1 || p === 2) h >>= log2ch;
        const planeEnd = plane + BigInt(linesize * h);
        if (planeEnd > dataHi) dataHi = planeEnd;
    }

    // Copy out that segment of data
    outFrame.data = native.copyout_u8(dataLo, dataHi - dataLo);

    // Describe the layout
    for (let p = 0; p < 8; p++) {
        const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
        if (!linesize) break;
        const plane = native.AVFrame_data_a(framePtr, BigInt(p));
        layout.push({
            offset: Number(plane - dataLo),
            stride: linesize
        });
    }

    return outFrame;
}

/**
 * Copy a frame into native memory.
 * @param {number} framePtr - AVFrame pointer
 * @param {object|number} frame - Frame object or AVFrame pointer
 */
function ff_copyin_frame(framePtr, frame) {
    if (typeof frame === 'number') {
        // This is a frame pointer, not a libav.js Frame
        native.av_frame_unref(framePtr);
        const ret = native.av_frame_ref(framePtr, frame);
        if (ret < 0) {
            throw new Error(`Failed to reference frame data: ${native.ff_error(ret)}`);
        }
        native.av_frame_unref(frame);
        native.av_frame_free_js(frame);
        return;
    }

    if (frame.width) {
        return ff_copyin_frame_video(framePtr, frame);
    }

    // Audio frame
    const format = frame.format;
    let channels = frame.channels;
    if (!channels && frame.channel_layout) {
        channels = 0;
        let cl = frame.channel_layout;
        while (cl) {
            if (cl & 1) channels++;
            cl >>>= 1;
        }
    }

    // Set frame properties
    if ('channel_layout' in frame) native.AVFrame_channel_layout_s(framePtr, BigInt(frame.channel_layout));
    if ('channels' in frame) native.AVFrame_channels_s(framePtr, frame.channels);
    if ('format' in frame) native.AVFrame_format_s(framePtr, frame.format);
    if ('pts' in frame) {
        const pts = (frame.ptshi || 0) * 0x100000000 + (frame.pts || 0);
        native.AVFrame_pts_s(framePtr, BigInt(pts));
    }
    if ('sample_rate' in frame) native.AVFrame_sample_rate_s(framePtr, frame.sample_rate);
    if ('time_base_num' in frame) {
        native.AVFrame_time_base_s(framePtr, frame.time_base_num, frame.time_base_den || 1);
    }

    let nb_samples;
    if (format >= 5 /* U8P */) {
        nb_samples = frame.data[0].length;
    } else {
        nb_samples = frame.data.length / channels;
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
    if (format >= 5 /* U8P */) {
        // Planar format
        for (let ci = 0; ci < channels; ci++) {
            const data = native.AVFrame_data_a(framePtr, BigInt(ci));
            const inData = frame.data[ci];
            switch (format) {
                case 5: // U8P
                    native.copyin_u8(data, inData);
                    break;
                case 6: // S16P
                    native.copyin_s16(data, inData);
                    break;
                case 7: // S32P
                    native.copyin_s32(data, inData);
                    break;
                case 8: // FLTP
                    native.copyin_f32(data, inData);
                    break;
            }
        }
    } else {
        // Interleaved format
        const data = native.AVFrame_data_a(framePtr, BigInt(0));
        switch (format) {
            case 0: // U8
                native.copyin_u8(data, frame.data);
                break;
            case 1: // S16
                native.copyin_s16(data, frame.data);
                break;
            case 2: // S32
                native.copyin_s32(data, frame.data);
                break;
            case 3: // FLT
                native.copyin_f32(data, frame.data);
                break;
        }
    }
}

/**
 * Copy a video frame into native memory.
 */
function ff_copyin_frame_video(framePtr, frame) {
    // Set frame properties
    if ('format' in frame) native.AVFrame_format_s(framePtr, frame.format);
    if ('height' in frame) native.AVFrame_height_s(framePtr, frame.height);
    if ('width' in frame) native.AVFrame_width_s(framePtr, frame.width);
    if ('key_frame' in frame) native.AVFrame_key_frame_s(framePtr, frame.key_frame);
    if ('pict_type' in frame) native.AVFrame_pict_type_s(framePtr, frame.pict_type);
    if ('pts' in frame) {
        const pts = (frame.ptshi || 0) * 0x100000000 + (frame.pts || 0);
        native.AVFrame_pts_s(framePtr, BigInt(pts));
    }
    if ('time_base_num' in frame) {
        native.AVFrame_time_base_s(framePtr, frame.time_base_num, frame.time_base_den || 1);
    }
    if ('sample_aspect_ratio' in frame) {
        native.AVFrame_sample_aspect_ratio_s(framePtr, frame.sample_aspect_ratio[0], frame.sample_aspect_ratio[1]);
    }

    const desc = native.av_pix_fmt_desc_get(frame.format);
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
    let layout = frame.layout;
    if (!layout) {
        layout = [];
        const flags = native.AVPixFmtDescriptor_flags(desc);
        const nbComponents = native.AVPixFmtDescriptor_nb_components(desc);
        let bpp = 1;
        if (!(flags & 0x10)) bpp *= nbComponents;

        let off = 0;
        for (let p = 0; p < 8; p++) {
            const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
            if (!linesize) break;
            let w = frame.width;
            let h = frame.height;
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
    for (let p = 0; p < layout.length; p++) {
        const lplane = layout[p];
        const linesize = native.AVFrame_linesize_a(framePtr, BigInt(p));
        const data = native.AVFrame_data_a(framePtr, BigInt(p));
        let h = frame.height;
        if (p === 1 || p === 2) h >>= log2ch;
        
        const stride = Math.min(lplane.stride, linesize);
        for (let y = 0; y < h; y++) {
            const srcOff = lplane.offset + y * lplane.stride;
            const dstOff = data + BigInt(y * linesize);
            native.copyin_u8(dstOff, frame.data.subarray(srcOff, srcOff + stride));
        }
    }
}

/**
 * Copy out a packet from native memory.
 * @param {number} pktPtr - AVPacket pointer
 * @returns {object} Packet object
 */
function ff_copyout_packet(pktPtr) {
    const size = native.AVPacket_size(pktPtr);
    const dataPtr = native.AVPacket_data(pktPtr);
    const pts = native.AVPacket_pts(pktPtr);
    const dts = native.AVPacket_dts(pktPtr);
    const duration = native.AVPacket_duration(pktPtr);

    return {
        data: size > 0 ? native.copyout_u8(dataPtr, BigInt(size)) : new Uint8Array(0),
        pts: Number(pts) >>> 0,
        ptshi: Math.floor(Number(pts) / 0x100000000) >>> 0,
        dts: Number(dts) >>> 0,
        dtshi: Math.floor(Number(dts) / 0x100000000) >>> 0,
        duration: Number(duration) >>> 0,
        durationhi: Math.floor(Number(duration) / 0x100000000) >>> 0,
        flags: native.AVPacket_flags(pktPtr),
        stream_index: native.AVPacket_stream_index(pktPtr),
        time_base_num: native.AVPacket_time_base_num(pktPtr),
        time_base_den: native.AVPacket_time_base_den(pktPtr)
    };
}

/**
 * Copy a packet into native memory.
 * @param {number} pktPtr - AVPacket pointer  
 * @param {object|number} packet - Packet object or AVPacket pointer
 */
function ff_copyin_packet(pktPtr, packet) {
    if (typeof packet === 'number') {
        // Copy from another packet
        // Not implemented for now
        return;
    }

    native.av_packet_unref(pktPtr);
    
    // Allocate new buffer for data and set up packet properly
    if (packet.data && packet.data.length > 0) {
        const ret = native.av_new_packet(pktPtr, packet.data.length);
        if (ret < 0) {
            throw new Error(`Failed to allocate packet buffer: ${native.ff_error(ret)}`);
        }
        // Copy data into the allocated buffer
        const dataPtr = native.AVPacket_data(pktPtr);
        native.copyin_u8(dataPtr, packet.data);
    }

    if ('pts' in packet) {
        const pts = (packet.ptshi || 0) * 0x100000000 + (packet.pts || 0);
        native.AVPacket_pts_s(pktPtr, BigInt(pts));
    }
    if ('dts' in packet) {
        const dts = (packet.dtshi || 0) * 0x100000000 + (packet.dts || 0);
        native.AVPacket_dts_s(pktPtr, BigInt(dts));
    }
    if ('duration' in packet) {
        const dur = (packet.durationhi || 0) * 0x100000000 + (packet.duration || 0);
        native.AVPacket_duration_s(pktPtr, BigInt(dur));
    }
    if ('flags' in packet) native.AVPacket_flags_s(pktPtr, packet.flags);
    if ('stream_index' in packet) native.AVPacket_stream_index_s(pktPtr, packet.stream_index);
    if ('time_base_num' in packet) {
        native.AVPacket_time_base_s(pktPtr, packet.time_base_num, packet.time_base_den || 1);
    }
}

/**
 * Copy codec parameters into native memory.
 */
function ff_copyin_codecpar(parPtr, codecpar) {
    if ('channels' in codecpar) native.AVCodecParameters_channels_s(parPtr, codecpar.channels);
    if ('sample_rate' in codecpar) native.AVCodecParameters_sample_rate_s(parPtr, codecpar.sample_rate);
    // Add more as needed
}

/**
 * Encode multiple frames at once.
 * @param {number} ctx - AVCodecContext pointer
 * @param {number} frame - AVFrame pointer
 * @param {number} pkt - AVPacket pointer
 * @param {Array} inFrames - Array of frames to encode
 * @param {boolean|object} config - Configuration or fin flag
 * @returns {Array} Array of encoded packets
 */
function ff_encode_multi(ctx, frame, pkt, inFrames, config = {}) {
    if (typeof config === 'boolean') {
        config = { fin: config };
    }

    const outPackets = [];
    const tbNum = native.AVCodecContext_time_base_num(ctx);
    const tbDen = native.AVCodecContext_time_base_den(ctx);

    function handleFrame(inFrame) {
        if (inFrame !== null) {
            ff_copyin_frame(frame, inFrame);
        }

        const ret = native.avcodec_send_frame(ctx, inFrame ? frame : 0n);
        if (ret < 0) {
            throw new Error(`Error sending frame to encoder: ${native.ff_error(ret)}`);
        }
        if (inFrame) {
            native.av_frame_unref(frame);
        }

        while (true) {
            const recvRet = native.avcodec_receive_packet(ctx, pkt);
            if (recvRet === EAGAIN || recvRet === AVERROR_EOF || recvRet === AVERROR_EAGAIN) {
                return;
            } else if (recvRet < 0) {
                throw new Error(`Error encoding frame: ${native.ff_error(recvRet)}`);
            }

            const outPkt = ff_copyout_packet(pkt);
            // Skip empty packets (some encoders produce trailing empty packets)
            if (outPkt.data.length > 0) {
                if (!outPkt.time_base_num) {
                    outPkt.time_base_num = tbNum;
                    outPkt.time_base_den = tbDen;
                }
                outPackets.push(outPkt);
            }
            native.av_packet_unref(pkt);
        }
    }

    inFrames.forEach(handleFrame);

    if (config.fin) {
        handleFrame(null);
    }

    return outPackets;
}

/**
 * Decode multiple packets at once.
 * @param {number} ctx - AVCodecContext pointer
 * @param {number} pkt - AVPacket pointer
 * @param {number} frame - AVFrame pointer
 * @param {Array} inPackets - Array of packets to decode
 * @param {boolean|object} config - Configuration or fin flag
 * @returns {Array} Array of decoded frames
 */
function ff_decode_multi(ctx, pkt, frame, inPackets, config = {}) {
    if (typeof config === 'boolean') {
        config = { fin: config };
    }

    const outFrames = [];
    const tbNum = native.AVCodecContext_time_base_num(ctx);
    const tbDen = native.AVCodecContext_time_base_den(ctx);

    function handlePacket(inPacket) {
        let ret;

        if (inPacket !== null) {
            ret = native.av_packet_make_writable(pkt);
            if (ret < 0) {
                throw new Error(`Failed to make packet writable: ${native.ff_error(ret)}`);
            }
            ff_copyin_packet(pkt, inPacket);
        } else {
            native.av_packet_unref(pkt);
        }

        ret = native.avcodec_send_packet(ctx, inPacket ? pkt : 0n);
        if (ret < 0) {
            if (!config.ignoreErrors) {
                throw new Error(`Error submitting packet to decoder: ${native.ff_error(ret)}`);
            } else {
                console.log(`Decoder error (ignored): ${native.ff_error(ret)}`);
                native.av_packet_unref(pkt);
                return;
            }
        }
        native.av_packet_unref(pkt);

        while (true) {
            ret = native.avcodec_receive_frame(ctx, frame);
            if (ret === EAGAIN || ret === AVERROR_EOF || ret === AVERROR_EAGAIN) {
                return;
            } else if (ret < 0) {
                throw new Error(`Error decoding frame: ${native.ff_error(ret)}`);
            }

            const outFrame = ff_copyout_frame(frame);
            if (!outFrame.time_base_num) {
                outFrame.time_base_num = tbNum;
                outFrame.time_base_den = tbDen;
            }
            outFrames.push(outFrame);
            native.av_frame_unref(frame);
        }
    }

    inPackets.forEach(handlePacket);

    if (config.fin) {
        handlePacket(null);
    }

    return outFrames;
}

// Export everything
export {
    // Native module
    native,
    
    // Constants
    AVERROR_EOF,
    AVERROR_EAGAIN,
    EAGAIN,
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

    // High-level functions
    ff_init_encoder,
    ff_init_decoder,
    ff_free_encoder,
    ff_free_decoder,
    ff_encode_multi,
    ff_decode_multi,
    ff_copyout_frame,
    ff_copyout_frame_video,
    ff_copyin_frame,
    ff_copyout_packet,
    ff_copyin_packet,
};

// Default export with everything including native functions
export default {
    native,
    AVERROR_EOF,
    AVERROR_EAGAIN,
    EAGAIN,
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
    ff_init_encoder,
    ff_init_decoder,
    ff_free_encoder,
    ff_free_decoder,
    ff_encode_multi,
    ff_decode_multi,
    ff_copyout_frame,
    ff_copyout_frame_video,
    ff_copyin_frame,
    ff_copyout_packet,
    ff_copyin_packet,
    ...native
};
