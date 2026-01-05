import { WebDemuxer } from "web-demuxer";

export const getFPS = async (demuxer: WebDemuxer) => {
  const mediaInfo = await demuxer.getMediaInfo();
  const videoStream = mediaInfo.streams.find(
    (stream) => stream.codec_type_string === "video"
  );
  let fps = 30;
  if (videoStream && videoStream.r_frame_rate) {
    const [numerator, denominator] = videoStream.r_frame_rate
      .split("/")
      .map(Number);
    if (denominator && denominator > 0) {
      fps = numerator / denominator;
    }
  } else if (videoStream && videoStream.avg_frame_rate) {
    const [numerator, denominator] = videoStream.avg_frame_rate
      .split("/")
      .map(Number);
    if (denominator && denominator > 0) {
      fps = numerator / denominator;
    }
  }

  // console.log(`Media Info: ${JSON.stringify(mediaInfo, null, 2)}`);
  console.log(`Video frame rate: ${fps} fps`);

  return fps;
};
