const std = @import("std");
const napigen = @import("napigen");

// Import FFmpeg C headers and system headers
const c = @cImport({
    @cInclude("errno.h");
    @cInclude("libavcodec/avcodec.h");
    @cInclude("libavformat/avformat.h");
    @cInclude("libavutil/avutil.h");
    @cInclude("libavutil/frame.h");
    @cInclude("libavutil/channel_layout.h");
    @cInclude("libavutil/pixdesc.h");
    @cInclude("libavutil/opt.h");
    @cInclude("libswscale/swscale.h");
    @cInclude("libswresample/swresample.h");
});

// ============================================================================
// Constants
// ============================================================================

// Error codes
pub const AVERROR_EOF: i32 = c.AVERROR_EOF;
pub const AVERROR_EAGAIN: i32 = -c.EAGAIN; // Use system's EAGAIN (35 on macOS, 11 on Linux)

// Sample formats
pub const AV_SAMPLE_FMT_U8: i32 = c.AV_SAMPLE_FMT_U8;
pub const AV_SAMPLE_FMT_S16: i32 = c.AV_SAMPLE_FMT_S16;
pub const AV_SAMPLE_FMT_S32: i32 = c.AV_SAMPLE_FMT_S32;
pub const AV_SAMPLE_FMT_FLT: i32 = c.AV_SAMPLE_FMT_FLT;
pub const AV_SAMPLE_FMT_U8P: i32 = c.AV_SAMPLE_FMT_U8P;
pub const AV_SAMPLE_FMT_S16P: i32 = c.AV_SAMPLE_FMT_S16P;
pub const AV_SAMPLE_FMT_S32P: i32 = c.AV_SAMPLE_FMT_S32P;
pub const AV_SAMPLE_FMT_FLTP: i32 = c.AV_SAMPLE_FMT_FLTP;

// Pixel formats
pub const AV_PIX_FMT_YUV420P: i32 = c.AV_PIX_FMT_YUV420P;
pub const AV_PIX_FMT_YUV422P: i32 = c.AV_PIX_FMT_YUV422P;
pub const AV_PIX_FMT_YUV444P: i32 = c.AV_PIX_FMT_YUV444P;
pub const AV_PIX_FMT_RGBA: i32 = c.AV_PIX_FMT_RGBA;
pub const AV_PIX_FMT_BGRA: i32 = c.AV_PIX_FMT_BGRA;
pub const AV_PIX_FMT_NV12: i32 = c.AV_PIX_FMT_NV12;

// Media types
pub const AVMEDIA_TYPE_AUDIO: i32 = c.AVMEDIA_TYPE_AUDIO;
pub const AVMEDIA_TYPE_VIDEO: i32 = c.AVMEDIA_TYPE_VIDEO;

// ============================================================================
// Codec functions
// ============================================================================

/// Find an encoder by name. Returns pointer as usize (0 if not found).
pub fn avcodec_find_encoder_by_name(name: []const u8) usize {
    const codec = c.avcodec_find_encoder_by_name(@ptrCast(name.ptr));
    return @intFromPtr(codec);
}

/// Find a decoder by name. Returns pointer as usize (0 if not found).
pub fn avcodec_find_decoder_by_name(name: []const u8) usize {
    const codec = c.avcodec_find_decoder_by_name(@ptrCast(name.ptr));
    return @intFromPtr(codec);
}

/// Find an encoder by ID. Returns pointer as usize.
pub fn avcodec_find_encoder(id: i32) usize {
    const codec = c.avcodec_find_encoder(@intCast(id));
    return @intFromPtr(codec);
}

/// Find a decoder by ID. Returns pointer as usize.
pub fn avcodec_find_decoder(id: i32) usize {
    const codec = c.avcodec_find_decoder(@intCast(id));
    return @intFromPtr(codec);
}

/// Allocate a codec context. Returns pointer as usize.
pub fn avcodec_alloc_context3(codec_ptr: usize) usize {
    const codec: ?*const c.AVCodec = @ptrFromInt(codec_ptr);
    const ctx = c.avcodec_alloc_context3(codec);
    return @intFromPtr(ctx);
}

/// Free a codec context.
pub fn avcodec_free_context_js(ctx_ptr: usize) void {
    var ctx: ?*c.AVCodecContext = @ptrFromInt(ctx_ptr);
    c.avcodec_free_context(&ctx);
}

/// Open a codec. Returns error code.
pub fn avcodec_open2(ctx_ptr: usize, codec_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const codec: ?*const c.AVCodec = @ptrFromInt(codec_ptr);
    return c.avcodec_open2(ctx, codec, null);
}

/// Send a frame to the encoder. frame_ptr=0 for flush.
pub fn avcodec_send_frame(ctx_ptr: usize, frame_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const frame: ?*const c.AVFrame = if (frame_ptr == 0) null else @ptrFromInt(frame_ptr);
    return c.avcodec_send_frame(ctx, frame);
}

/// Receive a packet from the encoder.
pub fn avcodec_receive_packet(ctx_ptr: usize, pkt_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return c.avcodec_receive_packet(ctx, pkt);
}

/// Send a packet to the decoder. pkt_ptr=0 for flush.
pub fn avcodec_send_packet(ctx_ptr: usize, pkt_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const pkt: ?*const c.AVPacket = if (pkt_ptr == 0) null else @ptrFromInt(pkt_ptr);
    return c.avcodec_send_packet(ctx, pkt);
}

/// Receive a frame from the decoder.
pub fn avcodec_receive_frame(ctx_ptr: usize, frame_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return c.avcodec_receive_frame(ctx, frame);
}

// ============================================================================
// AVCodecContext accessors
// ============================================================================

pub fn AVCodecContext_codec_id(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return @intCast(ctx.codec_id);
}

pub fn AVCodecContext_codec_id_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.codec_id = @intCast(val);
}

pub fn AVCodecContext_codec_type(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return @intCast(ctx.codec_type);
}

pub fn AVCodecContext_codec_type_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.codec_type = @intCast(val);
}

pub fn AVCodecContext_width(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.width;
}

pub fn AVCodecContext_width_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.width = val;
}

