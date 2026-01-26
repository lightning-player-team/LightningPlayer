import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  IDebouncedEffectCallbackParams,
  useDebouncedEffect,
} from "../../../shared/hooks/useDebouncedEffect";
import { formatTimestamp } from "../../../shared/utils/formatTimestamp";
import {
  containerStyles,
  placeholderStyles,
  thumbnailStyles,
  timestampStyles,
} from "./PreviewThumbnail.styles";

/** Debounce delay for thumbnail fetching in milliseconds. */
const THUMBNAIL_DEBOUNCE_MS = 50;

export interface IPreviewThumbnailProps {
  /**
   * @param timestamp in seconds.
   */
  getThumbnail: (timestamp: number) => Promise<string | undefined>;
  /**
   * timestamp in seconds.
   */
  timestamp: number;
}

interface IThumbnail {
  timestamp: number;
  url: string;
}

export const PreviewThumbnail: FC<IPreviewThumbnailProps> = ({
  getThumbnail,
  timestamp,
}) => {
  const [thumbnail, setThumbnail] = useState<IThumbnail | undefined>();
  const prevUrlRef = useRef<string | undefined>(undefined);

  const fetchThumbnail = useCallback(
    async (state: IDebouncedEffectCallbackParams) => {
      console.log(`PreviewThumbnail: fetching for ${timestamp}s`);
      if (state.cancelled) {
        console.log("PreviewThumbnail: cancelled before fetching.");
        return;
      }
      const url = await getThumbnail(timestamp);
      if (state.cancelled) {
        console.log("PreviewThumbnail: cancelled after fetching.");
        // Revoke if we got a URL but the effect was cancelled.
        if (url) URL.revokeObjectURL(url);
        return;
      }
      // Revoke previous URL to free memory.
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
      prevUrlRef.current = url;
      if (url) {
        setThumbnail({ timestamp, url });
      }
    },
    [getThumbnail, timestamp],
  );

  // Get thumbnail when timestamp changes but debounced.
  useDebouncedEffect(fetchThumbnail, THUMBNAIL_DEBOUNCE_MS);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  // Only show the image if it matches the current timestamp and is loaded.
  const showImage = thumbnail && thumbnail.timestamp === timestamp;

  return (
    <div css={containerStyles}>
      {showImage ? (
        <img alt="Preview" css={thumbnailStyles} src={thumbnail.url} />
      ) : (
        <div css={placeholderStyles} />
      )}
      <span css={timestampStyles}>{formatTimestamp(timestamp)}</span>
    </div>
  );
};
