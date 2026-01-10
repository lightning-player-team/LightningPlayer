import { CanvasSink, WrappedCanvas } from "mediabunny";
import { Dispatch, RefObject, SetStateAction } from "react";
import { Dimensions } from "../../shared/types/dimensions";
import { draw } from "./draw";

/**
 * Starts video playback from a specified time using requestAnimationFrame.
 *
 * This helper manages the video playback loop by:
 * 1. Creating an async iterator from CanvasSink to stream decoded frames
 * 2. Running a requestAnimationFrame loop, in which each iteration (playLoop)
 * either idles or render the current frame and fetch the next one (getNextFrame).
 * 3. Updating progress state as playback advances
 *
 * The playLoop uses timestamps to display the frames at the right time:
 * - timestamp: parameter of requestAnimationFrame, in milliseconds. This is
 * used together with startTimestamp to calculate where the loop is in the
 * video's timestamp.
 * - currentFrame.timestamp: from WrappedCanvas.timestamp, in seconds.
 *
 * The playLoop's RAF id is stored in playRAFRef, which allows cancellation,
 * aka pausing playback.
 *
 * @param canvasIteratorRef - Ref to store the frame iterator for cleanup on pause
 * @param canvasRef - Ref to the HTML canvas element for rendering
 * @param currentFrameRef - Ref to the current frame awaiting render
 * @param currentVideoSink - The CanvasSink instance providing decoded frames
 * @param duration - Total video duration in seconds (for end-of-video detection)
 * @param playRAFRef - Ref to store requestAnimationFrame ID for cancellation/pause.
 * @param screenDimensionsRef - Ref to current screen dimensions for scaling
 * @param setIsPlaying - State setter for playback status
 * @param setProgress - State setter for playback progress in seconds
 * @param time - Start time in seconds
 */
export const playHelper = async ({
  canvasIteratorRef,
  canvasRef,
  currentFrameRef,
  currentVideoSink,
  duration,
  playRAFRef,
  screenDimensionsRef,
  setIsPlaying,
  setProgress,
  time,
}: {
  canvasIteratorRef: RefObject<
    AsyncGenerator<WrappedCanvas, void, unknown> | undefined
  >;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  currentFrameRef: RefObject<WrappedCanvas | undefined>;
  currentVideoSink: CanvasSink | undefined;
  duration: number;
  playRAFRef: RefObject<number | null>;
  screenDimensionsRef: RefObject<Dimensions | null>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  time: number;
}): Promise<void> => {
  console.log(`play: started for ${time}`);
  if (!currentVideoSink) {
    console.log("Error playing: no currentVideoSink.");
    return;
  }

  // Dispose previous iterator before creating a new one.
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

  const startTimestampInVideo = firstFrame.timestamp;
  let startTimestamp: number | undefined = undefined;

  const playLoop = (timestamp: number) => {
    const currentFrame = currentFrameRef.current;

    if (startTimestamp === undefined) {
      startTimestamp = timestamp;
    }
    const timestampInVideo =
      startTimestampInVideo + (timestamp - startTimestamp) / 1000;

    if (!currentFrame) {
      if (timestampInVideo >= duration) {
        console.log("playLoop: playback finished: no next frame.");
        setIsPlaying(false);
        return;
      } else {
        console.log(
          "Waiting for getNextFrame to resolve, skipping animation frame..."
        );
        playRAFRef.current = requestAnimationFrame(playLoop);
        return;
      }
    }

    console.log(timestamp, currentFrame?.timestamp, timestampInVideo);

    if (currentFrame.timestamp <= timestampInVideo) {
      draw({
        canvasRef,
        screenDimensions: screenDimensionsRef.current,
        wrappedCanvas: currentFrame,
      });
      currentFrameRef.current = undefined;

      setProgress(timestampInVideo);

      getNextFrame(timestampInVideo);
    }
    playRAFRef.current = requestAnimationFrame(playLoop);
  };

  setIsPlaying(true);
  requestAnimationFrame(playLoop);
  console.log("play: started.");
};
