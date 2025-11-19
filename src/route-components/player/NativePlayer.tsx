import { FC, useRef } from "react";
import { IMediaInfo } from "../../shared/types/mediaInfo";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { videoStyles } from "./Player.styles";

export interface INativePlayerProps {
  mediaInfo?: IMediaInfo;
  src: string;
}

export const NativePlayer: FC<INativePlayerProps> = ({ mediaInfo, src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <>
      <video autoPlay={true} css={videoStyles} muted={false} ref={videoRef}>
        <source src={src} />
      </video>
      <PlayerControlOverlay mediaInfo={mediaInfo} />
    </>
  );
};
