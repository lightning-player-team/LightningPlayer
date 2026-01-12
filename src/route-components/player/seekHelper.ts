import { CanvasSink, WrappedCanvas } from "mediabunny";
import { RefObject } from "react";
import { Dimensions } from "../../shared/types/dimensions";
import { draw } from "./draw";

/**
 * Seek to time in seconds.
 *
 * @param ctx - Canvas 2D rendering context
 * @param currentFrameRef - Ref to the current frame awaiting render
 * @param currentVideoSink - The CanvasSink instance providing decoded frames
 * @param screenDimensionsRef - Ref to current screen dimensions for scaling
 * @param time - Seek time in seconds
 */
export const seekHelper = async ({
  ctx,
  currentFrameRef,
  currentVideoSink,
  screenDimensionsRef,
  time,
}: {
  ctx: CanvasRenderingContext2D;
  currentFrameRef: RefObject<WrappedCanvas | undefined>;
  currentVideoSink: CanvasSink | undefined;
  screenDimensionsRef: RefObject<Dimensions | undefined>;
  time: number;
}): Promise<void> => {
  console.log(`seek: started for ${time}.`);
  if (!currentVideoSink) {
    console.log("Error seeking: no currentCanvasSink.");
    return;
  }

  const wrappedCanvas = await currentVideoSink.getCanvas(time);
  if (!wrappedCanvas) {
    console.error("Error seeking: getCanvas failed.");
    return;
  }
  const screenDimensions = screenDimensionsRef.current;
  if (!screenDimensions) {
    console.error("Error seeking: no screen dimensions.");
    return;
  }

  currentFrameRef.current = wrappedCanvas;
  draw({
    ctx,
    screenDimensions,
    wrappedCanvas,
  });
};
