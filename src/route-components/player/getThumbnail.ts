import { CanvasSink } from "mediabunny";
import { canvasToBlob } from "./canvasToBlob";

/**
 * Fetches a thumbnail for the given timestamp.
 *
 * @returns A promise that resolves to an object URL of the thumbnail image, or undefined if unavailable.
 * The caller is responsible for revoking the object URL when no longer needed.
 */
export const getThumbnail = async ({
  timestamp,
  videoSink,
}: {
  timestamp: number;
  videoSink: CanvasSink | undefined;
}): Promise<string | undefined> => {
  if (!videoSink) return undefined;
  try {
    const canvas = await videoSink.getCanvas(timestamp);
    if (!canvas) return undefined;
    const blob = await canvasToBlob(canvas.canvas);
    if (!blob) return undefined;
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error fetching thumbnail for ${timestamp}s:`, error);
    return undefined;
  }
};