pub fn AVCodecContext_height(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.height;
}

pub fn AVCodecContext_height_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.height = val;
}

pub fn AVCodecContext_pix_fmt(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return @intCast(ctx.pix_fmt);
}

pub fn AVCodecContext_pix_fmt_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.pix_fmt = @intCast(val);
}

pub fn AVCodecContext_sample_fmt(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return @intCast(ctx.sample_fmt);
}

pub fn AVCodecContext_sample_fmt_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.sample_fmt = @intCast(val);
}

pub fn AVCodecContext_sample_rate(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.sample_rate;
}

pub fn AVCodecContext_sample_rate_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.sample_rate = val;
}

pub fn AVCodecContext_channels(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.ch_layout.nb_channels;
}

pub fn AVCodecContext_channels_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.ch_layout.nb_channels = val;
}

pub fn AVCodecContext_channel_layout(ctx_ptr: usize) u64 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.ch_layout.u.mask;
}

pub fn AVCodecContext_channel_layout_s(ctx_ptr: usize, val: u64) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    c.av_channel_layout_uninit(&ctx.ch_layout);
    _ = c.av_channel_layout_from_mask(&ctx.ch_layout, val);
}

pub fn AVCodecContext_frame_size(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.frame_size;
}

pub fn AVCodecContext_frame_size_s(ctx_ptr: usize, val: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.frame_size = val;
}

pub fn AVCodecContext_bit_rate(ctx_ptr: usize) i64 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.bit_rate;
}

pub fn AVCodecContext_bit_rate_s(ctx_ptr: usize, val: i64) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.bit_rate = val;
}

pub fn AVCodecContext_time_base_num(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.time_base.num;
}

pub fn AVCodecContext_time_base_den(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.time_base.den;
}

pub fn AVCodecContext_time_base_s(ctx_ptr: usize, num: i32, den: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.time_base = .{ .num = num, .den = den };
}

pub fn AVCodecContext_framerate_num(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.framerate.num;
}

pub fn AVCodecContext_framerate_den(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.framerate.den;
}

pub fn AVCodecContext_framerate_s(ctx_ptr: usize, num: i32, den: i32) void {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    ctx.framerate = .{ .num = num, .den = den };
}

pub fn AVCodecContext_extradata(ctx_ptr: usize) usize {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return @intFromPtr(ctx.extradata);
}

pub fn AVCodecContext_extradata_size(ctx_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return ctx.extradata_size;
}

// ============================================================================
// AVFrame functions
// ============================================================================

/// Allocate a frame. Returns pointer as usize.
pub fn av_frame_alloc() usize {
    const frame = c.av_frame_alloc();
    return @intFromPtr(frame);
}

/// Free a frame.
pub fn av_frame_free_js(frame_ptr: usize) void {
    var frame: ?*c.AVFrame = @ptrFromInt(frame_ptr);
    c.av_frame_free(&frame);
}

/// Unreference a frame.
pub fn av_frame_unref(frame_ptr: usize) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    c.av_frame_unref(frame);
}

/// Clone a frame.
pub fn av_frame_clone(frame_ptr: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    const cloned = c.av_frame_clone(frame);
    return @intFromPtr(cloned);
}

/// Reference a frame.
pub fn av_frame_ref(dst_ptr: usize, src_ptr: usize) i32 {
    const dst: *c.AVFrame = @ptrFromInt(dst_ptr);
    const src: *const c.AVFrame = @ptrFromInt(src_ptr);
    return c.av_frame_ref(dst, src);
}

/// Get buffer for a frame.
pub fn av_frame_get_buffer(frame_ptr: usize, align_val: i32) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return c.av_frame_get_buffer(frame, align_val);
}

/// Make frame writable.
pub fn av_frame_make_writable(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return c.av_frame_make_writable(frame);
}

// ============================================================================
// AVFrame accessors
// ============================================================================

pub fn AVFrame_format(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.format;
}

pub fn AVFrame_format_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.format = val;
}

pub fn AVFrame_width(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.width;
}

pub fn AVFrame_width_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.width = val;
}

pub fn AVFrame_height(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.height;
}

pub fn AVFrame_height_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.height = val;
}

pub fn AVFrame_nb_samples(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.nb_samples;
}

pub fn AVFrame_nb_samples_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.nb_samples = val;
}

pub fn AVFrame_sample_rate(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.sample_rate;
}

pub fn AVFrame_sample_rate_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.sample_rate = val;
}

pub fn AVFrame_channels(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.ch_layout.nb_channels;
}

pub fn AVFrame_channels_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.ch_layout.nb_channels = val;
}

pub fn AVFrame_channel_layout(frame_ptr: usize) u64 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.ch_layout.u.mask;
}

pub fn AVFrame_channel_layout_s(frame_ptr: usize, val: u64) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    c.av_channel_layout_uninit(&frame.ch_layout);
    _ = c.av_channel_layout_from_mask(&frame.ch_layout, val);
}

pub fn AVFrame_pts(frame_ptr: usize) i64 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.pts;
}

pub fn AVFrame_pts_s(frame_ptr: usize, val: i64) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.pts = val;
}

pub fn AVFrame_key_frame(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return if ((frame.flags & c.AV_FRAME_FLAG_KEY) != 0) 1 else 0;
}

pub fn AVFrame_key_frame_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    if (val != 0) {
        frame.flags |= c.AV_FRAME_FLAG_KEY;
    } else {
        frame.flags &= ~@as(c_int, c.AV_FRAME_FLAG_KEY);
    }
}

pub fn AVFrame_pict_type(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return @intCast(frame.pict_type);
}

pub fn AVFrame_pict_type_s(frame_ptr: usize, val: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.pict_type = @intCast(val);
}

pub fn AVFrame_linesize_a(frame_ptr: usize, idx: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.linesize[idx];
}

pub fn AVFrame_data_a(frame_ptr: usize, idx: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return @intFromPtr(frame.data[idx]);
}

pub fn AVFrame_sample_aspect_ratio_num(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.sample_aspect_ratio.num;
}

pub fn AVFrame_sample_aspect_ratio_den(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.sample_aspect_ratio.den;
}

