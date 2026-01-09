import { useAtomValue } from "jotai";
import {
  ALL_FORMATS,
  BlobSource,
  CanvasSink,
  Input,
  InputAudioTrack,
  InputVideoTrack,
  WrappedCanvas,
} from "mediabunny";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { inputFilesState } from "../../shared/atoms/inputFilesState";
import { Dimensions } from "../../shared/types/dimensions";
import { debounce } from "../../shared/utils/debounce";
import { isTruthy } from "../../shared/utils/isTruthy";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { draw } from "./draw";

export const Player: FC = () => {
  const files = useAtomValue(inputFilesState);

  // Progress in seconds.
  const [progress, setProgress] = useState(0);
  // Avoids relying on progess in the resize handler.
  const progressRef = useRef(0);
  const [_audioTracks, setAudioTracks] = useState<InputAudioTrack[]>([]);
  const [_videoTracks, setVideoTracks] = useState<InputVideoTrack[]>([]);
  const [currentVideoSink, setCurrentVideoSink] = useState<CanvasSink>();
  const [duration, setDuration] = useState<number>(0);
  // const [audioContext, setAudioContext] = useState<AudioContext>();
  const [_currentAudioTrack, setCurrentAudioTrack] =
    useState<InputAudioTrack>();
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);

  // const audioContextStartTimeRef = useRef<number>(undefined);

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const screenDimensionsRef = useRef<Dimensions>(null);

  // Play function's requestAnimationFrame ref.
  const playRAFRef = useRef<number>(null);
  // Used by the play loop to keep track of the frame to render.
  const currentFrameRef = useRef<WrappedCanvas | undefined>(undefined);
  // Canvas iterator ref for proper cleanup.
  const canvasIteratorRef = useRef<ReturnType<CanvasSink["canvases"]>>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Seek to time in seconds.
   */
  const seek = useCallback(
    async (time: number) => {
      console.log(`seek: started for ${time}.`);
      if (!currentVideoSink) {
        console.log("Error seeking: no currentCanvasSink.");
        return;
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.error("Error seeking: no 2D context.");
        return;
      }

      const wrappedCanvas = await currentVideoSink.getCanvas(time);
      if (!wrappedCanvas) {
        console.error("Error seeking: getCanvas failed.");
        return;
      }

      currentFrameRef.current = wrappedCanvas;
      draw({
        ctx,
        screenDimensions: screenDimensionsRef.current,
        wrappedCanvas,
      });
    },
    [currentVideoSink]
  );

  /**
   * Start playback at time in seconds.
   */
  const play = useCallback(
    async (time: number) => {
      console.log(`play: started for ${time}`);
      if (!currentVideoSink) {
        console.log("Error playing: no currentVideoSink.");
        return;
      }

      // CanvasRef isn't expected to change, so keep out of play loop.
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.error("Error playing: no 2D context.");
        return;
      }

      // Dispose previous iterator before creating a new one.
      canvasIteratorRef.current?.return?.();
      const canvasIterator = currentVideoSink.canvases(time);
      canvasIteratorRef.current = canvasIterator;
      const firstFrame = (await canvasIterator.next()).value;
      if (!firstFrame) {
        console.error("Error playing: no start frame.");
        return;
      }
      currentFrameRef.current = firstFrame;

      const getNextFrame = async (timestamp: number) => {
        // Possible to skip multiple frames when the video's fps is
        // higher than what the webview can handle.
        while (true) {
          const nextFrame = (await canvasIterator.next()).value;
          if (!nextFrame) {
            console.log("getNextFrame: no next frame.");
            return;
          }
          if (nextFrame.timestamp >= timestamp) {
            currentFrameRef.current = nextFrame;
            return;
          }
          // Skipping frames until we reach the target timestamp.
        }
      };

      const startTimestampInVideo = firstFrame.timestamp;
      let startTimestamp: number | undefined = undefined;

      const playLoop = (timestamp: number) => {
        const nextFrame = currentFrameRef.current;

        if (startTimestamp === undefined) {
          startTimestamp = timestamp;
        }
        const timestampInVideo =
          startTimestampInVideo + (timestamp - startTimestamp) / 1000;

        if (!nextFrame) {
          if (timestampInVideo >= duration) {
            console.log("playLoop: playback finished: no next frame.");
            setIsPlaying(false);
            return;
          } else {
            console.log(
              "Waiting for getNextFrame to resolve, skipping animation frame..."
            );
            playRAFRef.current = requestAnimationFrame(playLoop);
            return;
          }
        }

        // console.log(timestamp, nextFrame?.timestamp, timestampInVideo);

        if (nextFrame.timestamp <= timestampInVideo) {
          draw({
            ctx,
            screenDimensions: screenDimensionsRef.current,
            wrappedCanvas: nextFrame,
          });
          currentFrameRef.current = undefined;

          setProgress(timestampInVideo);
          progressRef.current = timestampInVideo;

          getNextFrame(timestampInVideo);
        }
        playRAFRef.current = requestAnimationFrame(playLoop);
      };

      setIsPlaying(true);
      requestAnimationFrame(playLoop);
      console.log("play: started.");
    },
    [currentVideoSink, duration]
  );

  const pause = () => {
    console.log("pause.");
    if (playRAFRef.current) {
      cancelAnimationFrame(playRAFRef.current);
    }
    // Dispose iterator to release VideoSample resources.
    canvasIteratorRef.current?.return?.();
    setIsPlaying(false);
  };

  /**
   * Update canvas dimensions, and redraw if current frame exists.
   */
  const handleResize = useCallback(() => {
    if (fullscreenContainerRef.current && canvasRef.current) {
      const dimensions = {
        height: fullscreenContainerRef.current.offsetHeight,
        width: fullscreenContainerRef.current.offsetWidth,
      };
      screenDimensionsRef.current = dimensions;

      // Update canvas dimensions imperatively to avoid React re-render flash.
      // Changing width/height clears the canvas, so we redraw immediately after.
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;

      if (currentFrameRef.current) {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) {
          console.error("Error seeking: no 2D context.");
          return;
        }

        // Redraw immediately after dimension change.
        draw({
          ctx,
          screenDimensions: screenDimensionsRef.current,
          wrappedCanvas: currentFrameRef.current,
        });
      }
    }
  }, []);

  // TODO: handle resize due to TitleBar pinned state.

  // Setting up resize handler.
  useEffect(() => {
    // Initialize dimensions on mount.
    handleResize();
    const debouncedHandleResize = debounce(handleResize, 10);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, [handleResize]);

  // Rendering the first frame on load.
  useEffect(() => {
    seek(0);
  }, [seek]);

  // Playback cleanup on unmount only.
  useEffect(() => {
    return () => {
      if (playRAFRef.current) {
        cancelAnimationFrame(playRAFRef.current);
      }
      // Dispose iterator to release VideoSample resources.
      canvasIteratorRef.current?.return?.();
    };
  }, []);

  // Load files.
  useEffect(() => {
    let unmounted = false;

    console.log("files:", files);

    const readFileMetadata = async () => {
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
      const videoSink = new CanvasSink(videoTracks[0]);
      const currentAudioTrack = audioTracks[0];
      const audioContext = new AudioContext({
        sampleRate: currentAudioTrack?.sampleRate,
      });
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      if (!unmounted) {
        setAudioTracks(audioTracks);
        setCurrentAudioTrack(currentAudioTrack);
        setCurrentVideoSink(videoSink);
        setDuration(duration);
        setVideoTracks(videoTracks);
      }
    };

    try {
      readFileMetadata();
    } catch (error) {
      console.error(error);
    }

    return () => {
      unmounted = true;
    };
  }, [files]);

  if (!files) {
    return;
  }

  return (
    <FullscreenContainer ref={fullscreenContainerRef}>
      <PlayerControlOverlay
        duration={duration}
        isPlaying={isPlaying}
        pause={pause}
        play={play}
        progress={progress}
        progressRef={progressRef}
        seek={seek}
        setProgress={setProgress}
      />

      <canvas ref={canvasRef} />
    </FullscreenContainer>
  );
};
