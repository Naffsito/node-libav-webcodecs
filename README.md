# node-libav-webcodecs

WebCodecs API polyfill for Node.js using libav.

## Installation

```bash
npm install node-libav-webcodecs
```

## Usage

### Simple (recommended)

Import the polyfill to set up all WebCodecs and browser APIs on `globalThis`:

```typescript
import 'node-libav-webcodecs/polyfill';

// Now you can use WebCodecs APIs globally
const encoder = new VideoEncoder({
  output: (chunk) => console.log('Encoded chunk:', chunk.byteLength),
  error: (e) => console.error(e),
});
```

### With DiffusionStudio

```typescript
import 'node-libav-webcodecs/polyfill';
import { Composition, Layer, RectangleClip, Encoder } from '@diffusionstudio/core';

const composition = new Composition({ width: 1280, height: 720 });
const layer = new Layer();
await composition.add(layer);

const clip = new RectangleClip({
  x: 640, y: 360,
  width: 400, height: 300,
  fill: '#FF0000',
  duration: 2,
});
await layer.add(clip);

const encoder = new Encoder(composition);
const result = await encoder.render();
```

### Manual setup

For more control, import components directly:

```typescript
import {
  VideoEncoder,
  VideoDecoder,
  VideoFrame,
  EncodedVideoChunk,
} from 'node-libav-webcodecs';
```

## Supported Codecs

| Type  | Codecs                   |
|-------|--------------------------|
| Video | VP8, VP9, AV1, H.264     |
| Audio | FLAC, Opus, Vorbis       |

## Limitations

- **Audio encoding/decoding is not currently working**
- Video encoding performance is slower than native browser implementations
- `VideoFrame` color spaces and cropping are not fully implemented

## What's included

The `/polyfill` entry point sets up:

| Category   | APIs                                                                 |
|------------|----------------------------------------------------------------------|
| WebCodecs  | VideoEncoder, VideoDecoder, AudioEncoder, AudioDecoder, VideoFrame, AudioData, EncodedVideoChunk, EncodedAudioChunk |
| Canvas     | HTMLCanvasElement, OffscreenCanvas, CanvasRenderingContext2D, Image, Path2D, DOMMatrix, DOMRect |
| DOM        | document, window                                                     |
| Audio      | AudioContext, OfflineAudioContext, AudioBuffer, AudioWorkletNode     |
| Animation  | requestAnimationFrame, cancelAnimationFrame, performance             |
| Misc       | ResizeObserver, File, FileSystemFileHandle, HTMLVideoElement, HTMLAudioElement |

## License

0BSD
