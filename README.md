# node-libav-webcodecs

WebCodecs API polyfill for Node.js using libav.

## Installation

```bash
npm install node-libav-webcodecs
```

## Usage

**Important:** Use `vite-node` to run scripts due to `node-web-audio-api` compatibility issues with other runners.

```bash
npx vite-node your-script.ts
```

### Example

```typescript
import { init } from 'node-libav-webcodecs/polyfill';
import * as fs from 'fs';

async function main() {
  await init();
  
  const core = await import('@diffusionstudio/core');

  // Create composition
  const composition = new core.Composition({
    width: 1280,
    height: 720,
    background: '#1a1a2e',
  });

  // Add a rectangle
  const bgLayer = new core.Layer();
  await composition.add(bgLayer);
  await bgLayer.add(new core.RectangleClip({
    x: 640, y: 360,
    width: 800, height: 200,
    fill: '#e94560',
    duration: 3,
  }));

  // Add text overlay
  const textLayer = new core.Layer();
  await composition.add(textLayer);
  await textLayer.add(new core.TextClip({
    text: 'Hello from Node.js!',
    x: 640, y: 360,
    color: '#FFFFFF',
    fontSize: 64,
    align: 'center',
    baseline: 'middle',
    duration: 3,
  }));

  // Encode to MP4
  const encoder = new core.Encoder(composition, {
    video: { fps: 30, bitrate: 2_000_000 },
    audio: { enabled: false },
  });

  const result = await encoder.render();
  if (result.type === 'success') {
    const buffer = Buffer.from(await result.data!.arrayBuffer());
    fs.writeFileSync('output.mp4', buffer);
    console.log('Done!');
  }
  
  process.exit(0);
}

main().catch(console.error);
```

## Supported Codecs

| Type  | Codecs             |
|-------|--------------------|
| Video | VP8, VP9, H.264    |
| Audio | FLAC, Opus, Vorbis |

## Limitations

- **Audio encoding/decoding is not working** - use `audio: { enabled: false }`
- Must use `vite-node` to run scripts (node-web-audio-api AudioWorklet issues with tsx/node)
- Call `process.exit()` after completion to prevent hanging
- Video decoding requires supported codecs (VP8/VP9 work, some H.264 variants may not)

## What's included

The `/polyfill` entry point sets up:

| Category  | APIs                                                                                                                  |
|-----------|-----------------------------------------------------------------------------------------------------------------------|
| WebCodecs | VideoEncoder, VideoDecoder, AudioEncoder, AudioDecoder, VideoFrame, AudioData, EncodedVideoChunk, EncodedAudioChunk   |
| Canvas    | HTMLCanvasElement, OffscreenCanvas, CanvasRenderingContext2D, Image, Path2D, DOMMatrix, DOMRect, drawImage for VideoFrame |
| DOM       | document, window                                                                                                      |
| Audio     | AudioContext, OfflineAudioContext, AudioBuffer, AudioWorkletNode                                                      |
| Misc      | requestAnimationFrame, cancelAnimationFrame, performance, ResizeObserver, File, HTMLVideoElement, HTMLAudioElement    |

## License

0BSD
