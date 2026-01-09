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
import { titleBarPinnedState } from "../../shared/atoms/titleBarPinnedState";
import { Dimensions } from "../../shared/types/dimensions";
import { debounce } from "../../shared/utils/debounce";
import { isTruthy } from "../../shared/utils/isTruthy";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { draw } from "./draw";
import { playHelper } from "./playHelper";
import { seekHelper } from "./seekHelper";

export const Player: FC = () => {
  const files = useAtomValue(inputFilesState);

  // Progress in seconds.
  const [progress, setProgress] = useState(0);
  // Avoids relying on progess in the resize handler.
  const [_audioTracks, setAudioTracks] = useState<InputAudioTrack[]>([]);
  const [_videoTracks, setVideoTracks] = useState<InputVideoTrack[]>([]);
  const [currentVideoSink, setCurrentVideoSink] = useState<CanvasSink>();
  const [duration, setDuration] = useState<number>(0);
  // const [audioContext, setAudioContext] = useState<AudioContext>();
  const [_currentAudioTrack, setCurrentAudioTrack] =
    useState<InputAudioTrack>();

  // Controls the playback loop and allows pausing.
  const playRAFRef = useRef<number>(null);
  // const [playRAF, setPlayRAF] = useState<boolean>(false);
  // Used by PlayerControlOverlay to toggle play/pause button.
  const [isPlaying, setIsPlaying] = useState(false);

  // const audioContextStartTimeRef = useRef<number>(undefined);

  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const screenDimensionsRef = useRef<Dimensions>(null);

  // Used by the play loop to keep track of the frame to render.
  const currentFrameRef = useRef<WrappedCanvas | undefined>(undefined);
  // Canvas iterator ref is populated by play and cleaned up by pause.
  const canvasIteratorRef =
    useRef<AsyncGenerator<WrappedCanvas, void, unknown>>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Seek to time in seconds.
   */
  const seek = useCallback(
    async (time: number) => {
      await seekHelper({
        canvasRef,
        currentFrameRef,
        currentVideoSink,
        screenDimensionsRef,
        time,
      });
    },
    [currentVideoSink]
  );

  /**
   * Start playback at time in seconds.
   */
  const play = useCallback(
    async (time: number) => {
      await playHelper({
        canvasIteratorRef,
        canvasRef,
        currentFrameRef,
        currentVideoSink,
        duration,
        playRAFRef,
        screenDimensionsRef,
        setIsPlaying,
        setProgress,
        time,
      });
    },
    [currentVideoSink, duration]
  );

  const pause = () => {
    console.log("pause.");
    if (playRAFRef.current) {
      cancelAnimationFrame(playRAFRef.current);
    }
    // Dispose iterator to release VideoSample resources.
    canvasIteratorRef.current?.return();
    setIsPlaying(false);
  };

  /**
   * Update canvas dimensions, and redraw if current frame exists.
   */
  const updateCanvasDimensions = useCallback(() => {
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
        // Redraw immediately after dimension change.
        draw({
          canvasRef,
          screenDimensions: screenDimensionsRef.current,
          wrappedCanvas: currentFrameRef.current,
        });
      }
    }
  }, []);

  // Setting up resize handler.
  useEffect(() => {
    // Initialize dimensions on mount.
    updateCanvasDimensions();
    const debouncedHandleResize = debounce(updateCanvasDimensions, 10);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, [updateCanvasDimensions]);

  // Update canvas size when TitleBar pinned state changes.
  useEffect(() => {
    updateCanvasDimensions();
  }, [isTitleBarPinned, updateCanvasDimensions]);

  // Rendering the first frame on load.
  useEffect(() => {
    seek(0);
  }, [seek]);

  // Playback cleanup on unmount only.
  useEffect(() => {
    const canvasIterator = canvasIteratorRef.current;
    return () => {
      // Dispose iterator to release VideoSample resources.
      canvasIterator?.return();
      if (playRAFRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        cancelAnimationFrame(playRAFRef.current);
      }
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
        seek={seek}
        setProgress={setProgress}
      />

      <canvas ref={canvasRef} />
    </FullscreenContainer>
  );
};
