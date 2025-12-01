/**
 * Test to verify if node-web-audio-api's AudioWorklet properly receives input audio data.
 * This tests the exact pattern used by DiffusionStudio's sink processor.
 */
import { describe, it, expect } from "vitest";
import "./polyfills";

describe("AudioWorklet input receiving", () => {
  it("should receive audio input in AudioWorkletProcessor", async () => {
    // Create an OfflineAudioContext like DiffusionStudio does
    const sampleRate = 48000;
    const numberOfChannels = 2;
    const duration = 0.1; // 100ms of audio
    const length = sampleRate * duration;

    const ctx = new OfflineAudioContext({
      numberOfChannels,
      length,
      sampleRate,
    });

    // Create an AudioBuffer with known values (a simple sine wave)
    const audioBuffer = ctx.createBuffer(numberOfChannels, length, sampleRate);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Simple sine wave at 440Hz
        channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
      }
    }

    // Register a sink processor that captures input
    const processorCode = `
      class SinkProcessor extends AudioWorkletProcessor {
        constructor(options) {
          super();
          this.receivedSamples = 0;
          this.hasReceivedValidData = false;
        }

        process(inputs, outputs) {
          const input = inputs[0];
          if (input && input.length > 0 && input[0] && input[0].length > 0) {
            // Check if we received actual audio data (not silence/zeros/NaN)
            const channel0 = input[0];
            let hasNonZero = false;
            let hasNaN = false;
            
            for (let i = 0; i < channel0.length; i++) {
              if (Number.isNaN(channel0[i]) || !Number.isFinite(channel0[i])) {
                hasNaN = true;
              }
              if (channel0[i] !== 0) {
                hasNonZero = true;
              }
            }

            this.receivedSamples += channel0.length;
            
            // Send status back to main thread
            this.port.postMessage({
              samples: channel0.length,
              hasNonZero,
              hasNaN,
              totalReceived: this.receivedSamples,
              firstFewValues: Array.from(channel0.slice(0, 5)),
              inputChannels: input.length,
            });
          } else {
            this.port.postMessage({
              samples: 0,
              hasNonZero: false,
              hasNaN: false,
              totalReceived: this.receivedSamples,
              firstFewValues: [],
              inputChannels: input ? input.length : 0,
              noInput: true,
            });
          }
          
          return true;
        }
      }
      registerProcessor("test-sink", SinkProcessor);
    `;

    const blob = new Blob([processorCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);

    await ctx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    // Create the worklet node
    const sinkNode = new AudioWorkletNode(ctx, "test-sink", {
      channelCount: numberOfChannels,
      channelCountMode: "explicit",
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [numberOfChannels],
    });

    // Collect messages from the processor
    const messages: any[] = [];
    sinkNode.port.onmessage = (e) => {
      messages.push(e.data);
    };

    // Create a buffer source and connect it through to the sink
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(sinkNode);
    sinkNode.connect(ctx.destination);
    source.start(0);

    // Render the audio
    await ctx.startRendering();

    // Wait a bit for messages to arrive
    await new Promise((r) => setTimeout(r, 100));

    console.log("Total messages received:", messages.length);
    console.log("First few messages:", JSON.stringify(messages.slice(0, 3), null, 2));
    
    // Check results
    expect(messages.length).toBeGreaterThan(0);
    
    // Check if we received valid audio data
    const validMessages = messages.filter(m => m.hasNonZero && !m.hasNaN);
    console.log("Messages with valid non-zero data:", validMessages.length);
    
    if (validMessages.length === 0) {
      console.log("WARNING: No valid audio data received in AudioWorklet!");
      console.log("All messages:", JSON.stringify(messages, null, 2));
    }
    
    // This is the key assertion - we should receive non-zero, non-NaN audio
    expect(validMessages.length).toBeGreaterThan(0);
  });

  it("should work with a gain node in between (like DiffusionStudio)", async () => {
    const sampleRate = 48000;
    const numberOfChannels = 2;
    const duration = 0.1;
    const length = sampleRate * duration;

    const ctx = new OfflineAudioContext({
      numberOfChannels,
      length,
      sampleRate,
    });

    // Create audio buffer with test signal
    const audioBuffer = ctx.createBuffer(numberOfChannels, length, sampleRate);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
      }
    }

    // Register processor
    const processorCode = `
      class SinkProcessor2 extends AudioWorkletProcessor {
        constructor() {
          super();
        }
        process(inputs, outputs) {
          const input = inputs[0];
          if (input && input[0] && input[0].length > 0) {
            const data = new Float32Array(input.length * input[0].length);
            for (let ch = 0; ch < input.length; ch++) {
              data.set(input[ch], ch * input[0].length);
            }
            this.port.postMessage({
              firstValues: Array.from(data.slice(0, 10)),
              hasNaN: data.some(v => Number.isNaN(v)),
              allZero: data.every(v => v === 0),
            });
          }
          return true;
        }
      }
      registerProcessor("test-sink2", SinkProcessor2);
    `;

    const blob = new Blob([processorCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    await ctx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    // Create gain node (like DiffusionStudio does)
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.0;

    // Create sink node
    const sinkNode = new AudioWorkletNode(ctx, "test-sink2", {
      channelCount: numberOfChannels,
      channelCountMode: "explicit",
      numberOfInputs: 1,
      numberOfOutputs: 1,
    });

    const messages: any[] = [];
    sinkNode.port.onmessage = (e) => {
      messages.push(e.data);
    };

    // Connect: source -> gain -> sink -> destination
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(sinkNode);
    sinkNode.connect(ctx.destination);
    source.start(0);

    await ctx.startRendering();
    await new Promise((r) => setTimeout(r, 100));

    console.log("\n=== With Gain Node ===");
    console.log("Messages received:", messages.length);
    
    const validMessages = messages.filter(m => !m.hasNaN && !m.allZero);
    console.log("Valid messages:", validMessages.length);
    
    if (messages.length > 0) {
      console.log("Sample message:", JSON.stringify(messages[0], null, 2));
    }

    expect(messages.length).toBeGreaterThan(0);
    expect(validMessages.length).toBeGreaterThan(0);
  });
});
