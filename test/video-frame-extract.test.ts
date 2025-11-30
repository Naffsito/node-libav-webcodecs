import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import {
  FormatContext,
  CodecContext,
  Codec,
  Frame,
  Packet,
  SoftwareScaleContext,
  Stream,
} from 'node-av/lib';
import {
  AV_PIX_FMT_YUV420P,
  AV_PIX_FMT_RGB24,
  AV_PIX_FMT_RGBA,
  AVMEDIA_TYPE_VIDEO,
  AVERROR_EOF,
  AVERROR_EAGAIN,
  SWS_BILINEAR,
  AVSEEK_FLAG_BACKWARD,
} from 'node-av/constants';
import type { AVPixelFormat } from 'node-av/constants';

const SAMPLE_VIDEO = path.join(__dirname, '../samples/sample2.webm');
const OUTPUT_DIR = path.join(__dirname, '../test-output');

describe('Video Frame Extraction', () => {
  beforeAll(() => {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Optionally clean up output directory
    // fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  });

  it('should extract a frame from a video file and write to PNG', async () => {
    // 1. Open the video file
    const formatCtx = new FormatContext();
    const ret = await formatCtx.openInput(SAMPLE_VIDEO);
    expect(ret).toBe(0);

    // Find stream info
    const findRet = await formatCtx.findStreamInfo(null);
    expect(findRet).toBeGreaterThanOrEqual(0);

    // 2. Find the video stream
    let videoStreamIndex = -1;
    let videoStream: Stream | null = null;
    const streams = formatCtx.streams;

    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      if (stream.codecpar.codecType === AVMEDIA_TYPE_VIDEO) {
        videoStreamIndex = i;
        videoStream = stream;
        break;
      }
    }

    expect(videoStreamIndex).toBeGreaterThanOrEqual(0);
    expect(videoStream).not.toBeNull();

    console.log(`Found video stream at index ${videoStreamIndex}`);
    console.log(`Video dimensions: ${videoStream!.codecpar.width}x${videoStream!.codecpar.height}`);

    // 3. Create a decoder
    const codecParams = videoStream!.codecpar;
    const codec = Codec.findDecoder(codecParams.codecId);
    expect(codec).not.toBeNull();

    const codecCtx = new CodecContext();
    codecCtx.allocContext3(codec!);

    // Copy codec parameters to context
    const copyRet = codecParams.toContext(codecCtx);
    expect(copyRet).toBeGreaterThanOrEqual(0);

    // Open the codec
    const openRet = await codecCtx.open2(codec!, null);
    expect(openRet).toBe(0);

    // 4. Create frame and packet objects
    const packet = new Packet();
    packet.alloc();

    const frame = new Frame();
    frame.alloc();

    // 5. Read packets until we get a video frame
    let frameExtracted = false;
    let frameCount = 0;
    const maxFramesToExtract = 5; // Extract first 5 frames

    while (frameCount < maxFramesToExtract) {
      // Read a packet
      const readRet = await formatCtx.readFrame(packet);

      if (readRet === AVERROR_EOF) {
        console.log('End of file reached');
        break;
      }

      if (readRet < 0) {
        console.log(`Read error: ${readRet}`);
        break;
      }

      // Check if this packet is from the video stream
      if (packet.streamIndex !== videoStreamIndex) {
        packet.unref();
        continue;
      }

      // Send packet to decoder
      const sendRet = await codecCtx.sendPacket(packet);
      packet.unref();

      if (sendRet < 0 && sendRet !== AVERROR_EAGAIN) {
        console.log(`Send packet error: ${sendRet}`);
        continue;
      }

      // Receive frames from decoder
      while (true) {
        const recvRet = await codecCtx.receiveFrame(frame);

        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }

        if (recvRet < 0) {
          console.log(`Receive frame error: ${recvRet}`);
          break;
        }

        // We have a decoded frame!
        frameCount++;
        console.log(`Decoded frame ${frameCount}: ${frame.width}x${frame.height}, format=${frame.format}, pts=${frame.pts}`);

        // 6. Convert frame to RGB for saving
        const width = frame.width;
        const height = frame.height;

        // Create a software scaler to convert YUV to RGB
        const swsCtx = new SoftwareScaleContext();
        swsCtx.getContext(
          width, height, frame.format as AVPixelFormat,
          width, height, AV_PIX_FMT_RGB24,
          SWS_BILINEAR
        );

        // Create output frame for RGB data
        const rgbFrame = new Frame();
        rgbFrame.alloc();
        rgbFrame.width = width;
        rgbFrame.height = height;
        rgbFrame.format = AV_PIX_FMT_RGB24;

        const bufferRet = rgbFrame.getBuffer();
        expect(bufferRet).toBeGreaterThanOrEqual(0);

        // Scale/convert the frame (scaleFrame is async)
        const scaleRet = await swsCtx.scaleFrame(rgbFrame, frame);
        expect(scaleRet).toBeGreaterThanOrEqual(0);

        // 7. Extract RGB data from the frame
        const rgbData = rgbFrame.data;
        expect(rgbData).toBeDefined();
        expect(rgbData!.length).toBeGreaterThan(0);

        // The RGB data is in rgbData[0] with linesize rgbFrame.linesize[0]
        const linesize = rgbFrame.linesize![0];
        const rgbBuffer = Buffer.alloc(width * height * 3);

        // Copy row by row (accounting for linesize padding)
        for (let y = 0; y < height; y++) {
          const srcOffset = y * linesize;
          const dstOffset = y * width * 3;
          rgbData![0].copy(rgbBuffer, dstOffset, srcOffset, srcOffset + width * 3);
        }

        // 8. Write to PNG using sharp
        const outputPath = path.join(OUTPUT_DIR, `frame_${frameCount.toString().padStart(3, '0')}.png`);

        await sharp(rgbBuffer, {
          raw: {
            width,
            height,
            channels: 3,
          },
        })
          .png()
          .toFile(outputPath);

        console.log(`Wrote frame to ${outputPath}`);
        frameExtracted = true;

        // Cleanup
        rgbFrame.free();
        swsCtx.freeContext();
        frame.unref();
      }
    }

    // Verify we extracted at least one frame
    expect(frameExtracted).toBe(true);
    expect(frameCount).toBeGreaterThan(0);

    // Verify the output files exist
    const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
    expect(outputFiles.length).toBeGreaterThan(0);
    console.log(`Extracted ${outputFiles.length} frames to ${OUTPUT_DIR}`);

    // 9. Cleanup
    frame.free();
    packet.free();
    codecCtx.freeContext();
    formatCtx.closeInput();
  });

  it('should extract a specific frame by timestamp', async () => {
    // Open the video file
    const formatCtx = new FormatContext();
    await formatCtx.openInput(SAMPLE_VIDEO);
    await formatCtx.findStreamInfo(null);

    // Find video stream
    let videoStreamIndex = -1;
    let videoStream: Stream | null = null;

    for (let i = 0; i < formatCtx.streams.length; i++) {
      if (formatCtx.streams[i].codecpar.codecType === AVMEDIA_TYPE_VIDEO) {
        videoStreamIndex = i;
        videoStream = formatCtx.streams[i];
        break;
      }
    }

    expect(videoStreamIndex).toBeGreaterThanOrEqual(0);

    // Setup decoder
    const codecParams = videoStream!.codecpar;
    const codec = Codec.findDecoder(codecParams.codecId);
    const codecCtx = new CodecContext();
    codecCtx.allocContext3(codec!);
    codecParams.toContext(codecCtx);
    await codecCtx.open2(codec!, null);

    const packet = new Packet();
    packet.alloc();
    const frame = new Frame();
    frame.alloc();

    // Seek to 1 second into the video
    const timeBase = videoStream!.timeBase;
    const targetPts = BigInt(Math.floor(1.0 * timeBase.den / timeBase.num)); // 1 second

    // Use seekFrame function to jump to the desired timestamp
    // Seek to any keyframe before or at the target position
    const seekRet = await formatCtx.seekFrame(videoStreamIndex, targetPts, AVSEEK_FLAG_BACKWARD);
    console.log(`Seek result: ${seekRet}`);

    // Flush decoder after seek by calling avcodec_flush_buffers equivalent
    // Since we can't directly flush, we'll just receive any pending frames
    codecCtx.freeContext();
    codecCtx.allocContext3(codec!);
    codecParams.toContext(codecCtx);
    await codecCtx.open2(codec!, null);

    // Read and decode until we get a frame at or after target timestamp
    let gotFrame = false;
    let attempts = 0;
    const maxAttempts = 200; // Increase attempts since we might need to decode more frames

    while (!gotFrame && attempts < maxAttempts) {
      attempts++;
      const readRet = await formatCtx.readFrame(packet);

      if (readRet === AVERROR_EOF) {
        console.log('EOF reached');
        break;
      }
      if (readRet < 0) {
        console.log(`Read error: ${readRet}`);
        continue;
      }

      if (packet.streamIndex !== videoStreamIndex) {
        packet.unref();
        continue;
      }

      const sendRet = await codecCtx.sendPacket(packet);
      packet.unref();

      if (sendRet < 0 && sendRet !== AVERROR_EAGAIN) {
        console.log(`Send packet error: ${sendRet}`);
        continue;
      }

      // Try to receive frames
      while (true) {
        const recvRet = await codecCtx.receiveFrame(frame);
        if (recvRet === AVERROR_EAGAIN || recvRet === AVERROR_EOF) {
          break;
        }
        if (recvRet < 0) {
          console.log(`Receive frame error: ${recvRet}`);
          break;
        }

        // Check if we're at or past our target time
        const framePts = Number(frame.pts);
        const targetPtsNum = Number(targetPts);

        if (framePts >= targetPtsNum * 0.8) { // Accept frames close to target
          // Convert and save the frame
          const width = frame.width;
          const height = frame.height;

          const swsCtx = new SoftwareScaleContext();
          swsCtx.getContext(width, height, frame.format as AVPixelFormat, width, height, AV_PIX_FMT_RGB24, SWS_BILINEAR);

          const rgbFrame = new Frame();
          rgbFrame.alloc();
          rgbFrame.width = width;
          rgbFrame.height = height;
          rgbFrame.format = AV_PIX_FMT_RGB24;
          rgbFrame.getBuffer();

          await swsCtx.scaleFrame(rgbFrame, frame);

          const linesize = rgbFrame.linesize![0];
          const rgbBuffer = Buffer.alloc(width * height * 3);
          for (let y = 0; y < height; y++) {
            rgbFrame.data![0].copy(rgbBuffer, y * width * 3, y * linesize, y * linesize + width * 3);
          }

          const outputPath = path.join(OUTPUT_DIR, 'frame_at_1sec.png');
          await sharp(rgbBuffer, { raw: { width, height, channels: 3 } })
            .png()
            .toFile(outputPath);

          console.log(`Wrote frame at ~1 second to ${outputPath} (pts=${frame.pts})`);

          rgbFrame.free();
          swsCtx.freeContext();
          frame.unref();
          gotFrame = true;
          break;
        }

        frame.unref();
      }

      if (gotFrame) break;
    }

    expect(gotFrame).toBe(true);

    // Cleanup
    frame.free();
    packet.free();
    codecCtx.freeContext();
    formatCtx.closeInput();
  });

  it('should extract frame and write as raw YUV', async () => {
    // Open video
    const formatCtx = new FormatContext();
    await formatCtx.openInput(SAMPLE_VIDEO);
    await formatCtx.findStreamInfo(null);

    // Find video stream
    let videoStreamIndex = -1;
    let videoStream: Stream | null = null;

    for (let i = 0; i < formatCtx.streams.length; i++) {
      if (formatCtx.streams[i].codecpar.codecType === AVMEDIA_TYPE_VIDEO) {
        videoStreamIndex = i;
        videoStream = formatCtx.streams[i];
        break;
      }
    }

    expect(videoStreamIndex).toBeGreaterThanOrEqual(0);

    // Setup decoder
    const codec = Codec.findDecoder(videoStream!.codecpar.codecId);
    const codecCtx = new CodecContext();
    codecCtx.allocContext3(codec!);
    videoStream!.codecpar.toContext(codecCtx);
    await codecCtx.open2(codec!, null);

    const packet = new Packet();
    packet.alloc();
    const frame = new Frame();
    frame.alloc();

    // Get first frame
    let gotFrame = false;
    while (!gotFrame) {
      const readRet = await formatCtx.readFrame(packet);
      if (readRet < 0) break;

      if (packet.streamIndex !== videoStreamIndex) {
        packet.unref();
        continue;
      }

      await codecCtx.sendPacket(packet);
      packet.unref();

      if (await codecCtx.receiveFrame(frame) >= 0) {
        gotFrame = true;

        // Write raw YUV420P data
        const width = frame.width;
        const height = frame.height;
        const data = frame.data!;
        const linesize = frame.linesize!;

        // YUV420P: Y plane (full res), U plane (half res), V plane (half res)
        const ySize = width * height;
        const uvSize = (width / 2) * (height / 2);
        const yuvBuffer = Buffer.alloc(ySize + uvSize * 2);

        // Copy Y plane
        for (let y = 0; y < height; y++) {
          data[0].copy(yuvBuffer, y * width, y * linesize[0], y * linesize[0] + width);
        }

        // Copy U plane
        for (let y = 0; y < height / 2; y++) {
          data[1].copy(yuvBuffer, ySize + y * (width / 2), y * linesize[1], y * linesize[1] + width / 2);
        }

        // Copy V plane
        for (let y = 0; y < height / 2; y++) {
          data[2].copy(yuvBuffer, ySize + uvSize + y * (width / 2), y * linesize[2], y * linesize[2] + width / 2);
        }

        const outputPath = path.join(OUTPUT_DIR, `frame_${width}x${height}.yuv`);
        fs.writeFileSync(outputPath, yuvBuffer);
        console.log(`Wrote raw YUV420P frame to ${outputPath} (${yuvBuffer.length} bytes)`);

        frame.unref();
      }
    }

    expect(gotFrame).toBe(true);

    // Cleanup
    frame.free();
    packet.free();
    codecCtx.freeContext();
    formatCtx.closeInput();
  });
});
