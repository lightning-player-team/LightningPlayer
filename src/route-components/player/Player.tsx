import { useAtom, useAtomValue } from "jotai";
import {
  ALL_FORMATS,
  AudioBufferSink,
  BlobSource,
  CanvasSink,
  Input,
  WrappedAudioBuffer,
  WrappedCanvas,
} from "mediabunny";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { inputFilesState } from "../../shared/atoms/inputFilesState";
import { isMutedState } from "../../shared/atoms/isMutedState";
import { titleBarPinnedState } from "../../shared/atoms/titleBarPinnedState";
import { volumeState } from "../../shared/atoms/volumeState";
import { Dimensions } from "../../shared/types/dimensions";
import { debounce } from "../../shared/utils/debounce";
import { FullscreenContainer } from "../../ui-components/base/fullscreen-container/FullscreenContainer";
import { PlayerControlOverlay } from "../../ui-components/level-one/player-control-overlay/PlayerControlOverlay";
import { draw } from "./draw";
import { getThumbnail } from "./getThumbnail";
import { playHelper } from "./playHelper";
import { seekHelper } from "./seekHelper";

export const Player: FC = () => {
  const files = useAtomValue(inputFilesState);
  const [isMuted, setIsMuted] = useAtom(isMutedState);
  const [volume, setVolume] = useAtom(volumeState);

  // Progress in seconds.
  const [progress, setProgress] = useState(0);
  const [currentAudioSink, setCurrentAudioSink] = useState<AudioBufferSink>();
  const [currentVideoSink, setCurrentVideoSink] = useState<CanvasSink>();
  const [duration, setDuration] = useState<number>(0);

  // Audio refs for Web Audio API playback.
  const audioContextRef = useRef<AudioContext>(undefined);
  const audioIteratorRef =
    useRef<AsyncGenerator<WrappedAudioBuffer, void, unknown>>(undefined);
  const queuedAudioNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const gainNodeRef = useRef<GainNode>(undefined);

  // Controls the playback loop and allows pausing.
  const playRAFRef = useRef<number>(null);
  // Used by PlayerControlOverlay to toggle play/pause button.
  const [isPlaying, setIsPlaying] = useState(false);

  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  // Used for drawing and updated by resize handler.
  const screenDimensionsRef = useRef<Dimensions>(undefined);

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
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.error("Error seeking: no canvas context.");
        return;
      }
      if (screenDimensionsRef.current === undefined) {
        console.error("Error seeking: no screen dimensions.");
        return;
      }
      await seekHelper({
        ctx,
        currentFrameRef,
        currentVideoSink,
        screenDimensionsRef,
        time,
      });
    },
    [currentVideoSink],
  );

  /**
   * Start playback at time in seconds.
   */
  const play = useCallback(
    async (time: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.error("Error playing: no canvas context.");
        return;
      }
      if (!audioContextRef.current) {
        console.error("Error playing: no audio context.");
        return;
      }

      await playHelper({
        audioContext: audioContextRef.current,
        audioBufferIteratorRef: audioIteratorRef,
        canvasIteratorRef,
        currentAudioSink,
        currentFrameRef,
        currentVideoSink,
        ctx,
        duration,
        gainNode: gainNodeRef.current,
        playRAFRef,
        queuedAudioNodesRef,
        screenDimensionsRef,
        setIsPlaying,
        setProgress,
        time,
      });
    },
    [currentAudioSink, currentVideoSink, duration],
  );

  const pauseAndCleanUp = () => {
    if (playRAFRef.current) {
      cancelAnimationFrame(playRAFRef.current);
    }
    // Stop all audio nodes that were already queued to play
    for (const node of queuedAudioNodesRef.current) {
      node.stop();
    }
    queuedAudioNodesRef.current.clear();
    // Dispose iterators to release resources.
    audioIteratorRef.current?.return();
    canvasIteratorRef.current?.return();
    // Suspend audio context to stop scheduled audio.
    audioContextRef.current?.suspend();
  };

  const pause = () => {
    console.log("pause.");
    pauseAndCleanUp();
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

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        console.error("Error updating canvas dimensions: no canvas context.");
        return;
      }
      if (currentFrameRef.current) {
        // Redraw immediately after dimension change.
        draw({
          ctx,
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
    return () => {
      pauseAndCleanUp();
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

      const videoTracks = await input.getVideoTracks();
      const videoSink = new CanvasSink(videoTracks[0]);
      const duration = await videoTracks[0].computeDuration();

      const audioTracks = await input.getAudioTracks();
      const currentAudioTrack = audioTracks[0];

      // Always create audio infrastructure even if there isn't an audio track.
      const audioContext: AudioContext = new AudioContext({
        sampleRate: currentAudioTrack?.sampleRate,
      });
      console.log(`audioContext's baseLatency: ${audioContext.baseLatency}`);

      let audioSink: AudioBufferSink | undefined;
      let gainNode: GainNode | undefined;
      if (currentAudioTrack) {
        audioSink = new AudioBufferSink(currentAudioTrack);

        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);

        // Store in refs (not reactive, for playback use).
        audioContextRef.current = audioContext;
        gainNodeRef.current = gainNode;
      }

      if (!unmounted) {
        setCurrentAudioSink(audioSink);
        setCurrentVideoSink(videoSink);
        setDuration(duration);
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

  // Sync gain node with volume/mute state.
  // currentAudioSink is included to re-run when audio is (re-)initialized.
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [currentAudioSink, isMuted, volume]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const getThumbnailCallback = useCallback(
    (timestamp: number) =>
      getThumbnail({ timestamp, videoSink: currentVideoSink }),
    [currentVideoSink],
  );

  if (!files) {
    return;
  }

  return (
    <FullscreenContainer ref={fullscreenContainerRef}>
      <PlayerControlOverlay
        duration={duration}
        getThumbnail={getThumbnailCallback}
        isMuted={isMuted}
        isPlaying={isPlaying}
        onMuteToggle={handleMuteToggle}
        onVolumeChange={handleVolumeChange}
        pause={pause}
        play={play}
        progress={progress}
        seek={seek}
        setProgress={setProgress}
        volume={volume}
      />

      <canvas ref={canvasRef} />
    </FullscreenContainer>
  );
};
