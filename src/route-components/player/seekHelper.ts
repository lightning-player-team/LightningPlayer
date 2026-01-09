import { CanvasSink, WrappedCanvas } from "mediabunny";
import { RefObject } from "react";
import { Dimensions } from "../../shared/types/dimensions";
import { draw } from "./draw";

/**
 * Seek to time in seconds.
 *
 * @param canvasRef - Ref to the HTML canvas element for rendering
 * @param currentFrameRef - Ref to the current frame awaiting render
 * @param currentVideoSink - The CanvasSink instance providing decoded frames
 * @param screenDimensionsRef - Ref to current screen dimensions for scaling
 * @param time - Seek time in seconds
 */
export const seekHelper = async ({
  canvasRef,
  currentFrameRef,
  currentVideoSink,
  screenDimensionsRef,
  time,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  currentFrameRef: RefObject<WrappedCanvas | undefined>;
  currentVideoSink: CanvasSink | undefined;
  screenDimensionsRef: RefObject<Dimensions | null>;
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

  currentFrameRef.current = wrappedCanvas;
  draw({
    canvasRef,
    screenDimensions: screenDimensionsRef.current,
    wrappedCanvas,
  });
};
