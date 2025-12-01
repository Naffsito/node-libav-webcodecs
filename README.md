# node-libav-webcodecs

WebCodecs API polyfill for Node.js using libav.

## Installation

```bash
npm install node-libav-webcodecs
```

## Usage

**Important:** Use `vite-node` to run scripts due to `node-web-audio-api` compatibility issues.

```bash
npx vite-node your-script.ts
```

### Example: Load video, repeat 3x, trim, add overlay

```typescript
import { init } from 'node-libav-webcodecs/polyfill';
import * as fs from 'fs';

async function main() {
  await init();
  
  const core = await import('@diffusionstudio/core');

  // Load video file
  const videoBuffer = fs.readFileSync('input.webm');
  const videoBlob = new Blob([videoBuffer], { type: 'video/webm' });
  const source = await core.Source.from(videoBlob, { mimeType: 'video/webm' });

  // Create composition
  const composition = new core.Composition({
    width: 1280,
    height: 720,
    background: '#000000',
  });

  // Video layer - sequential mode (clips play one after another)
  const videoLayer = new core.Layer({ mode: 'SEQUENTIAL' });
  await composition.add(videoLayer);

  // Add video 3 times, each trimmed to 1 second
  for (let i = 0; i < 3; i++) {
    const clip = new core.VideoClip(source, {
      position: 'center',
      height: '100%',
    });
    clip.range = [0, 1]; // Trim to first 1 second
    await videoLayer.add(clip);
  }

  // Rectangle overlay
  const overlayLayer = new core.Layer();
  await composition.add(overlayLayer);
  await overlayLayer.add(new core.RectangleClip({
    position: 'center',
    width: 600, height: 80,
    fill: '#e94560',
    duration: 3,
  }));

  // Encode to MP4
  const encoder = new core.Encoder(composition, {
    video: { fps: 30, bitrate: 2_000_000 },
    audio: { enabled: false },
  });

  const result = await encoder.render();
  if (result.type === 'success') {
    fs.writeFileSync('output.mp4', Buffer.from(await result.data!.arrayBuffer()));
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

- **Audio not working** - use `audio: { enabled: false }`
- **Text requires font setup** - use `core.loadFont()` or use shapes instead
- Use `vite-node` to run scripts
- Call `process.exit()` after completion
- Use video-only files (no audio track)

## What's included

The `/polyfill` entry point sets up:

| Category  | APIs                                                                                                                |
|-----------|---------------------------------------------------------------------------------------------------------------------|
| WebCodecs | VideoEncoder, VideoDecoder, AudioEncoder, AudioDecoder, VideoFrame, AudioData, EncodedVideoChunk, EncodedAudioChunk |
| Canvas    | HTMLCanvasElement, OffscreenCanvas, CanvasRenderingContext2D, Image, Path2D, DOMMatrix, DOMRect                     |
| DOM       | document, window                                                                                                    |
| Audio     | AudioContext, OfflineAudioContext, AudioBuffer, AudioWorkletNode                                                    |
| Misc      | requestAnimationFrame, performance, ResizeObserver, File, HTMLVideoElement                                          |

## License

0BSD
