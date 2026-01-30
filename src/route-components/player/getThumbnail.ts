import { formatTimestamp } from "../../shared/utils/formatTimestamp";
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
  timestamp,
}: {
  thumbnailCache: PreviewThumbnailCache;
  timestamp: number;
}): Promise<string | undefined> => {
  // Round timestamp to nearest second to match auto-fill cache entries.
  const roundedTimestamp = Math.round(timestamp);

  // Check cache first.
  const cached = thumbnailCache.get(roundedTimestamp);
  if (cached) {
    // console.log(
    //   `getThumbnail: cache hit for ${formattedTimestamp}`,
    // );
    return cached;
  }

  const formattedTimestamp = formatTimestamp(roundedTimestamp);
  console.log(`getThumbnail: cache miss for ${formattedTimestamp}`);

  const result = await thumbnailCache.fetchAndCache(roundedTimestamp);

  // if (result) {
  //   console.log(`getThumbnail: cache set for ${formattedTimestamp}`);
  // }
  return result;
};
