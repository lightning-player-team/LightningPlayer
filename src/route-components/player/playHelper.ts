import {
  AudioBufferSink,
  CanvasSink,
  WrappedAudioBuffer,
  WrappedCanvas,
} from "mediabunny";
import { Dispatch, RefObject, SetStateAction } from "react";
import { IDimensions } from "../../shared/types/dimensions";
import { draw } from "./draw";
import { playAudio } from "./playAudio";

/**
 * Starts video and audio playback from a specified time.
 *
 * This helper manages playback by:
 * 1. Creating async iterators from CanvasSink and AudioBufferSink
 * 2. Using AudioContext.currentTime as the master clock for synchronization
 * 3. Running audio scheduling in parallel via playAudio
 * 4. Running a requestAnimationFrame loop for video rendering
 *
 * The playLoop's RAF id is stored in playRAFRef, which allows cancellation.
 *
 * @param audioContext - AudioContext for calculating timing and audio playback
 * @param audioBufferIteratorRef - Ref to store audio iterator for cleanup on pause
 * @param canvasIteratorRef - Ref to store the frame iterator - for cleanup on pause
 * @param currentAudioSink - AudioBufferSink for audio decoding (undefined if no audio)
 * @param currentFrameRef - Ref to the current frame awaiting render - for resize handling
 * @param currentVideoSink - The CanvasSink instance providing decoded frames
 * @param ctx - Canvas 2D rendering context
 * @param duration - Total video duration in seconds (for end-of-video detection)
 * @param gainNode - GainNode for volume control
 * @param playRAFRef - Ref to store requestAnimationFrame ID for cancellation/pause
 * @param screenDimensionsRef - Ref to current screen dimensions - for resize handling
 * @param setIsPlaying - State setter for playback status
 * @param setProgress - State setter for playback progress in seconds
 * @param time - Start time in seconds
 */
export const playHelper = async ({
  audioContext,
  audioBufferIteratorRef,
  canvasIteratorRef,
  currentAudioSink,
  currentFrameRef,
  currentVideoSink,
  ctx,
  duration,
  gainNode,
  playRAFRef,
  queuedAudioNodesRef,
  screenDimensionsRef,
  setIsPlaying,
  setProgress,
  time,
}: {
  audioContext: AudioContext;
  audioBufferIteratorRef: RefObject<
    AsyncGenerator<WrappedAudioBuffer, void, unknown> | undefined
  >;
  canvasIteratorRef: RefObject<
    AsyncGenerator<WrappedCanvas, void, unknown> | undefined
  >;
  currentAudioSink: AudioBufferSink | undefined;
  currentFrameRef: RefObject<WrappedCanvas | undefined>;
  currentVideoSink: CanvasSink | undefined;
  ctx: CanvasRenderingContext2D;
  duration: number;
  gainNode?: GainNode;
  playRAFRef: RefObject<number | undefined>;
  queuedAudioNodesRef: RefObject<Set<AudioBufferSourceNode>>;
  screenDimensionsRef: RefObject<IDimensions | undefined>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  time: number;
}): Promise<void> => {
  console.log(`play: started for ${time}`);
  if (!currentVideoSink) {
    console.log("Error playing: no currentVideoSink.");
    return;
  }

  /**
   * Playing audio and setting up timer, as video playback is based on the AudioContext's
   * clock for synchronization.
   */

  // Resume audio context if suspended (browser autoplay policy).
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  // Capture timing values at playback start.
  const audioContextStartTime = audioContext.currentTime;

  // Start audio playback in parallel (doesn't block).
  if (currentAudioSink && gainNode) {
    const audioBufferIterator = currentAudioSink.buffers(time);
    audioBufferIteratorRef.current = audioBufferIterator;
    playAudio({
      audioBufferIteratorRef,
      audioContext,
      audioContextStartTime,
      currentAudioSink,
      gainNode,
      queuedAudioNodesRef,
      time,
    });
  }

  /**
   * Playing video by looping over frames and rendering them at the correct timestamp.
   */

  // Dispose previous iterators before creating new ones.
  canvasIteratorRef.current?.return();

  const canvasIterator = currentVideoSink.canvases(time);
  canvasIteratorRef.current = canvasIterator;

  const firstFrame = (await canvasIterator.next()).value;
  if (!firstFrame) {
    console.error("Error playing: no start frame.");
    return;
  }
  currentFrameRef.current = firstFrame;

  const getNextFrame = async (timestamp: number) => {
    // Possible to skip multiple frames when the video's fps is
    // higher than what the webview can handle.
    while (true) {
      const nextFrame = (await canvasIterator.next()).value;
      if (!nextFrame) {
        console.log("getNextFrame: no next frame.");
        return;
      }
      if (nextFrame.timestamp >= timestamp) {
        currentFrameRef.current = nextFrame;
        return;
      }
      // Skipping frames until we reach the target timestamp.
    }
  };

  let startRafTimeStamp: number | undefined = undefined;
  const playLoop = (rafTimeStamp: number) => {
    const currentFrame = currentFrameRef.current;

    // Calculate current playback position.
    const timestampInVideo =
      audioContext.currentTime - audioContextStartTime + time;
    // Only comparing this for logging purposes.
    if (!startRafTimeStamp) {
      startRafTimeStamp = rafTimeStamp;
    }

    if (!currentFrame) {
      if (timestampInVideo >= duration) {
        console.log("playLoop: playback finished: no next frame.");
        setIsPlaying(false);
        return;
      } else {
        console.log(
          "Waiting for getNextFrame to resolve, skipping animation frame...",
        );
        playRAFRef.current = requestAnimationFrame(playLoop);
        return;
      }
    }

    // console.log(
    //   currentFrame?.timestamp,
    //   timestampInVideo,
    //   (rafTimeStamp - startRafTimeStamp) / 1000,
    // );

    if (currentFrame.timestamp <= timestampInVideo) {
      const screenDimensions = screenDimensionsRef.current;
      if (!screenDimensions) {
        console.error("Error playing: no screen dimensions.");
        return;
      }
      draw({
        ctx,
        screenDimensions,
        wrappedCanvas: currentFrame,
      });

      setProgress(timestampInVideo);

      currentFrameRef.current = undefined;
      getNextFrame(timestampInVideo);
    }
    playRAFRef.current = requestAnimationFrame(playLoop);
  };

  setIsPlaying(true);
  requestAnimationFrame(playLoop);
  console.log("play: started.");
};
