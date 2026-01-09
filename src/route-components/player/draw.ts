import { VideoSample } from "mediabunny";
import { Dimensions } from "../../shared/types/dimensions";

/**
 * Tries to draw the VideoSample to canvas and closes it.
 *  */
export const draw = ({
  screenDimensions,
  videoSample,
  ctx,
}: {
  screenDimensions: Dimensions | null;
  videoSample: VideoSample;
  ctx: CanvasRenderingContext2D;
}) => {
  if (!screenDimensions) {
    console.error("Error drawing: no screen dimensions.");
    videoSample.close();
    return;
  }

  const { displayWidth, displayHeight } = videoSample;
  const widthScale = screenDimensions.width / displayWidth;
  const heightScale = screenDimensions.height / displayHeight;
  const scale = Math.min(widthScale, heightScale);
  const dw = displayWidth * scale;
  const dh = displayHeight * scale;
  let dx = 0;
  let dy = 0;
  if (widthScale < heightScale) {
    dy = (screenDimensions.height - dh) / 2;
  } else {
    dx = (screenDimensions.width - dw) / 2;
  }
  videoSample.draw(ctx, dx, dy, dw, dh);
  videoSample.close();
};
