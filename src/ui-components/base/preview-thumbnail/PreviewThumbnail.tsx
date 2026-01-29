import { FC, useEffect, useRef, useState } from "react";
import { formatTimestamp } from "../../../shared/utils/formatTimestamp";
import {
  containerStyles,
  loadingDotStyles,
  loadingOverlayStyles,
  thumbnailContainerStyles,
  thumbnailStyles,
  timestampStyles,
} from "./PreviewThumbnail.styles";

export interface IPreviewThumbnailProps {
  /**
   * Fetches thumbnail URL for timestamp. Returns cached URL immediately if available.
   *
   * @param timestamp in seconds.
   */
  getThumbnail: (timestamp: number) => Promise<string | undefined>;
  /**
   * timestamp in seconds.
   */
  timestamp: number;
}

export const PreviewThumbnail: FC<IPreviewThumbnailProps> = ({
  getThumbnail,
  timestamp,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  // Track if image has loaded successfully.
  const [currentThumbnailTimestamp, setCurrentThumbnailTimestamp] = useState<
    number | undefined
  >(undefined);
  const roundedTimestamp = Math.round(timestamp);

  // Fetch thumbnail when timestamp changes (debounced).
  // useDebouncedEffect(fetchThumbnail, THUMBNAIL_DEBOUNCE_MS);
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      if (cancelled) {
        return;
      }

      const url = await getThumbnail(roundedTimestamp);

      if (cancelled) {
        return;
      }

      if (url && imgRef.current) {
        // Update img src imperatively - no React state delay.
        imgRef.current.src = url;
        imgRef.current.onload = () => {
          setCurrentThumbnailTimestamp(roundedTimestamp);
        };
      }
    };
    fetch();

    return () => {
      cancelled = true;
    };
  }, [getThumbnail, roundedTimestamp]);

  const handleError = () => {
    setCurrentThumbnailTimestamp(undefined);
  };

  const isLoading = currentThumbnailTimestamp !== roundedTimestamp;

  return (
    <div css={containerStyles}>
      <div css={thumbnailContainerStyles}>
        {/* Always render img, hide via CSS when not loaded. */}
        <img
          alt="Preview"
          css={thumbnailStyles}
          onError={handleError}
          ref={imgRef}
        />
        <div css={loadingOverlayStyles} data-loading={isLoading}>
          <div css={loadingDotStyles} />
          <div css={loadingDotStyles} />
          <div css={loadingDotStyles} />
        </div>
      </div>
      <span css={timestampStyles}>{formatTimestamp(roundedTimestamp)}</span>
    </div>
  );
};
