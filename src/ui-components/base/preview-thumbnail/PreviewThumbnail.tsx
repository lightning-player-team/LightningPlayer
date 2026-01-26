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

  useEffect(() => {
    let unmounted = false;

    const fetchThumbnail = async () => {
      const url = await getThumbnail(timestamp);
      if (unmounted) {
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
    };

    fetchThumbnail();

    return () => {
      unmounted = true;
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