pub fn AVFrame_sample_aspect_ratio_s(frame_ptr: usize, num: i32, den: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.sample_aspect_ratio = .{ .num = num, .den = den };
}

pub fn AVFrame_crop_top(frame_ptr: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.crop_top;
}

pub fn AVFrame_crop_bottom(frame_ptr: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.crop_bottom;
}

pub fn AVFrame_crop_left(frame_ptr: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.crop_left;
}

pub fn AVFrame_crop_right(frame_ptr: usize) usize {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.crop_right;
}

pub fn AVFrame_time_base_num(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.time_base.num;
}

pub fn AVFrame_time_base_den(frame_ptr: usize) i32 {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    return frame.time_base.den;
}

pub fn AVFrame_time_base_s(frame_ptr: usize, num: i32, den: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    frame.time_base = .{ .num = num, .den = den };
}

// ============================================================================
// AVPacket functions
// ============================================================================

/// Allocate a packet. Returns pointer as usize.
pub fn av_packet_alloc() usize {
    const pkt = c.av_packet_alloc();
    return @intFromPtr(pkt);
}

/// Free a packet.
pub fn av_packet_free_js(pkt_ptr: usize) void {
    var pkt: ?*c.AVPacket = @ptrFromInt(pkt_ptr);
    c.av_packet_free(&pkt);
}

/// Unreference a packet.
pub fn av_packet_unref(pkt_ptr: usize) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    c.av_packet_unref(pkt);
}

/// Make packet writable.
pub fn av_packet_make_writable(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return c.av_packet_make_writable(pkt);
}

/// Allocate packet buffer with given size.
pub fn av_new_packet(pkt_ptr: usize, size: i32) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return c.av_new_packet(pkt, size);
}

// ============================================================================
// AVPacket accessors
// ============================================================================

pub fn AVPacket_data(pkt_ptr: usize) usize {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return @intFromPtr(pkt.data);
}

pub fn AVPacket_size(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.size;
}

pub fn AVPacket_pts(pkt_ptr: usize) i64 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.pts;
}

pub fn AVPacket_pts_s(pkt_ptr: usize, val: i64) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.pts = val;
}

pub fn AVPacket_dts(pkt_ptr: usize) i64 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.dts;
}

pub fn AVPacket_dts_s(pkt_ptr: usize, val: i64) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.dts = val;
}

pub fn AVPacket_duration(pkt_ptr: usize) i64 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.duration;
}

pub fn AVPacket_duration_s(pkt_ptr: usize, val: i64) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.duration = val;
}

pub fn AVPacket_flags(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.flags;
}

pub fn AVPacket_flags_s(pkt_ptr: usize, val: i32) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.flags = val;
}

pub fn AVPacket_stream_index(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.stream_index;
}

pub fn AVPacket_stream_index_s(pkt_ptr: usize, val: i32) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.stream_index = val;
}

pub fn AVPacket_time_base_num(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.time_base.num;
}

pub fn AVPacket_time_base_den(pkt_ptr: usize) i32 {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    return pkt.time_base.den;
}

pub fn AVPacket_time_base_s(pkt_ptr: usize, num: i32, den: i32) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    pkt.time_base = .{ .num = num, .den = den };
}

// ============================================================================
// Codec parameters
// ============================================================================

pub fn avcodec_parameters_alloc() usize {
    const par = c.avcodec_parameters_alloc();
    return @intFromPtr(par);
}

pub fn avcodec_parameters_free_js(par_ptr: usize) void {
    var par: ?*c.AVCodecParameters = @ptrFromInt(par_ptr);
    c.avcodec_parameters_free(&par);
}

pub fn avcodec_parameters_to_context(ctx_ptr: usize, par_ptr: usize) i32 {
    const ctx: *c.AVCodecContext = @ptrFromInt(ctx_ptr);
    const par: *const c.AVCodecParameters = @ptrFromInt(par_ptr);
    return c.avcodec_parameters_to_context(ctx, par);
}

pub fn avcodec_parameters_from_context(par_ptr: usize, ctx_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    const ctx: *const c.AVCodecContext = @ptrFromInt(ctx_ptr);
    return c.avcodec_parameters_from_context(par, ctx);
}

// ============================================================================
// AVCodecParameters accessors
// ============================================================================

pub fn AVCodecParameters_codec_id(par_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return @intCast(par.codec_id);
}

pub fn AVCodecParameters_codec_type(par_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return @intCast(par.codec_type);
}

pub fn AVCodecParameters_channels(par_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return par.ch_layout.nb_channels;
}

pub fn AVCodecParameters_channels_s(par_ptr: usize, val: i32) void {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    par.ch_layout.nb_channels = val;
}

pub fn AVCodecParameters_sample_rate(par_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return par.sample_rate;
}

pub fn AVCodecParameters_sample_rate_s(par_ptr: usize, val: i32) void {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    par.sample_rate = val;
}

pub fn AVCodecParameters_extradata(par_ptr: usize) usize {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return @intFromPtr(par.extradata);
}

pub fn AVCodecParameters_extradata_size(par_ptr: usize) i32 {
    const par: *c.AVCodecParameters = @ptrFromInt(par_ptr);
    return par.extradata_size;
}

// ============================================================================
// Pixel format descriptors
// ============================================================================

pub fn av_pix_fmt_desc_get(pix_fmt: i32) usize {
    const desc = c.av_pix_fmt_desc_get(@intCast(pix_fmt));
    return @intFromPtr(desc);
}

pub fn AVPixFmtDescriptor_flags(desc_ptr: usize) u64 {
    const desc: *const c.AVPixFmtDescriptor = @ptrFromInt(desc_ptr);
    return desc.flags;
}

pub fn AVPixFmtDescriptor_nb_components(desc_ptr: usize) u8 {
    const desc: *const c.AVPixFmtDescriptor = @ptrFromInt(desc_ptr);
    return desc.nb_components;
}

pub fn AVPixFmtDescriptor_log2_chroma_h(desc_ptr: usize) u8 {
    const desc: *const c.AVPixFmtDescriptor = @ptrFromInt(desc_ptr);
    return desc.log2_chroma_h;
}

