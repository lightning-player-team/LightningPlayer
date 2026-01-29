import { CanvasSink } from "mediabunny";
import { canvasToThumbnailBlob } from "./canvasToBlob";
import { PreviewThumbnailCache } from "./PreviewThumbnailCache";

/**
 * Fetches a thumbnail for the given timestamp, using cache if available.
 *
 * @param thumbnailCache - The thumbnail cache instance.
 * @param thumbnailVideoSink - A dedicated CanvasSink for thumbnail fetching (separate from playback sink).
 * @param timestamp - The timestamp in seconds.
 * @returns A promise that resolves to an object URL of the thumbnail image, or undefined if unavailable.
 */
export const getThumbnail = async ({
  thumbnailCache,
  thumbnailVideoSink,
  timestamp,
}: {
  thumbnailCache: PreviewThumbnailCache | undefined;
  thumbnailVideoSink: CanvasSink | undefined;
  timestamp: number;
}): Promise<string | undefined> => {
  // Round timestamp to nearest second to match auto-fill cache entries.
  const roundedTimestamp = Math.round(timestamp);

  // Check cache first.
  const cached = thumbnailCache?.get(roundedTimestamp);
  if (cached) {
    // console.log(`getThumbnail: cache hit for ${roundedTimestamp}`);
    return cached;
  }

  if (!thumbnailVideoSink) return undefined;

  // console.log(`getThumbnail: cache miss for ${roundedTimestamp}`);

  try {
    // Fetch at rounded timestamp for consistency with cache.
    const canvas = await thumbnailVideoSink.getCanvas(roundedTimestamp);
    if (!canvas) return undefined;
    const blob = await canvasToThumbnailBlob(canvas.canvas);
    if (!blob) return undefined;

    const url = URL.createObjectURL(blob);

    // Add to cache at rounded timestamp.
    if (thumbnailCache) {
      thumbnailCache.set(roundedTimestamp, url, blob.size);
    }

    return url;
  } catch (error) {
    console.error(`Error fetching thumbnail for ${roundedTimestamp}s:`, error);
    return undefined;
  }
};
