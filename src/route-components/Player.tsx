import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FC, useCallback, useEffect, useRef, useState } from "react";

export const Player: FC = () => {
  const [filePath, setFilePath] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reload video when filePath changes.
  useEffect(() => {
    if (filePath) {
      videoRef.current?.load();
    }
  }, [filePath]);

  const handleOnClick = useCallback(async () => {
    const file = await open({
      directory: false,
      multiple: false,
      filters: [
        { name: "All supported files", extensions: ["mp3", "mp4"] },
        { name: "Supported audio files", extensions: ["mp3"] },
        { name: "Supported video files", extensions: ["mp4"] },
      ],
    });
    if (file) {
      setFilePath(convertFileSrc(file));
    }
  }, []);

  return (
    <>
      <button onClick={handleOnClick}>test</button>
      <video controls ref={videoRef}>
        <source src={filePath} type="video/mp4" />
      </video>
    </>
  );
};
