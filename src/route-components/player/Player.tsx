import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { WebDemuxer } from "web-demuxer";
import { useDimensions } from "../../shared/hooks/useDimensions";
import { wait } from "../../shared/utils/wait";
import { Button } from "../../ui-components/base/button/Button";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { getFPS } from "./getFPS";
import { playerControlOverlayStyles } from "./Player.styles";

export const Player: FC = () => {
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [fps, setFps] = useState<number | undefined>(undefined);

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const screenDimensions = useDimensions(fullscreenContainerRef);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const demuxerRef = useRef<WebDemuxer>(
    new WebDemuxer({
      wasmFilePath: new URL(
        "./dist/wasm-files/web-demuxer.wasm",
        window.location.origin
      ).href,
    })
  );
  const decoderRef = useRef<VideoDecoder | null>(null);

  const files = state.files as string[];
  console.log("files:", files);

  // Initializing demuxer and setting fps.
  // Should only run once per files change.
  useEffect(() => {
    const setUpDemuxer = async (): Promise<boolean> => {
      const demuxer = demuxerRef.current;
      if (!files || files.length === 0) {
        console.error("Initialization failed: no files.");
        return false;
      }

      await demuxer.load(files[0]);
      const fps = await getFPS(demuxer);
      setFps(fps);
      return true;
    };

    if (loading) {
      setUpDemuxer().then((success) => {
        if (success) {
          setLoading(false);
        }
      });
    }
  }, [files, loading]);

  const setUpDecoder = useCallback(async () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Error setting up decoder: no canvas.");
      return false;
    }

    if (!screenDimensions) {
      console.error("Error setting up decoder: no screen dimensions.");
      return false;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Error setting up decoder: no 2D context.");
      return false;
    }

    const demuxer = demuxerRef.current;
    if (decoderRef.current && decoderRef.current.state !== "closed") {
      console.log("Closing existing decoder.");
      decoderRef.current.close();
    }
    const videoDecoderConfig = await demuxer.getDecoderConfig("video");
    decoderRef.current = new VideoDecoder({
      output: (frame) => {
        const widthScale = screenDimensions.width / frame.displayWidth;
        const heightScale = screenDimensions.height / frame.displayHeight;
        const scale = Math.min(widthScale, heightScale);
        const dw = frame.displayWidth * scale;
        const dh = frame.displayHeight * scale;
        let dx = 0;
        let dy = 0;
        if (widthScale < heightScale) {
          dy = (screenDimensions.height - dh) / 2;
        } else {
          dx = (screenDimensions.width - dw) / 2;
        }
        ctx.drawImage(frame, dx, dy, dw, dh);
        frame.close();
      },
      error: (error) => {
        console.error("video decoder error:", error);
      },
    });
    decoderRef.current.configure(videoDecoderConfig);
    return true;
  }, [screenDimensions]);

  // Handling canvas resize: setUpDecoder is updated upon dimension changes.
  useEffect(() => {
    if (!loading) {
      setUpDecoder().then((success) => {
        if (success) {
          const decoder = decoderRef.current;
          demuxerRef.current
            .seek("video", 0)
            .then((firstVideoChunk) => {
              decoder?.decode(firstVideoChunk);
              decoder?.flush();
            })
            .catch((error) => {
              console.error("Error rendering first frame:", error);
            });
        }
      });
    }
  }, [loading, setUpDecoder]);

  const handleOnClickPlay = async () => {
    const demuxer = demuxerRef.current;
    const decoder = decoderRef.current;

    if (loading) {
      console.error("Still loading.");
      return;
    }
    if (!decoder) {
      console.error("No decoder.");
      return;
    }
    if (!fps) {
      console.error("No fps.");
      return;
    }

    const reader = demuxer.read("video").getReader();
    reader
      .read()
      .then(async function processPacket({ done, value }): Promise<void> {
        if (done) {
          decoder.flush();
          console.log("read finished");
          return;
        }

        decoder.decode(value);

        // play as frame rate
        await wait(1000 / fps);

        return reader.read().then(processPacket);
      });
  };

  return (
    <FullscreenContainer ref={fullscreenContainerRef}>
      <div css={playerControlOverlayStyles}>
        <Button onClick={handleOnClickPlay}>Play</Button>
      </div>

      <PlayerControlOverlay />

      <canvas
        id="example-play-canvas"
        width={screenDimensions?.width}
        height={screenDimensions?.height}
        ref={canvasRef}
      />
    </FullscreenContainer>
  );
};
