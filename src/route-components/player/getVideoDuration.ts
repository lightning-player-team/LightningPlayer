import { WebMediaInfo } from "web-demuxer";

export const getVideoDuration = (mediaInfo: WebMediaInfo) => {
  const videoStream = mediaInfo.streams.find(
    (stream) => stream.codec_type_string === "video"
  );
  const duration = videoStream?.duration;

  console.log(`Video duration: ${duration} seconds`);

  return duration;
};