pub fn AVPixFmtDescriptor_log2_chroma_w(desc_ptr: usize) u8 {
    const desc: *const c.AVPixFmtDescriptor = @ptrFromInt(desc_ptr);
    return desc.log2_chroma_w;
}

// ============================================================================
// Memory copy operations
// ============================================================================

/// Copy bytes from native memory to JS. Returns a slice view.
pub fn copyout_u8(js: *napigen.JsContext, ptr: usize, size: usize) napigen.Error!napigen.napi_value {
    if (ptr == 0) return js.@"null"();
    const data: [*]const u8 = @ptrFromInt(ptr);
    const slice = data[0..size];
    // Create an ArrayBuffer and copy the data
    var result: napigen.napi_value = undefined;
    var buffer_data: ?*anyopaque = undefined;
    try napigen.check(napigen.napi.napi_create_arraybuffer(js.env, size, &buffer_data, &result));
    if (buffer_data) |buf| {
        const dest: [*]u8 = @ptrCast(@alignCast(buf));
        @memcpy(dest[0..size], slice);
    }
    // Create Uint8Array view
    var typed_array: napigen.napi_value = undefined;
    try napigen.check(napigen.napi.napi_create_typedarray(js.env, napigen.napi.napi_uint8_array, size, result, 0, &typed_array));
    return typed_array;
}

/// Copy bytes from JS to native memory (safe for aliased memory).
pub fn copyin_u8(js: *napigen.JsContext, ptr: usize, data: napigen.napi_value) napigen.Error!void {
    if (ptr == 0) return;
    const dest: [*]u8 = @ptrFromInt(ptr);

    // Get the typed array info
    var array_type: napigen.napi.napi_typedarray_type = undefined;
    var length: usize = undefined;
    var array_data: ?*anyopaque = undefined;
    var arraybuffer: napigen.napi_value = undefined;
    var byte_offset: usize = undefined;
    try napigen.check(napigen.napi.napi_get_typedarray_info(js.env, data, &array_type, &length, &array_data, &arraybuffer, &byte_offset));

    if (array_data) |src_ptr| {
        const src: [*]const u8 = @ptrCast(@alignCast(src_ptr));
        // Use copyForwards which handles overlapping memory
        for (0..length) |i| {
            dest[i] = src[i];
        }
    }
}

/// Copy int16 from native memory to JS.
pub fn copyout_s16(js: *napigen.JsContext, ptr: usize, count: usize) napigen.Error!napigen.napi_value {
    if (ptr == 0) return js.@"null"();
    const byte_size = count * 2;
    var result: napigen.napi_value = undefined;
    var buffer_data: ?*anyopaque = undefined;
    try napigen.check(napigen.napi.napi_create_arraybuffer(js.env, byte_size, &buffer_data, &result));
    if (buffer_data) |buf| {
        const src: [*]const u8 = @ptrFromInt(ptr);
        const dest: [*]u8 = @ptrCast(@alignCast(buf));
        @memcpy(dest[0..byte_size], src[0..byte_size]);
    }
    var typed_array: napigen.napi_value = undefined;
    try napigen.check(napigen.napi.napi_create_typedarray(js.env, napigen.napi.napi_int16_array, count, result, 0, &typed_array));
    return typed_array;
}

/// Copy int32 from native memory to JS.
pub fn copyout_s32(js: *napigen.JsContext, ptr: usize, count: usize) napigen.Error!napigen.napi_value {
    if (ptr == 0) return js.@"null"();
    const byte_size = count * 4;
    var result: napigen.napi_value = undefined;
    var buffer_data: ?*anyopaque = undefined;
    try napigen.check(napigen.napi.napi_create_arraybuffer(js.env, byte_size, &buffer_data, &result));
    if (buffer_data) |buf| {
        const src: [*]const u8 = @ptrFromInt(ptr);
        const dest: [*]u8 = @ptrCast(@alignCast(buf));
        @memcpy(dest[0..byte_size], src[0..byte_size]);
    }
    var typed_array: napigen.napi_value = undefined;
    try napigen.check(napigen.napi.napi_create_typedarray(js.env, napigen.napi.napi_int32_array, count, result, 0, &typed_array));
    return typed_array;
}

/// Copy float32 from native memory to JS.
pub fn copyout_f32(js: *napigen.JsContext, ptr: usize, count: usize) napigen.Error!napigen.napi_value {
    if (ptr == 0) return js.@"null"();
    const byte_size = count * 4;
    var result: napigen.napi_value = undefined;
    var buffer_data: ?*anyopaque = undefined;
    try napigen.check(napigen.napi.napi_create_arraybuffer(js.env, byte_size, &buffer_data, &result));
    if (buffer_data) |buf| {
        const src: [*]const u8 = @ptrFromInt(ptr);
        const dest: [*]u8 = @ptrCast(@alignCast(buf));
        @memcpy(dest[0..byte_size], src[0..byte_size]);
    }
    var typed_array: napigen.napi_value = undefined;
    try napigen.check(napigen.napi.napi_create_typedarray(js.env, napigen.napi.napi_float32_array, count, result, 0, &typed_array));
    return typed_array;
}

/// Get the element size in bytes for a typed array type.
fn getTypedArrayElementSize(array_type: napigen.napi.napi_typedarray_type) usize {
    // napi_typedarray_type is a c_uint with values:
    // 0 = int8, 1 = uint8, 2 = uint8_clamped, 3 = int16, 4 = uint16,
    // 5 = int32, 6 = uint32, 7 = float32, 8 = float64, 9 = bigint64, 10 = biguint64
    return switch (array_type) {
        0, 1, 2 => 1, // int8, uint8, uint8_clamped
        3, 4 => 2, // int16, uint16
        5, 6, 7 => 4, // int32, uint32, float32
        8, 9, 10 => 8, // float64, bigint64, biguint64
        else => 1,
    };
}

