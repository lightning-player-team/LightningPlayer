import { TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAtom } from "jotai";
import { FC, useEffect, useRef, useState } from "react";
import CloseIcon from "../../../assets/svgs/CloseIcon";
import MaximizeIcon from "../../../assets/svgs/MaximizeIcon";
import MinimizeIcon from "../../../assets/svgs/MinimizeIcon";
import PinIcon from "../../../assets/svgs/PinIcon";
import RestoreIcon from "../../../assets/svgs/RestoreIcon";
import UnpinIcon from "../../../assets/svgs/UnpinIcon";
import { titleBarPinnedState } from "../../../shared/atoms/titleBarPinnedState";
import {
  pinnedContainerStyles,
  titleBarContainerStyles,
  windowControlsContainerStyles,
} from "./TitleBar.styles";

enum HoverState {
  Hovered,
  HoveredClicked,
  None,
}

export const TitleBar: FC = () => {
  const appWindow = getCurrentWindow();
  // Dragging uses OS native apis and :hover doesn't work while dragging. In
  // addition, after a mouseDown from left button, the OS takes control of dragging,
  // and mouseUp events are not fired for the webview. So we need to track the hover
  // state manually using only mouseDown, mouseEnter, and mouseLeave.
  //
  // When the user clicks the title bar, the mouseDown event is fired, and then
  // the mouseLeave event is fired shortly after.
  // When the user releases the mouse button, the mouseEnter event is fired.
  //
  // To make sure that the hover styles persist while dragging, we use this little
  // state machine and make use of the order of the events mentioned above.
  const [isHovered, setIsHovered] = useState<HoverState>(HoverState.None);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useAtom(titleBarPinnedState);
  const maximizeButtonRef = useRef<HTMLButtonElement>(null);

  // Update isMaximized when Window is resized.
  useEffect(() => {
    const handleResize = async () => {
      const newIsMaximized = await appWindow.isMaximized();
      setIsMaximized(newIsMaximized);
    };

    handleResize();

    const promiseUnlisten = appWindow.listen(
      TauriEvent.WINDOW_RESIZED,
      handleResize
    );
    return () => {
      promiseUnlisten.then((unlistenFn) => unlistenFn());
    };
  }, [appWindow]);

  // Update isFocused when Window is focused and blurred.
  useEffect(() => {
    const handleFocus = async () => {
      const newIsFocused = await appWindow.isFocused();
      setIsFocused(newIsFocused);
    };

    handleFocus();

    const unlistenFocus = appWindow.listen(
      TauriEvent.WINDOW_FOCUS,
      handleFocus
    );
    const unlistenBlur = appWindow.listen(TauriEvent.WINDOW_BLUR, handleFocus);
    return () => {
      unlistenFocus.then((unlistenFn) => unlistenFn());
      unlistenBlur.then((unlistenFn) => unlistenFn());
    };
  }, [appWindow]);

  // Event handlers to track the hovered state.
  const handleOnMouseDownTitleBar = () => {
    if (!isPinned) {
      // console.log("mouse down");
      setIsHovered(HoverState.HoveredClicked);
    }
  };
  const handleOnMouseEnterTitleBar = () => {
    if (!isPinned) {
      // console.log("mouse enter");
      setIsHovered(HoverState.Hovered);
    }
  };
  const handleOnMouseLeaveTitleBar = () => {
    if (!isPinned) {
      if (isHovered === HoverState.HoveredClicked) {
        // console.log("mouse leave - from clicked ");
        setIsHovered(HoverState.Hovered);
      } else {
        // console.log("mouse leave");
        setIsHovered(HoverState.None);
      }
    }
  };
  const handleOnMouseDownButton = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // Prevent propagating mouseDown to title bar and therefore
    // updating the hover state.
    event.stopPropagation();
  };

  // Button event handlers.
  const handleOnPinClick = () => {
    setIsPinned(!isPinned);
  };
  const handleOnMinimizeClick = () => {
    appWindow.minimize();
  };
  const handleOnMaximizeClick = () => {
    appWindow.toggleMaximize();
  };
  const handleOnCloseClick = () => {
    appWindow.close();
  };

  return (
    <div
      css={[titleBarContainerStyles, isPinned && pinnedContainerStyles]}
      data-is-hovered={isHovered !== HoverState.None}
      data-is-focused={isFocused}
      onMouseDown={handleOnMouseDownTitleBar}
      onMouseEnter={handleOnMouseEnterTitleBar}
      onMouseLeave={handleOnMouseLeaveTitleBar}
    >
      <div data-tauri-drag-region />
      <div css={windowControlsContainerStyles}>
        <button
          id="titlebar-pin"
          onClick={handleOnPinClick}
          onMouseDown={handleOnMouseDownButton}
          title={isPinned ? "unpin" : "pin"}
        >
          {isPinned ? <UnpinIcon /> : <PinIcon />}
        </button>
        <button
          id="titlebar-minimize"
          onClick={handleOnMinimizeClick}
          onMouseDown={handleOnMouseDownButton}
          title="minimize"
        >
          <MinimizeIcon />
        </button>
        <button
          id="titlebar-maximize"
          onClick={handleOnMaximizeClick}
          onMouseDown={handleOnMouseDownButton}
          ref={maximizeButtonRef}
          title={isMaximized ? "restore" : "maximize"}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button
          id="titlebar-close"
          data-close-button
          onClick={handleOnCloseClick}
          onMouseDown={handleOnMouseDownButton}
          title="close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
