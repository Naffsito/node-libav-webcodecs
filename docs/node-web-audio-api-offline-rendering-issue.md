# OfflineAudioContext: Dynamic Scheduling Requires suspend/resume in node-web-audio-api

## Summary

`node-web-audio-api` does not automatically process audio nodes scheduled after `OfflineAudioContext.startRendering()` has been called. This differs from browser behavior where audio can be scheduled dynamically during offline rendering. However, **this is by design** - the library provides `suspend()` and `resume()` methods to handle this use case.

## The Problem

When using `OfflineAudioContext` in browsers, you can:
1. Call `startRendering()` to begin processing
2. Schedule `AudioBufferSourceNode` instances with `.start(time)` while rendering is in progress
3. The scheduled audio will be included in the rendered output

In `node-web-audio-api`, audio scheduled **after** `startRendering()` is called produces silence (all zeros) unless you use `suspend()`/`resume()` to create synchronization points.

## Why This Happens (Architecture Difference)

Looking at the [web-audio-api-rs source code](https://github.com/orottier/web-audio-api-rs/blob/main/src/render/thread.rs), the `render_audiobuffer` method only processes control messages (node registration, connections, start calls) at specific points:

```rust
// Control messages processed ONLY:
// 1. Before rendering starts
self.handle_control_messages();

for quantum in 0..num_frames {
    // 2. After suspend/resume
    if suspend_callbacks... {
        self.handle_control_messages();
    }
    
    self.render_offline_quantum(&mut buffer);
    
    // 3. After event handlers
    if events_were_handled {
        self.handle_control_messages();
    }
}
```

| Aspect                      | Browser Web Audio                      | node-web-audio-api                |
|-----------------------------|----------------------------------------|-----------------------------------|
| Rendering model             | Async, interleaved with message queue  | Synchronous tight loop            |
| New nodes during render     | Processed continuously                 | Only at explicit sync points      |
| Dynamic scheduling          | Works automatically                    | Requires explicit suspend/resume  |

## Reproduction

```javascript
import { OfflineAudioContext } from 'node-web-audio-api';

const sampleRate = 48000;
const duration = 0.5; // 500ms
const ctx = new OfflineAudioContext({
  numberOfChannels: 2,
  length: Math.floor(sampleRate * duration),
  sampleRate,
});

// Create a 100ms audio buffer with a sine wave
const bufferLength = Math.floor(sampleRate * 0.1);
const audioBuffer = ctx.createBuffer(2, bufferLength, sampleRate);
for (let ch = 0; ch < 2; ch++) {
  const data = audioBuffer.getChannelData(ch);
  for (let i = 0; i < bufferLength; i++) {
    data[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
  }
}

const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);

// Start rendering FIRST
const renderPromise = ctx.startRendering();

// Schedule audio AFTER startRendering (this works in browsers, fails in node-web-audio-api)
for (let i = 0; i < 5; i++) {
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(gainNode);
  source.start(i * 0.1); // Schedule at 0s, 0.1s, 0.2s, 0.3s, 0.4s
}

const renderedBuffer = await renderPromise;

// Check for audio content
const channel0 = renderedBuffer.getChannelData(0);
let nonZeroCount = 0;
for (let i = 0; i < channel0.length; i++) {
  if (Math.abs(channel0[i]) > 0.001) nonZeroCount++;
}

console.log('Non-zero samples:', nonZeroCount);
// Browser: ~24000 (audio present)
// node-web-audio-api: 0 (silence)
```

## Test Results

| Scenario                                    | Browser      | node-web-audio-api |
|---------------------------------------------|--------------|---------------------|
| Audio scheduled **before** startRendering() | Works        | Works              |
| Audio scheduled **after** startRendering()  | Works        | **Silence (0 samples)** |

## Real-World Impact

This issue affects libraries that rely on dynamic audio scheduling during offline rendering. For example, **DiffusionStudio** (a video editing library) uses this pattern for video export:

```javascript
// DiffusionStudio's export flow (simplified)
const ctx = new OfflineAudioContext({ ... });

// Setup audio worklet sink
await ctx.audioWorklet.addModule(sinkProcessorUrl);
const sinkNode = new AudioWorkletNode(ctx, 'sink', { ... });
sinkNode.connect(ctx.destination);

// Initialize clips (connects audio decoders to gain nodes)
for (const clip of composition.clips) {
  await clip.initRenderer(renderer);
}

// Start rendering
const renderPromise = ctx.startRendering();  // <-- Rendering starts here

// Main export loop - schedules audio incrementally
for (let frame = 0; frame < totalFrames; frame++) {
  const time = frame / fps;
  renderer.playbackOffset = time;
  
  // This calls clip.update() which decodes audio and schedules
  // BufferSourceNodes with .start(time) - BUT this happens AFTER
  // startRendering() was called!
  for (const layer of layers) {
    await layer.update(renderer);  // <-- Schedules audio here
  }
  
  // ... render video frame ...
}

await renderPromise;
```

Because `node-web-audio-api` doesn't process the dynamically scheduled audio, the AudioWorklet sink receives silence/zeros, which propagates as NaN values to the audio encoder.

## Expected Behavior

`OfflineAudioContext.startRendering()` should process audio sources scheduled after it's called, as long as those sources are scheduled within the render time range. This matches browser behavior.

## Environment

- node-web-audio-api version: (latest)
- Node.js version: v20+
- Platform: macOS/Linux

## Solution: Use suspend() and resume()

The `node-web-audio-api` library provides `suspend()` and `resume()` methods specifically for this use case. You can schedule suspension points where control messages will be processed:

### Option 1: Pre-schedule suspensions at regular intervals

```javascript
import { OfflineAudioContext } from 'node-web-audio-api';

const sampleRate = 48000;
const duration = 2.0;
const ctx = new OfflineAudioContext({
  numberOfChannels: 2,
  length: Math.floor(sampleRate * duration),
  sampleRate,
});

// Schedule suspensions every 100ms to allow dynamic node scheduling
const suspendInterval = 0.1;
for (let t = suspendInterval; t < duration; t += suspendInterval) {
  ctx.suspend(t).then(async () => {
    // Schedule audio for the next interval here
    // ...
    await ctx.resume();
  });
}

// Start rendering - suspensions will be processed
const buffer = await ctx.startRendering();
```

### Option 2: Pre-schedule all audio before startRendering

If you know the entire audio timeline upfront:

```javascript
// Pre-schedule all audio BEFORE startRendering
for (let frame = 0; frame < totalFrames; frame++) {
  const time = frame / fps;
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(time);
}

// THEN start rendering
const renderedBuffer = await ctx.startRendering();
```

## Impact on DiffusionStudio

DiffusionStudio's export pattern schedules audio incrementally during the render loop **after** `startRendering()` is called. This is fundamentally incompatible with `node-web-audio-api`.

### Why a Polyfill Wrapper Cannot Fix This

We attempted to create an `OfflineAudioContext` wrapper that automatically adds suspend/resume intervals. However, this approach **does not work** because:

1. When `startRendering()` is called, the Rust backend begins processing immediately
2. DiffusionStudio's scheduling loop runs synchronously in the same JavaScript thread
3. By the time the first suspend point is reached, all scheduling code has already run
4. The nodes scheduled after `startRendering()` returned are not visible to the render thread

The suspend/resume mechanism only works when code is executed **inside** a suspend callback, not from external code running after `startRendering()` returns.

### Required Changes to DiffusionStudio

To support Node.js server-side rendering, DiffusionStudio would need to modify its export logic to:

1. **Pre-decode all audio** from video clips before starting the export
2. **Pre-schedule all BufferSourceNodes** before calling `startRendering()`
3. Calculate all audio timing upfront based on clip positions and durations

This is a significant architectural change that would require modifications to DiffusionStudio's core export pipeline.

## Potential Feature Request for node-web-audio-api

A potential enhancement to `node-web-audio-api` could be:

- Process control messages after every render quantum (or every N quanta)
- This would provide browser-like behavior without requiring explicit suspend/resume calls
- Trade-off: May have performance implications due to more frequent channel polling

This would need to be implemented in the underlying `web-audio-api-rs` Rust library.

## Related

- Web Audio API Spec: https://webaudio.github.io/web-audio-api/#OfflineAudioContext
- node-web-audio-api: https://github.com/ircam-ismm/node-web-audio-api
- web-audio-api-rs (Rust backend): https://github.com/orottier/web-audio-api-rs
- DiffusionStudio: https://github.com/diffusionstudio/core
- Issue #30 (suspend/resume implementation): https://github.com/ircam-ismm/node-web-audio-api/issues/30