/// Copy int16 from JS to native memory (safe for aliased memory).
/// Handles any typed array input by calculating actual byte length.
pub fn copyin_s16(js: *napigen.JsContext, ptr: usize, data: napigen.napi_value) napigen.Error!void {
    if (ptr == 0) return;
    var array_type: napigen.napi.napi_typedarray_type = undefined;
    var length: usize = undefined;
    var array_data: ?*anyopaque = undefined;
    var arraybuffer: napigen.napi_value = undefined;
    var byte_offset: usize = undefined;
    try napigen.check(napigen.napi.napi_get_typedarray_info(js.env, data, &array_type, &length, &array_data, &arraybuffer, &byte_offset));
    if (array_data) |src_ptr| {
        // Calculate actual byte size based on the array type
        const element_size = getTypedArrayElementSize(array_type);
        const byte_size = length * element_size;
        const src: [*]const u8 = @ptrCast(@alignCast(src_ptr));
        const dest: [*]u8 = @ptrFromInt(ptr);
        for (0..byte_size) |i| {
            dest[i] = src[i];
        }
    }
}

/// Copy int32 from JS to native memory (safe for aliased memory).
/// Handles any typed array input by calculating actual byte length.
pub fn copyin_s32(js: *napigen.JsContext, ptr: usize, data: napigen.napi_value) napigen.Error!void {
    if (ptr == 0) return;
    var array_type: napigen.napi.napi_typedarray_type = undefined;
    var length: usize = undefined;
    var array_data: ?*anyopaque = undefined;
    var arraybuffer: napigen.napi_value = undefined;
    var byte_offset: usize = undefined;
    try napigen.check(napigen.napi.napi_get_typedarray_info(js.env, data, &array_type, &length, &array_data, &arraybuffer, &byte_offset));
    if (array_data) |src_ptr| {
        // Calculate actual byte size based on the array type
        const element_size = getTypedArrayElementSize(array_type);
        const byte_size = length * element_size;
        const src: [*]const u8 = @ptrCast(@alignCast(src_ptr));
        const dest: [*]u8 = @ptrFromInt(ptr);
        for (0..byte_size) |i| {
            dest[i] = src[i];
        }
    }
}

/// Copy float32 from JS to native memory (safe for aliased memory).
/// Handles any typed array input by calculating actual byte length.
pub fn copyin_f32(js: *napigen.JsContext, ptr: usize, data: napigen.napi_value) napigen.Error!void {
    if (ptr == 0) return;
    var array_type: napigen.napi.napi_typedarray_type = undefined;
    var length: usize = undefined;
    var array_data: ?*anyopaque = undefined;
    var arraybuffer: napigen.napi_value = undefined;
    var byte_offset: usize = undefined;
    try napigen.check(napigen.napi.napi_get_typedarray_info(js.env, data, &array_type, &length, &array_data, &arraybuffer, &byte_offset));
    if (array_data) |src_ptr| {
        // Calculate actual byte size based on the array type
        const element_size = getTypedArrayElementSize(array_type);
        const byte_size = length * element_size;
        const src: [*]const u8 = @ptrCast(@alignCast(src_ptr));
        const dest: [*]u8 = @ptrFromInt(ptr);
        for (0..byte_size) |i| {
            dest[i] = src[i];
        }
    }
}

// ============================================================================
// Utility functions
// ============================================================================

var err_buf: [256]u8 = undefined;

pub fn ff_error(errnum: i32) []const u8 {
    const ret = c.av_strerror(errnum, &err_buf, err_buf.len - 1);
    if (ret < 0) {
        return "Unknown error";
    }
    const len = std.mem.indexOfScalar(u8, &err_buf, 0) orelse err_buf.len;
    return err_buf[0..len];
}

/// Rescale packet timestamps
pub fn av_packet_rescale_ts_js(pkt_ptr: usize, src_num: i32, src_den: i32, dst_num: i32, dst_den: i32) void {
    const pkt: *c.AVPacket = @ptrFromInt(pkt_ptr);
    const src = c.AVRational{ .num = src_num, .den = src_den };
    const dst = c.AVRational{ .num = dst_num, .den = dst_den };
    c.av_packet_rescale_ts(pkt, src, dst);
}

/// Rescale frame timestamps
pub fn ff_frame_rescale_ts_js(frame_ptr: usize, src_num: i32, src_den: i32, dst_num: i32, dst_den: i32) void {
    const frame: *c.AVFrame = @ptrFromInt(frame_ptr);
    const src = c.AVRational{ .num = src_num, .den = src_den };
    const dst = c.AVRational{ .num = dst_num, .den = dst_den };
    if (frame.pts != c.AV_NOPTS_VALUE) {
        frame.pts = c.av_rescale_q(frame.pts, src, dst);
    }
}

// ============================================================================
// Swscale functions
// ============================================================================

pub fn sws_getContext(src_w: i32, src_h: i32, src_fmt: i32, dst_w: i32, dst_h: i32, dst_fmt: i32, flags: i32) usize {
    const ctx = c.sws_getContext(src_w, src_h, @intCast(src_fmt), dst_w, dst_h, @intCast(dst_fmt), flags, null, null, null);
    return @intFromPtr(ctx);
}

pub fn sws_freeContext(ctx_ptr: usize) void {
    const ctx: ?*c.SwsContext = @ptrFromInt(ctx_ptr);
    c.sws_freeContext(ctx);
}

pub fn sws_scale_frame(ctx_ptr: usize, dst_ptr: usize, src_ptr: usize) i32 {
    const ctx: *c.SwsContext = @ptrFromInt(ctx_ptr);
    const dst: *c.AVFrame = @ptrFromInt(dst_ptr);
    const src: *const c.AVFrame = @ptrFromInt(src_ptr);
    return c.sws_scale_frame(ctx, dst, src);
}

// ============================================================================
// Memory allocation (for extradata, etc.)
// ============================================================================

pub fn av_malloc(size: usize) usize {
    const ptr = c.av_malloc(size);
    return @intFromPtr(ptr);
}

pub fn av_free(ptr: usize) void {
    c.av_free(@ptrFromInt(ptr));
}

// ============================================================================
// Module initialization
// ============================================================================

comptime {
    napigen.defineModule(initModule);
}

