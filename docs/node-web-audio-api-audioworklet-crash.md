# node-web-audio-api: AudioWorklet Crash in OfflineAudioContext with Suspend/Resume

## Summary

When using `OfflineAudioContext` with `suspend()`/`resume()` and an `AudioWorkletNode` in node-web-audio-api, the native Rust code panics during audio finalization with the error:

```
Error: Panic in async function
  code: 'GenericFailure'
```

This occurs after the frame loop completes successfully and during the final audio rendering phase.

## Environment

- **Library**: [node-web-audio-api](https://github.com/ircam-ismm/node-web-audio-api)
- **Backend**: [web-audio-api-rs](https://github.com/orottier/web-audio-api-rs) (Rust)
- **Node.js**: v20+
- **Platform**: macOS (ARM64), likely affects all platforms

## Reproduction

```javascript
import { OfflineAudioContext, AudioWorkletNode } from 'node-web-audio-api';

const sampleRate = 48000;
const duration = 1.0;
const fps = 30;

const ctx = new OfflineAudioContext({
  numberOfChannels: 2,
  length: Math.ceil(sampleRate * duration),
  sampleRate,
});

// Add AudioWorklet with Atomics-based synchronization
const workletCode = `
class SinkProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.buffer = options.processorOptions.buffer;
    this.port.onmessage = () => { this.port.postMessage(new Float32Array(0)); };
  }
  process(inputs, outputs) {
    const frameCount = outputs[0][0].length;
    while (Atomics.load(this.buffer, 0) < frameCount); // Wait for samples
    Atomics.sub(this.buffer, 0, frameCount);
    return true;
  }
}
registerProcessor('sink', SinkProcessor);
`;

const workletBlob = new Blob([workletCode], { type: 'application/javascript' });
const workletUrl = URL.createObjectURL(workletBlob);
await ctx.audioWorklet.addModule(workletUrl);

const sharedBuffer = new SharedArrayBuffer(4);
const atomicBuffer = new Uint32Array(sharedBuffer);

const sinkNode = new AudioWorkletNode(ctx, 'sink', {
  processorOptions: { buffer: atomicBuffer },
});
sinkNode.connect(ctx.destination);

// Schedule suspend at t=0
ctx.suspend(0).then(() => console.log('Suspended at t=0'));

// Pre-add samples to prevent AudioWorklet blocking
Atomics.store(atomicBuffer, 0, ctx.length + sampleRate);

// Start rendering
const renderPromise = ctx.startRendering();

// Wait for suspend, then resume
await new Promise(r => setTimeout(r, 100)); // Wait for suspend to trigger
await ctx.resume();

// This line triggers the crash
const buffer = await renderPromise; // <-- CRASH: "Panic in async function"
```

## Technical Analysis

### What Works

1. **Suspend/Resume pattern**: The suspend points are hit correctly
2. **AudioWorklet processing**: The worklet processes audio quanta during rendering
3. **Frame loop**: All frames complete successfully with proper timing

### What Fails

After the frame loop completes and `await renderPromise` is called:

1. The native Rust code in web-audio-api-rs attempts to finalize rendering
2. The AudioWorklet's `process()` function is called with unexpected state
3. The Rust code panics with `"expect Object, got: Undefined"` (InvalidArg)
4. This bubbles up as `"Panic in async function"` with code `GenericFailure`

### Stack Trace

```
Error: expect Object, got: Undefined
  at Immediate.runLoop (node_modules/node-web-audio-api/js/AudioWorkletGlobalScope.js:112:3)
  at process.processImmediate (node:internal/timers:485:21)
  code: 'InvalidArg'
```

### Root Cause Hypothesis

The AudioWorklet in node-web-audio-api expects certain objects to be available during the `process()` callback. When rendering completes after suspend/resume cycles, the internal state may be inconsistent, causing the native code to receive `undefined` where it expects an object.

This is likely a race condition or state management issue in:
- `web-audio-api-rs/src/render/thread.rs` - Render thread handling
- `node-web-audio-api/js/AudioWorkletGlobalScope.js` - JS/Native bridge

## Workarounds

### 1. Disable Audio Export (Current)

For video-only exports, disable audio:

```javascript
const encoder = new Encoder(composition, {
  audio: { enabled: false },
});
```

### 2. Pre-schedule All Audio (Architectural Change)

Schedule all audio nodes BEFORE calling `startRendering()`:

```javascript
// Decode and schedule all audio upfront
for (const clip of clips) {
  const audioBuffer = await decodeAudio(clip);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(clip.startTime);
}

// THEN start rendering (no dynamic scheduling)
const buffer = await ctx.startRendering();
```

This requires significant changes to DiffusionStudio's export architecture.

### 3. Bypass AudioWorklet

Use a different audio capture method that doesn't rely on AudioWorklet:

- ScriptProcessorNode (deprecated but may work)
- Direct buffer manipulation after rendering completes
- External audio processing pipeline

## Impact on DiffusionStudio

DiffusionStudio uses this pattern for video export:

1. Create `OfflineAudioContext`
2. Set up `AudioWorkletNode` as a sink to capture audio
3. Call `startRendering()`
4. In frame loop: decode video/audio, schedule audio nodes dynamically
5. Finalize and mux audio/video

Step 4 requires dynamic audio scheduling after `startRendering()`, which doesn't work in node-web-audio-api without suspend/resume. Our fix enables steps 1-4 to work, but step 5 crashes due to this bug.

## Related Issues

- [node-web-audio-api #30](https://github.com/ircam-ismm/node-web-audio-api/issues/30) - suspend/resume implementation
- [web-audio-api-rs render thread](https://github.com/orottier/web-audio-api-rs/blob/main/src/render/thread.rs) - Rust rendering code

## Recommended Action

File a bug report with node-web-audio-api including:

1. Minimal reproduction script (above)
2. Stack trace showing the panic
3. Expected behavior: `startRendering()` should complete without panic
4. Environment details

The fix likely needs to be in web-audio-api-rs to properly handle AudioWorklet state during offline rendering finalization after suspend/resume cycles.
