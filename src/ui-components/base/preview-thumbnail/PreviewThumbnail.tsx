import { FC, useEffect, useRef, useState } from "react";
import {
  containerStyles,
  placeholderStyles,
  thumbnailStyles,
  timestampStyles,
} from "./PreviewThumbnail.styles";

interface PreviewThumbnailProps {
  formattedTimestamp: string;
  getThumbnail: (timestamp: number) => Promise<string | undefined>;
  timestamp: number;
}

export const PreviewThumbnail: FC<PreviewThumbnailProps> = ({
  formattedTimestamp,
  getThumbnail,
  timestamp,
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const prevUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const fetchThumbnail = async () => {
      const url = await getThumbnail(timestamp);
      if (cancelled) {
        // Revoke if we got a URL but the effect was cancelled.
        if (url) URL.revokeObjectURL(url);
        return;
      }
      // Revoke previous URL to free memory.
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
      prevUrlRef.current = url;
      setImageUrl(url);
    };

    fetchThumbnail();

    return () => {
      cancelled = true;
    };
  }, [getThumbnail, timestamp]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  return (
    <div css={containerStyles}>
      {imageUrl ? (
        <img alt="Preview" css={thumbnailStyles} src={imageUrl} />
      ) : (
        <div css={placeholderStyles} />
      )}
      <span css={timestampStyles}>{formattedTimestamp}</span>
    </div>
  );
};