fn initModule(js: *napigen.JsContext, exports: napigen.napi_value) anyerror!napigen.napi_value {
    // Constants
    try js.setNamedProperty(exports, "AVERROR_EOF", try js.write(AVERROR_EOF));
    try js.setNamedProperty(exports, "AVERROR_EAGAIN", try js.write(AVERROR_EAGAIN));

    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_U8", try js.write(AV_SAMPLE_FMT_U8));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_S16", try js.write(AV_SAMPLE_FMT_S16));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_S32", try js.write(AV_SAMPLE_FMT_S32));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_FLT", try js.write(AV_SAMPLE_FMT_FLT));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_U8P", try js.write(AV_SAMPLE_FMT_U8P));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_S16P", try js.write(AV_SAMPLE_FMT_S16P));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_S32P", try js.write(AV_SAMPLE_FMT_S32P));
    try js.setNamedProperty(exports, "AV_SAMPLE_FMT_FLTP", try js.write(AV_SAMPLE_FMT_FLTP));

    try js.setNamedProperty(exports, "AV_PIX_FMT_YUV420P", try js.write(AV_PIX_FMT_YUV420P));
    try js.setNamedProperty(exports, "AV_PIX_FMT_YUV422P", try js.write(AV_PIX_FMT_YUV422P));
    try js.setNamedProperty(exports, "AV_PIX_FMT_YUV444P", try js.write(AV_PIX_FMT_YUV444P));
    try js.setNamedProperty(exports, "AV_PIX_FMT_RGBA", try js.write(AV_PIX_FMT_RGBA));
    try js.setNamedProperty(exports, "AV_PIX_FMT_BGRA", try js.write(AV_PIX_FMT_BGRA));
    try js.setNamedProperty(exports, "AV_PIX_FMT_NV12", try js.write(AV_PIX_FMT_NV12));

    try js.setNamedProperty(exports, "AVMEDIA_TYPE_AUDIO", try js.write(AVMEDIA_TYPE_AUDIO));
    try js.setNamedProperty(exports, "AVMEDIA_TYPE_VIDEO", try js.write(AVMEDIA_TYPE_VIDEO));

    // Codec functions
    try js.setNamedProperty(exports, "avcodec_find_encoder_by_name", try js.createFunction(avcodec_find_encoder_by_name));
    try js.setNamedProperty(exports, "avcodec_find_decoder_by_name", try js.createFunction(avcodec_find_decoder_by_name));
    try js.setNamedProperty(exports, "avcodec_find_encoder", try js.createFunction(avcodec_find_encoder));
    try js.setNamedProperty(exports, "avcodec_find_decoder", try js.createFunction(avcodec_find_decoder));
    try js.setNamedProperty(exports, "avcodec_alloc_context3", try js.createFunction(avcodec_alloc_context3));
    try js.setNamedProperty(exports, "avcodec_free_context_js", try js.createFunction(avcodec_free_context_js));
    try js.setNamedProperty(exports, "avcodec_open2", try js.createFunction(avcodec_open2));
    try js.setNamedProperty(exports, "avcodec_send_frame", try js.createFunction(avcodec_send_frame));
    try js.setNamedProperty(exports, "avcodec_receive_packet", try js.createFunction(avcodec_receive_packet));
    try js.setNamedProperty(exports, "avcodec_send_packet", try js.createFunction(avcodec_send_packet));
    try js.setNamedProperty(exports, "avcodec_receive_frame", try js.createFunction(avcodec_receive_frame));

    // AVCodecContext accessors
    try js.setNamedProperty(exports, "AVCodecContext_codec_id", try js.createFunction(AVCodecContext_codec_id));
    try js.setNamedProperty(exports, "AVCodecContext_codec_id_s", try js.createFunction(AVCodecContext_codec_id_s));
    try js.setNamedProperty(exports, "AVCodecContext_codec_type", try js.createFunction(AVCodecContext_codec_type));
    try js.setNamedProperty(exports, "AVCodecContext_codec_type_s", try js.createFunction(AVCodecContext_codec_type_s));
    try js.setNamedProperty(exports, "AVCodecContext_width", try js.createFunction(AVCodecContext_width));
    try js.setNamedProperty(exports, "AVCodecContext_width_s", try js.createFunction(AVCodecContext_width_s));
    try js.setNamedProperty(exports, "AVCodecContext_height", try js.createFunction(AVCodecContext_height));
    try js.setNamedProperty(exports, "AVCodecContext_height_s", try js.createFunction(AVCodecContext_height_s));
    try js.setNamedProperty(exports, "AVCodecContext_pix_fmt", try js.createFunction(AVCodecContext_pix_fmt));
    try js.setNamedProperty(exports, "AVCodecContext_pix_fmt_s", try js.createFunction(AVCodecContext_pix_fmt_s));
    try js.setNamedProperty(exports, "AVCodecContext_sample_fmt", try js.createFunction(AVCodecContext_sample_fmt));
    try js.setNamedProperty(exports, "AVCodecContext_sample_fmt_s", try js.createFunction(AVCodecContext_sample_fmt_s));
    try js.setNamedProperty(exports, "AVCodecContext_sample_rate", try js.createFunction(AVCodecContext_sample_rate));
    try js.setNamedProperty(exports, "AVCodecContext_sample_rate_s", try js.createFunction(AVCodecContext_sample_rate_s));
    try js.setNamedProperty(exports, "AVCodecContext_channels", try js.createFunction(AVCodecContext_channels));
    try js.setNamedProperty(exports, "AVCodecContext_channels_s", try js.createFunction(AVCodecContext_channels_s));
    try js.setNamedProperty(exports, "AVCodecContext_channel_layout", try js.createFunction(AVCodecContext_channel_layout));
    try js.setNamedProperty(exports, "AVCodecContext_channel_layout_s", try js.createFunction(AVCodecContext_channel_layout_s));
    try js.setNamedProperty(exports, "AVCodecContext_frame_size", try js.createFunction(AVCodecContext_frame_size));
    try js.setNamedProperty(exports, "AVCodecContext_frame_size_s", try js.createFunction(AVCodecContext_frame_size_s));
    try js.setNamedProperty(exports, "AVCodecContext_bit_rate", try js.createFunction(AVCodecContext_bit_rate));
    try js.setNamedProperty(exports, "AVCodecContext_bit_rate_s", try js.createFunction(AVCodecContext_bit_rate_s));
    try js.setNamedProperty(exports, "AVCodecContext_time_base_num", try js.createFunction(AVCodecContext_time_base_num));
    try js.setNamedProperty(exports, "AVCodecContext_time_base_den", try js.createFunction(AVCodecContext_time_base_den));
    try js.setNamedProperty(exports, "AVCodecContext_time_base_s", try js.createFunction(AVCodecContext_time_base_s));
    try js.setNamedProperty(exports, "AVCodecContext_framerate_num", try js.createFunction(AVCodecContext_framerate_num));
    try js.setNamedProperty(exports, "AVCodecContext_framerate_den", try js.createFunction(AVCodecContext_framerate_den));
    try js.setNamedProperty(exports, "AVCodecContext_framerate_s", try js.createFunction(AVCodecContext_framerate_s));
    try js.setNamedProperty(exports, "AVCodecContext_extradata", try js.createFunction(AVCodecContext_extradata));
    try js.setNamedProperty(exports, "AVCodecContext_extradata_size", try js.createFunction(AVCodecContext_extradata_size));

    // Frame functions
    try js.setNamedProperty(exports, "av_frame_alloc", try js.createFunction(av_frame_alloc));
    try js.setNamedProperty(exports, "av_frame_free_js", try js.createFunction(av_frame_free_js));
    try js.setNamedProperty(exports, "av_frame_unref", try js.createFunction(av_frame_unref));
    try js.setNamedProperty(exports, "av_frame_clone", try js.createFunction(av_frame_clone));
    try js.setNamedProperty(exports, "av_frame_ref", try js.createFunction(av_frame_ref));
    try js.setNamedProperty(exports, "av_frame_get_buffer", try js.createFunction(av_frame_get_buffer));
    try js.setNamedProperty(exports, "av_frame_make_writable", try js.createFunction(av_frame_make_writable));

    // AVFrame accessors
    try js.setNamedProperty(exports, "AVFrame_format", try js.createFunction(AVFrame_format));
    try js.setNamedProperty(exports, "AVFrame_format_s", try js.createFunction(AVFrame_format_s));
    try js.setNamedProperty(exports, "AVFrame_width", try js.createFunction(AVFrame_width));
    try js.setNamedProperty(exports, "AVFrame_width_s", try js.createFunction(AVFrame_width_s));
    try js.setNamedProperty(exports, "AVFrame_height", try js.createFunction(AVFrame_height));
    try js.setNamedProperty(exports, "AVFrame_height_s", try js.createFunction(AVFrame_height_s));
    try js.setNamedProperty(exports, "AVFrame_nb_samples", try js.createFunction(AVFrame_nb_samples));
    try js.setNamedProperty(exports, "AVFrame_nb_samples_s", try js.createFunction(AVFrame_nb_samples_s));
    try js.setNamedProperty(exports, "AVFrame_sample_rate", try js.createFunction(AVFrame_sample_rate));
    try js.setNamedProperty(exports, "AVFrame_sample_rate_s", try js.createFunction(AVFrame_sample_rate_s));
    try js.setNamedProperty(exports, "AVFrame_channels", try js.createFunction(AVFrame_channels));
    try js.setNamedProperty(exports, "AVFrame_channels_s", try js.createFunction(AVFrame_channels_s));
    try js.setNamedProperty(exports, "AVFrame_channel_layout", try js.createFunction(AVFrame_channel_layout));
    try js.setNamedProperty(exports, "AVFrame_channel_layout_s", try js.createFunction(AVFrame_channel_layout_s));
    try js.setNamedProperty(exports, "AVFrame_pts", try js.createFunction(AVFrame_pts));
    try js.setNamedProperty(exports, "AVFrame_pts_s", try js.createFunction(AVFrame_pts_s));
    try js.setNamedProperty(exports, "AVFrame_key_frame", try js.createFunction(AVFrame_key_frame));
    try js.setNamedProperty(exports, "AVFrame_key_frame_s", try js.createFunction(AVFrame_key_frame_s));
    try js.setNamedProperty(exports, "AVFrame_pict_type", try js.createFunction(AVFrame_pict_type));
    try js.setNamedProperty(exports, "AVFrame_pict_type_s", try js.createFunction(AVFrame_pict_type_s));
    try js.setNamedProperty(exports, "AVFrame_linesize_a", try js.createFunction(AVFrame_linesize_a));
    try js.setNamedProperty(exports, "AVFrame_data_a", try js.createFunction(AVFrame_data_a));
    try js.setNamedProperty(exports, "AVFrame_sample_aspect_ratio_num", try js.createFunction(AVFrame_sample_aspect_ratio_num));
    try js.setNamedProperty(exports, "AVFrame_sample_aspect_ratio_den", try js.createFunction(AVFrame_sample_aspect_ratio_den));
    try js.setNamedProperty(exports, "AVFrame_sample_aspect_ratio_s", try js.createFunction(AVFrame_sample_aspect_ratio_s));
    try js.setNamedProperty(exports, "AVFrame_crop_top", try js.createFunction(AVFrame_crop_top));
    try js.setNamedProperty(exports, "AVFrame_crop_bottom", try js.createFunction(AVFrame_crop_bottom));
    try js.setNamedProperty(exports, "AVFrame_crop_left", try js.createFunction(AVFrame_crop_left));
    try js.setNamedProperty(exports, "AVFrame_crop_right", try js.createFunction(AVFrame_crop_right));
    try js.setNamedProperty(exports, "AVFrame_time_base_num", try js.createFunction(AVFrame_time_base_num));
    try js.setNamedProperty(exports, "AVFrame_time_base_den", try js.createFunction(AVFrame_time_base_den));
    try js.setNamedProperty(exports, "AVFrame_time_base_s", try js.createFunction(AVFrame_time_base_s));

    // Packet functions
    try js.setNamedProperty(exports, "av_packet_alloc", try js.createFunction(av_packet_alloc));
    try js.setNamedProperty(exports, "av_packet_free_js", try js.createFunction(av_packet_free_js));
    try js.setNamedProperty(exports, "av_packet_unref", try js.createFunction(av_packet_unref));
    try js.setNamedProperty(exports, "av_packet_make_writable", try js.createFunction(av_packet_make_writable));
    try js.setNamedProperty(exports, "av_new_packet", try js.createFunction(av_new_packet));

    // AVPacket accessors
    try js.setNamedProperty(exports, "AVPacket_data", try js.createFunction(AVPacket_data));
    try js.setNamedProperty(exports, "AVPacket_size", try js.createFunction(AVPacket_size));
    try js.setNamedProperty(exports, "AVPacket_pts", try js.createFunction(AVPacket_pts));
    try js.setNamedProperty(exports, "AVPacket_pts_s", try js.createFunction(AVPacket_pts_s));
    try js.setNamedProperty(exports, "AVPacket_dts", try js.createFunction(AVPacket_dts));
    try js.setNamedProperty(exports, "AVPacket_dts_s", try js.createFunction(AVPacket_dts_s));
    try js.setNamedProperty(exports, "AVPacket_duration", try js.createFunction(AVPacket_duration));
    try js.setNamedProperty(exports, "AVPacket_duration_s", try js.createFunction(AVPacket_duration_s));
    try js.setNamedProperty(exports, "AVPacket_flags", try js.createFunction(AVPacket_flags));
    try js.setNamedProperty(exports, "AVPacket_flags_s", try js.createFunction(AVPacket_flags_s));
    try js.setNamedProperty(exports, "AVPacket_stream_index", try js.createFunction(AVPacket_stream_index));
    try js.setNamedProperty(exports, "AVPacket_stream_index_s", try js.createFunction(AVPacket_stream_index_s));
    try js.setNamedProperty(exports, "AVPacket_time_base_num", try js.createFunction(AVPacket_time_base_num));
    try js.setNamedProperty(exports, "AVPacket_time_base_den", try js.createFunction(AVPacket_time_base_den));
    try js.setNamedProperty(exports, "AVPacket_time_base_s", try js.createFunction(AVPacket_time_base_s));

    // Codec parameters
    try js.setNamedProperty(exports, "avcodec_parameters_alloc", try js.createFunction(avcodec_parameters_alloc));
    try js.setNamedProperty(exports, "avcodec_parameters_free_js", try js.createFunction(avcodec_parameters_free_js));
    try js.setNamedProperty(exports, "avcodec_parameters_to_context", try js.createFunction(avcodec_parameters_to_context));
    try js.setNamedProperty(exports, "avcodec_parameters_from_context", try js.createFunction(avcodec_parameters_from_context));
    try js.setNamedProperty(exports, "AVCodecParameters_codec_id", try js.createFunction(AVCodecParameters_codec_id));
    try js.setNamedProperty(exports, "AVCodecParameters_codec_type", try js.createFunction(AVCodecParameters_codec_type));
    try js.setNamedProperty(exports, "AVCodecParameters_channels", try js.createFunction(AVCodecParameters_channels));
    try js.setNamedProperty(exports, "AVCodecParameters_channels_s", try js.createFunction(AVCodecParameters_channels_s));
    try js.setNamedProperty(exports, "AVCodecParameters_sample_rate", try js.createFunction(AVCodecParameters_sample_rate));
    try js.setNamedProperty(exports, "AVCodecParameters_sample_rate_s", try js.createFunction(AVCodecParameters_sample_rate_s));
    try js.setNamedProperty(exports, "AVCodecParameters_extradata", try js.createFunction(AVCodecParameters_extradata));
    try js.setNamedProperty(exports, "AVCodecParameters_extradata_size", try js.createFunction(AVCodecParameters_extradata_size));

    // Pixel format descriptors
    try js.setNamedProperty(exports, "av_pix_fmt_desc_get", try js.createFunction(av_pix_fmt_desc_get));
    try js.setNamedProperty(exports, "AVPixFmtDescriptor_flags", try js.createFunction(AVPixFmtDescriptor_flags));
    try js.setNamedProperty(exports, "AVPixFmtDescriptor_nb_components", try js.createFunction(AVPixFmtDescriptor_nb_components));
    try js.setNamedProperty(exports, "AVPixFmtDescriptor_log2_chroma_h", try js.createFunction(AVPixFmtDescriptor_log2_chroma_h));
    try js.setNamedProperty(exports, "AVPixFmtDescriptor_log2_chroma_w", try js.createFunction(AVPixFmtDescriptor_log2_chroma_w));

    // Memory copy operations
    try js.setNamedProperty(exports, "copyout_u8", try js.createFunction(copyout_u8));
    try js.setNamedProperty(exports, "copyin_u8", try js.createFunction(copyin_u8));
    try js.setNamedProperty(exports, "copyout_s16", try js.createFunction(copyout_s16));
    try js.setNamedProperty(exports, "copyin_s16", try js.createFunction(copyin_s16));
    try js.setNamedProperty(exports, "copyout_s32", try js.createFunction(copyout_s32));
    try js.setNamedProperty(exports, "copyin_s32", try js.createFunction(copyin_s32));
    try js.setNamedProperty(exports, "copyout_f32", try js.createFunction(copyout_f32));
    try js.setNamedProperty(exports, "copyin_f32", try js.createFunction(copyin_f32));

    // Utility functions
    try js.setNamedProperty(exports, "ff_error", try js.createFunction(ff_error));
    try js.setNamedProperty(exports, "av_packet_rescale_ts_js", try js.createFunction(av_packet_rescale_ts_js));
    try js.setNamedProperty(exports, "ff_frame_rescale_ts_js", try js.createFunction(ff_frame_rescale_ts_js));

    // Swscale
    try js.setNamedProperty(exports, "sws_getContext", try js.createFunction(sws_getContext));
    try js.setNamedProperty(exports, "sws_freeContext", try js.createFunction(sws_freeContext));
    try js.setNamedProperty(exports, "sws_scale_frame", try js.createFunction(sws_scale_frame));

    // Memory allocation
    try js.setNamedProperty(exports, "av_malloc", try js.createFunction(av_malloc));
    try js.setNamedProperty(exports, "av_free", try js.createFunction(av_free));

    return exports;
}
