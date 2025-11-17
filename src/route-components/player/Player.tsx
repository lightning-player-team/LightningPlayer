import { convertFileSrc } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { VideoCodec } from "../../shared/types/codecs";
import { VideoFileExtension } from "../../shared/types/fileExtensions";
import { IMediaInfo } from "../../shared/types/mediaInfo";
import { getFileExtension } from "../../shared/utils/getFileExtension";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { videoStyles } from "./Player.styles";
import { transmuxVideo } from "./transmuxVideo";

export const Player: FC = () => {
  const { state } = useLocation();
  const files = state.files as string[];
  const [filePath, setFilePath] = useState<string>(files[0]);
  const [mediaInfo, setMediaInfo] = useState<IMediaInfo | undefined>(undefined);

  // Retrieving media info using ffprobe.
  useEffect(() => {
    let unmounted = false;
    const fetchVideo = async (filePath: string) => {
      let metadata: IMediaInfo | undefined = undefined;
      try {
        const result = await Command.sidecar("binaries/ffprobe", [
          filePath,
          ..."-v quiet -print_format json -show_streams -show_format".split(
            " "
          ),
        ]).execute();
        metadata = JSON.parse(result.stdout);
        console.log("ffprobe output:", metadata);
      } catch (error) {
        console.error("Error retrieving video metadata:", error);
      }
      if (!metadata) {
        throw new Error("Error retrieving video metadata: No ffprobe output");
      }
      const firstVideoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (firstVideoStream) {
        const videoCodecName = firstVideoStream?.codec_name;
        const videoExtension = getFileExtension(filePath);
        console.log(
          "Video codec:",
          videoCodecName,
          ", extension:",
          videoExtension
        );
        switch (videoCodecName) {
          case VideoCodec.H264: {
            if (videoExtension !== VideoFileExtension.MP4) {
              try {
                const outputFilePath = await transmuxVideo(
                  filePath,
                  VideoFileExtension.MP4
                );
                setFilePath(outputFilePath);
              } catch (error) {
                console.error(error);
              }
            }
          }
        }
      }
      if (!unmounted) {
        setMediaInfo(metadata);
      }
    };

    if (filePath) {
      fetchVideo(filePath);
    }
    return () => {
      unmounted = true;
    };
  }, [filePath]);

  return (
    <FullscreenContainer>
      <video css={videoStyles}>
        <source src={convertFileSrc(filePath)} type="video/mp4" />
      </video>
      <PlayerControlOverlay mediaInfo={mediaInfo} />
    </FullscreenContainer>
  );
};
