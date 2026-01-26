import { CanvasSink, WrappedCanvas } from "mediabunny";
import { RefObject } from "react";
import { IDimensions } from "../../shared/types/dimensions";
import { draw } from "./draw";

/**
 * Seek to time in seconds.
 *
 * Uses `getCanvas(time)` for direct frame access. If that returns null
 * (timestamp is before the first frame), falls back to `canvases()` iterator
 * to get the first available frame.
 *
 * @param ctx - Canvas 2D rendering context.
 * @param currentFrameRef - Ref to the current frame awaiting render.
 * @param currentVideoSink - The CanvasSink instance providing decoded frames.
 * @param screenDimensionsRef - Ref to current screen dimensions for scaling.
 * @param time - Seek time in seconds.
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
  screenDimensionsRef: RefObject<IDimensions | undefined>;
  time: number;
}): Promise<void> => {
  console.log(`seek: started for ${time}.`);
  if (!currentVideoSink) {
    console.log("Error seeking: no currentCanvasSink.");
    return;
  }

  const screenDimensions = screenDimensionsRef.current;
  if (!screenDimensions) {
    console.error("Error seeking: no screen dimensions.");
    return;
  }

  let wrappedCanvas = await currentVideoSink.getCanvas(time);

  // getCanvas returns null if time is before the first frame's timestamp.
  // Fall back to canvases() iterator to get the first available frame.
  if (!wrappedCanvas) {
    console.log(
      `seek: getCanvas(${time}) returned null, using first frame fallback.`,
    );
    const iterator = currentVideoSink.canvases(time);
    const result = await iterator.next();
    await iterator.return();
    if (!result.done) {
      wrappedCanvas = result.value;
    }
  }

  if (!wrappedCanvas) {
    console.error("Error seeking: no frame available.");
    return;
  }

  currentFrameRef.current = wrappedCanvas;
  draw({
    ctx,
    screenDimensions,
    wrappedCanvas,
  });
};
