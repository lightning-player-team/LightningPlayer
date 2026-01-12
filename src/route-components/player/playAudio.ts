import { AudioBufferSink, WrappedAudioBuffer } from "mediabunny";
import { RefObject } from "react";

/**
 * Schedules audio buffers for playback using Web Audio API.
 *
 * This function iterates over audio buffers from mediabunny and schedules them
 * for playback using AudioBufferSourceNode. It handles:
 * - Throttling when too far ahead (>1 second buffered)
 * - Scheduling future buffers with precise timing
 * - Playing partially elapsed buffers from the correct offset
 *
 * @param audioBufferIteratorRef - Ref to store audio iterator for cleanup
 * @param audioContext - Web Audio API context
 * @param audioContextStartTime - AudioContext.currentTime when playback started
 * @param currentAudioSink - AudioBufferSink for audio playback
 * @param gainNode - GainNode for volume control
 * @param time - Start time in seconds
 */
export const playAudio = async ({
  audioBufferIteratorRef,
  audioContext,
  audioContextStartTime,
  currentAudioSink,
  gainNode,
  time,
}: {
  audioBufferIteratorRef: RefObject<
    AsyncGenerator<WrappedAudioBuffer, void, unknown> | undefined
  >;
  audioContext: AudioContext;
  audioContextStartTime: number;
  currentAudioSink: AudioBufferSink;
  gainNode: GainNode;
  time: number;
}): Promise<void> => {
  // Dispose previous iterators before creating new ones.
  audioBufferIteratorRef.current?.return();

  const audioBufferIterator = currentAudioSink.buffers(time);
  audioBufferIteratorRef.current = audioBufferIterator;

  // To play back audio, we loop over all audio chunks (typically very short)
  // of the file and play them at the correct timestamp.
  // The result is a continuous, uninterrupted audio signal.
  for await (const { buffer, timestamp } of audioBufferIterator) {
    // Schedule audio buffer.
    const node = audioContext.createBufferSource();
    node.buffer = buffer;
    node.connect(gainNode);

    const currentTimestamp =
      audioContext.currentTime - audioContextStartTime + time;
    console.log(`playAudio: ${timestamp}, ${currentTimestamp}`);

    if (timestamp >= currentTimestamp) {
      // Buffer is in the future, schedule it.
      node.start(audioContextStartTime + timestamp - time);
    } else {
      // Already past start time, play from offset.
      const offset = currentTimestamp - timestamp;
      if (offset < buffer.duration) {
        node.start(audioContext.currentTime, offset);
      }
      // If offset >= buffer.duration, skip this buffer entirely.
    }

    // Throttle if too far ahead (>1 second buffered).
    if (timestamp - currentTimestamp >= 1) {
      await new Promise<void>((resolve) => {
        const id = setInterval(() => {
          const currentTimestamp =
            audioContext.currentTime - audioContextStartTime + time;
          console.log(
            `Throttling playAudio: ${timestamp}, ${currentTimestamp}`
          );
          if (timestamp - currentTimestamp < 1) {
            clearInterval(id);
            resolve();
          }
        }, 100);
      });
    }
  }
};
