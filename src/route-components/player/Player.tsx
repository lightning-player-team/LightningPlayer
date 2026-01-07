import { useAtomValue } from "jotai";
import {
  ALL_FORMATS,
  BlobSource,
  Input,
  InputAudioTrack,
  InputVideoTrack,
  VideoSample,
  VideoSampleSink,
} from "mediabunny";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { inputFilesState } from "../../shared/atoms/inputFilesState";
import { useDimensions } from "../../shared/hooks/useDimensions";
import { isTruthy } from "../../shared/utils/isTruthy";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";

export const Player: FC = () => {
  const files = useAtomValue(inputFilesState);

  const [progress, setProgress] = useState(0); // In seconds
  const [audioTracks, setAudioTracks] = useState<InputAudioTrack[]>([]);
  const [videoTracks, setVideoTracks] = useState<InputVideoTrack[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoSink, setCurrentVideoSink] = useState<VideoSampleSink>();
  const [currentAudioTrack, setCurrentAudioTrack] = useState<InputAudioTrack>();

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const screenDimensions = useDimensions(fullscreenContainerRef);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let unmounted = false;

    console.log("files:", files);

    const readFileMedadata = async () => {
      if (!files || files.length <= 0) {
        console.log("No files provided to Player.");
        return;
      }

      const input = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(files[0]),
      });

      const allVideoTracks = await input.getVideoTracks();
      const videoTracks = (
        await Promise.all(
          allVideoTracks.map(async (videoTrack) => {
            const decodable = await videoTrack.canDecode();
            return decodable ? videoTrack : undefined;
          })
        )
      ).filter(isTruthy);

      const audioTracks = await input.getAudioTracks();

      const duration = await videoTracks[0].computeDuration();
      const currentVideoSink = new VideoSampleSink(videoTracks[0]);

      if (!unmounted) {
        setAudioTracks(audioTracks);
        setVideoTracks(videoTracks);
        setCurrentVideoSink(currentVideoSink);
        setCurrentAudioTrack(audioTracks[0]);

        setDuration(duration);
      }
    };

    readFileMedadata();

    return () => {
      unmounted = true;
    };
  }, [files]);

  const draw = useCallback(
    (videoSample: VideoSample, ctx: CanvasRenderingContext2D) => {
      if (!screenDimensions) {
        console.error("Error drwaing: no screen dimensions.");
        return;
      }
      const { displayWidth, displayHeight } = videoSample;
      const widthScale = screenDimensions.width / displayWidth;
      const heightScale = screenDimensions.height / displayHeight;
      const scale = Math.min(widthScale, heightScale);
      const dw = displayWidth * scale;
      const dh = displayHeight * scale;
      let dx = 0;
      let dy = 0;
      if (widthScale < heightScale) {
        dy = (screenDimensions.height - dh) / 2;
      } else {
        dx = (screenDimensions.width - dw) / 2;
      }
      videoSample.draw(ctx, dx, dy, dw, dh);
      videoSample.close();
    },
    [screenDimensions]
  );

  /* Time in seconds. */
  const seek = useCallback(
    async (time: number) => {
      if (!currentVideoSink) {
        console.log("Error seeking: no currentVideoSink.");
        return;
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.error("Error seeking: no 2D context.");
        return;
      }

      const videoSample = await currentVideoSink.getSample(time);
      if (!videoSample) {
        console.error("Error seeking: getSample failed.");
        return;
      }
      draw(videoSample, ctx);
    },
    [currentVideoSink, draw]
  );

  useEffect(() => {
    seek(0);
  }, [seek]);

  console.log("audioTracks:", audioTracks);
  console.log("videoTracks:", videoTracks);

  if (!files) {
    return;
  }

  return (
    <FullscreenContainer ref={fullscreenContainerRef}>
      <PlayerControlOverlay
        duration={duration}
        seek={seek}
        setProgress={setProgress}
        progress={progress}
      />

      <canvas
        id="example-play-canvas"
        width={screenDimensions?.width}
        height={screenDimensions?.height}
        ref={canvasRef}
      />
    </FullscreenContainer>
  );
};
