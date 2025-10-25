import { invoke } from "@tauri-apps/api/core";
import { EventCallback, TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { DragEventHandler, FC, useEffect, useRef, useState } from "react";
import { TauriDragEnterEventPayload } from "../../../shared/types/TauriEvent";
import { dragAndDropOverlayContainerStyles } from "./DragAndDropOverlay.styles";
import { DragAndDropResult, DragAndDropState } from "./DragAndDropOverlay.tc";

export const DragAndDropOverlay: FC = () => {
  const [dragAndDropState, setDragAndDropState] = useState<DragAndDropResult>(
    DragAndDropState.None
  );
  const appWindow = getCurrentWindow();
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDrag: DragEventHandler<HTMLDivElement> = (e) => {
    console.log("Drag: ", e);
  };

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
      setDragAndDropState(DragAndDropState.None);
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

  return (
    <div
      css={dragAndDropOverlayContainerStyles}
      data-drag-and-drop-active={dragAndDropState !== DragAndDropState.None}
      onDrag={handleDrag}
      ref={dropZoneRef}
    >
      {(() => {
        switch (dragAndDropState) {
          case DragAndDropState.FileNotSupported:
            return <p>File(s) not supported</p>;
          case DragAndDropState.Processing:
            return <p>Processing files...</p>;
          case DragAndDropState.None:
            return null;
          default:
            if (Array.isArray(dragAndDropState) && dragAndDropState.length) {
              return <p>Drop to open</p>;
            }
            // Unexpected state
            return null;
        }
      })()}
    </div>
  );
};
