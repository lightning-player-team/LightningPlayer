import { invoke } from "@tauri-apps/api/core";
import { EventCallback, TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { FC, useEffect, useState } from "react";
import { TauriDragEnterEventPayload } from "../shared/types/TauriEvent";
import { Button } from "../ui-components/button/Button";
import { FullscreenContainer } from "../ui-components/fullscreen-container/FullscreenContainer";
import {
  buttonStyles,
  contentContainerStyles,
  dragAndDropOverlayStyles,
  dragAndDropTextStyles,
  fileNotSupportedOverlayStyles,
  orTextStyles,
} from "./Home.styles";

enum DragAndDropState {
  None,
  FileNotSupported,
  Processing,
}

type DragAndDropResult = string[] | DragAndDropState;

export const Home: FC = () => {
  const [dragAndDropState, setDragAndDropState] = useState<DragAndDropResult>(
    DragAndDropState.None
  );
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const handleDragEnter: EventCallback<TauriDragEnterEventPayload> = async ({
      payload,
    }) => {
      setDragAndDropState(DragAndDropState.Processing);
      try {
        const paths = await invoke("process_paths", {
          paths: payload.paths,
        });
        console.log(paths);
        setDragAndDropState(paths as string[]);
      } catch (error) {
        if (error === "No valid files") {
          console.log(error);
          setDragAndDropState(DragAndDropState.FileNotSupported);
        }
      }
    };
    const handleDragLeave = async () => {
      setDragAndDropState([]);
    };
    const handleDragDrop = async () => {
      setDragAndDropState(DragAndDropState.None);
    };

    const unlistenDragEnter = appWindow.listen(
      TauriEvent.DRAG_ENTER,
      handleDragEnter
    );
    const unlistenDragLeave = appWindow.listen(
      TauriEvent.DRAG_LEAVE,
      handleDragLeave
    );
    const unlistenDragDrop = appWindow.listen(
      TauriEvent.DRAG_DROP,
      handleDragDrop
    );
    return () => {
      unlistenDragEnter.then((unlistenFn) => unlistenFn());
      unlistenDragLeave.then((unlistenFn) => unlistenFn());
      unlistenDragDrop.then((unlistenFn) => unlistenFn());
    };
  }, [appWindow]);

  const handleOnClickOpenFile = async () => {
    const paths = await open({
      directory: false,
      multiple: true,
      filters: [
        { name: "All supported files", extensions: ["mp3", "mp4"] },
        { name: "Supported audio files", extensions: ["mp3"] },
        { name: "Supported video files", extensions: ["mp4"] },
      ],
    });
    if (paths) {
      console.log("Selected file:", paths);
      try {
        const res = await invoke("process_paths", {
          paths: paths,
        });
        console.log("Processed files", res);
      } catch (error) {
        // Unexpected error
        console.log(error);
      }
    }
  };

  const handleOnClickOpenFolder = async () => {
    const path = await open({
      directory: true,
    });
    if (path) {
      console.log("Selected folder:", path);
      try {
        const res = await invoke("process_paths", {
          paths: [path],
        });
        console.log("Processed files", res);
      } catch (error) {
        // Unexpected error
        console.log(error);
      }
    }
  };

  return (
    <FullscreenContainer>
      {(() => {
        switch (dragAndDropState) {
          case DragAndDropState.FileNotSupported:
            return (
              <div
                css={[dragAndDropOverlayStyles, fileNotSupportedOverlayStyles]}
              >
                <p>File(s) not supported</p>
              </div>
            );
          case DragAndDropState.Processing:
            return (
              <div css={dragAndDropOverlayStyles}>
                <p>Processing files...</p>
              </div>
            );
          case DragAndDropState.None:
            return null;
          default:
            if (Array.isArray(dragAndDropState) && dragAndDropState.length) {
              return (
                <div css={dragAndDropOverlayStyles}>
                  <p>Drop to open</p>
                </div>
              );
            }
            // Unexpected state
            return null;
        }
      })()}
      <div css={contentContainerStyles}>
        <Button css={buttonStyles} onClick={handleOnClickOpenFile}>
          Open File(s)
        </Button>
        <Button css={buttonStyles} onClick={handleOnClickOpenFolder}>
          Open Folder
        </Button>
        <p css={orTextStyles}>or</p>
        <p css={dragAndDropTextStyles}>Drag and drop here</p>
      </div>
    </FullscreenContainer>
  );
};
