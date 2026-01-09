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
import { Dimensions } from "../../shared/types/dimensions";
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
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoSink, setCurrentVideoSink] = useState<VideoSampleSink>();
  // const [audioContext, setAudioContext] = useState<AudioContext>();
  const [_currentAudioTrack, setCurrentAudioTrack] =
    useState<InputAudioTrack>();
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  // For manually closing nextFrame.
  const isPlayingRef = useRef(false);

  // const audioContextStartTimeRef = useRef<number>(undefined);

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const screenDimensionsRef = useRef<Dimensions>(null);
  const [screenDimensions, setScreenDimensions] = useState<Dimensions>();

  // Play function's requestAnimationFrame ref.
  const playRAFRef = useRef<number>(null);
  // Used by the play loop to keep track of nextFrame for clean up when playback is paused
  // and nextFrame should be discard (e.g. when window is resized or closed).
  const nextFrameRef = useRef<VideoSample | void>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Seek to time in seconds.
   * */
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

      draw({ screenDimensions: screenDimensionsRef.current, videoSample, ctx });
    },
    [currentVideoSink]
  );

  /**
   * Start playback at time in seconds.
   */
  const play = useCallback(
    async (time: number) => {
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

      const videoSampleIterator = await currentVideoSink.samples(time);
      const nextFrame = (await videoSampleIterator.next()).value;
      if (!nextFrame) {
        console.error("Error playing: no start frame.");
        return;
      }
      nextFrameRef.current = nextFrame;

      const getNextFrame = async (timestamp: number) => {
        // Possible to skip multiple frames when the video's fps is
        // higher than what the webview can handle.
        while (true) {
          const nextFrame = (await videoSampleIterator.next()).value;
          // If playback was stopped while awaiting, close the frame immediately.
          if (!isPlayingRef.current) {
            nextFrame?.close();
            return;
          }
          if (!nextFrame) {
            return;
          } else {
            if (nextFrame.timestamp >= timestamp) {
              nextFrameRef.current = nextFrame;
              return;
            } else {
              nextFrame.close();
            }
          }
        }
      };

      const startTimestampInVideo = nextFrame.timestamp;
      let startTimestamp: number | undefined = undefined;

      const playLoop = (timestamp: number) => {
        const nextFrame = nextFrameRef.current;

        if (startTimestamp === undefined) {
          startTimestamp = timestamp;
        }
        const timestampInVideo =
          startTimestampInVideo + (timestamp - startTimestamp) / 1000;

        if (!nextFrame) {
          if (timestampInVideo >= duration) {
            console.log("Playback finished: no next frame.");
            isPlayingRef.current = false;
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
            screenDimensions: screenDimensionsRef.current,
            videoSample: nextFrame,
            ctx,
          });
          nextFrameRef.current = undefined;

          setProgress(timestampInVideo);
          progressRef.current = timestampInVideo;

          getNextFrame(timestampInVideo);
        }
        playRAFRef.current = requestAnimationFrame(playLoop);
      };

      isPlayingRef.current = true;
      setIsPlaying(true);
      requestAnimationFrame(playLoop);
      console.log("Playback started.");
    },
    [currentVideoSink, duration]
  );

  const pause = () => {
    console.log("Pausing.");

    if (playRAFRef.current) {
      cancelAnimationFrame(playRAFRef.current);
      if (nextFrameRef.current) {
        nextFrameRef.current.close();
        nextFrameRef.current = undefined;
      }
    } else {
      console.error("Error pausing: unexpected.");
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const handleResize = useCallback(() => {
    if (!isPlaying) {
      if (nextFrameRef.current) {
        nextFrameRef.current.close();
      }
      seek(progressRef.current);
    }
    if (fullscreenContainerRef.current) {
      const dimensions = {
        width: fullscreenContainerRef.current.offsetWidth,
        height: fullscreenContainerRef.current.offsetHeight,
      };
      setScreenDimensions(dimensions);
      screenDimensionsRef.current = dimensions;
    }
  }, [isPlaying, seek]);

  // TODO: handle resize due to TitleBar pinned state.

  // Setting up resize handler.
  useEffect(() => {
    // Initialize dimensions on mount.
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Playback cleanup on unmount only.
  useEffect(() => {
    return () => {
      // Stop playback loop on unmount.
      if (playRAFRef.current) {
        cancelAnimationFrame(playRAFRef.current);
      }
      // Signal async getNextFrame to clean up.
      isPlayingRef.current = false;
      // Clean up nextFrame.
      if (nextFrameRef.current) {
        nextFrameRef.current.close();
      }
    };
  }, []);

  // Load files.
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
      const currentAudioTrack = audioTracks[0];
      const audioContext = new AudioContext({
        sampleRate: currentAudioTrack?.sampleRate,
      });
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      if (!unmounted) {
        setAudioTracks(audioTracks);
        setVideoTracks(videoTracks);
        setCurrentVideoSink(currentVideoSink);
        setCurrentAudioTrack(currentAudioTrack);

        // setAudioContext(audioContext);
        setDuration(duration);
      }
    };

    readFileMedadata();

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

      <canvas
        width={screenDimensions?.width}
        height={screenDimensions?.height}
        ref={canvasRef}
      />
    </FullscreenContainer>
  );
};
