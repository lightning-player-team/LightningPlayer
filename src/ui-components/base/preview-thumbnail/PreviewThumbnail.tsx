import { FC, useEffect, useRef, useState } from "react";
import { formatTimestamp } from "../../../shared/utils/formatTimestamp";
import {
  containerStyles,
  placeholderStyles,
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
  // Track the rounded timestamp that's currently displayed.
  const displayedTimestampRef = useRef<number | undefined>(undefined);
  // Track if image has loaded successfully.
  const [hasImage, setHasImage] = useState(false);

  // Fetch thumbnail when timestamp changes (debounced).
  // useDebouncedEffect(fetchThumbnail, THUMBNAIL_DEBOUNCE_MS);
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      const roundedTimestamp = Math.round(timestamp);

      // Skip if already displaying this timestamp.
      if (displayedTimestampRef.current === roundedTimestamp) {
        return;
      }

      if (cancelled) {
        return;
      }

      const url = await getThumbnail(timestamp);

      if (cancelled) {
        return;
      }

      if (url && imgRef.current) {
        // Update img src imperatively - no React state delay.
        imgRef.current.src = url;
        displayedTimestampRef.current = roundedTimestamp;
      }
    };
    fetch();

    return () => {
      cancelled = true;
    };
  }, [getThumbnail, timestamp]);

  // Note: URL lifecycle is managed by ThumbnailCache, not this component.

  const handleImageLoad = () => {
    setHasImage(true);
  };

  const handleImageError = () => {
    setHasImage(false);
  };

  return (
    <div css={containerStyles}>
      {/* Always render img, hide via CSS when not loaded */}
      <img
        alt="Preview"
        css={[thumbnailStyles, { display: hasImage ? "block" : "none" }]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        ref={imgRef}
      />
      {!hasImage && <div css={placeholderStyles} />}
      <span css={timestampStyles}>{formatTimestamp(timestamp)}</span>
    </div>
  );
};
