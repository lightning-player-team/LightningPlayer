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
  const [audioTracks, setAudioTracks] = useState<InputAudioTrack[]>([]);
  const [videoTracks, setVideoTracks] = useState<InputVideoTrack[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoSink, setCurrentVideoSink] = useState<VideoSampleSink>();
  // const [audioContext, setAudioContext] = useState<AudioContext>();
  const [currentAudioTrack, setCurrentAudioTrack] = useState<InputAudioTrack>();
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  // Allows others (PlayerControlOverlay) to pause playback.
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

      const screenDimensions = screenDimensionsRef.current;
      if (!screenDimensions) {
        console.error("Error seeking: no screen dimensions.");
        return;
      }

      draw({ screenDimensions, videoSample, ctx });
      videoSample.close();
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
      nextFrameRef.current = nextFrame;

      if (!nextFrame) {
        console.error("Error playing: no start frame.");
        return;
      }

      const getNextFrame = async (timestamp: number) => {
        // Possible to skip multiple frames when the video's fps is
        // higher than what the webview can handle.
        while (true) {
          const nextFrame = (await videoSampleIterator.next()).value;
          nextFrameRef.current = nextFrame;
          if (!nextFrame) {
            return;
          } else {
            if (nextFrame.timestamp >= timestamp) {
              return;
            } else {
              nextFrame.close();
            }
          }
        }
      };

      const startTimestampInVideo = nextFrame.timestamp;
      let startTimestamp: number | undefined = undefined;

      /**
       * TODO 1: Sometimes if user tries to resume at end of the video, can get:
       * "Uncaught Error: VideoSample is closed".
       *
       * TODO 2: Random "A VideoSample was garbage collected without first being closed...".
       *
       *  */
      const playLoop = (timestamp: number) => {
        const nextFrame = nextFrameRef.current;
        if (!nextFrame) {
          console.log("Playback finished: no next frame.");
          setIsPlaying(false);
          return;
        }

        if (startTimestamp === undefined) {
          startTimestamp = timestamp;
        }
        const elapsedTimeInSeconds = (timestamp - startTimestamp) / 1000;
        const timestampInVideo = startTimestampInVideo + elapsedTimeInSeconds;

        console.log(timestamp, nextFrame?.timestamp, timestampInVideo);

        // TODO: This is sometimes triggered - figure out why.
        if (timestampInVideo > duration) {
          console.log("Playback finished.");
          setIsPlaying(false);
          nextFrame.close();
          return;
        }

        if (nextFrame.timestamp <= timestampInVideo) {
          const screenDimensions = screenDimensionsRef.current;
          if (!screenDimensions) {
            console.error("Error playing: no screen dimensions.");
            return;
          }

          draw({ screenDimensions, videoSample: nextFrame, ctx });
          nextFrame.close();

          setProgress(timestampInVideo);
          progressRef.current = timestampInVideo;

          getNextFrame(timestampInVideo);
        }
        playRAFRef.current = requestAnimationFrame(playLoop);
      };

      requestAnimationFrame(playLoop);
      console.log("Playback started.");
    },
    [currentVideoSink, duration]
  );

  const pause = () => {
    console.log("Pausing.");

    if (playRAFRef.current) {
      if (nextFrameRef.current) {
        nextFrameRef.current.close();
      }
      cancelAnimationFrame(playRAFRef.current);
    } else {
      console.error("Error pausing: unexpected.");
    }
  };

  const handleResize = useCallback(() => {
    // Sometimes a VideoSample is not closed after pause + resize.
    // TODO: investigate why and fix.
    if (!isPlayingRef.current) {
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
  }, [seek]);

  // Setting up resize handler and clean ups.
  useEffect(() => {
    // Initialize dimensions on mount.
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      // Stop playback loop on unmount.
      isPlayingRef.current = false;
      if (playRAFRef.current) {
        cancelAnimationFrame(playRAFRef.current);
      }
      // Clean up nextFrame.
      if (nextFrameRef.current) {
        nextFrameRef.current.close();
      }

      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

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
        isPlayingRef={isPlayingRef}
        pause={pause}
        play={play}
        progress={progress}
        progressRef={progressRef}
        setIsPlaying={setIsPlaying}
        seek={seek}
        setProgress={setProgress}
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
