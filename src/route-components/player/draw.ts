import { WrappedCanvas } from "mediabunny";
import { IDimensions } from "../../shared/types/dimensions";

/**
 * Draws the WrappedCanvas to the target canvas context.
 */
export const draw = ({
  ctx,
  screenDimensions,
  wrappedCanvas,
}: {
  ctx: CanvasRenderingContext2D;
  screenDimensions: IDimensions;
  wrappedCanvas: WrappedCanvas;
}) => {
  const { canvas } = wrappedCanvas;
  const heightScale = screenDimensions.height / canvas.height;
  const widthScale = screenDimensions.width / canvas.width;
  const scale = Math.min(widthScale, heightScale);
  const dh = canvas.height * scale;
  const dw = canvas.width * scale;
  let dx = 0;
  let dy = 0;
  if (widthScale < heightScale) {
    dy = (screenDimensions.height - dh) / 2;
  } else {
    dx = (screenDimensions.width - dw) / 2;
  }
  ctx.drawImage(canvas, dx, dy, dw, dh);
};
