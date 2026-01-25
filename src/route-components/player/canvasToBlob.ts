/**
 * Converts an HTMLCanvasElement or OffscreenCanvas to a Blob.
 */
export const canvasToBlob = async (
  canvas: HTMLCanvasElement | OffscreenCanvas,
): Promise<Blob | null> => {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob();
  }
  return new Promise((resolve) => canvas.toBlob(resolve));
};
