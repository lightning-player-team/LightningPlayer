import { useAtomValue } from "jotai";
import { FC, MouseEventHandler, ReactNode, useRef } from "react";
import CloseIcon from "../../../assets/svgs/close.svg?react";
import { titleBarPinnedState } from "../../../shared/atoms/titleBarPinnedState";
import { TITLE_BAR_HEIGHT } from "../title-bar/TitleBar.types";
import {
  closeButtonStyles,
  contentContainerStyles,
  resizableWindowContainerStyles,
  resizeRegionBottomStyles,
  resizeRegionLeftStyles,
  resizeRegionRightStyles,
  resizeRegionTopStyles,
  titleBarStyles,
  titleDragContainerStyles,
  WINDOW_TITLE_BAR_CLASSNAME,
} from "./ResizableWindow.styles";

export interface IResizableWindowProps {
  children?: ReactNode;
  className?: string;
  onClose?: () => void;
  title?: string;
}

export const ResizableWindow: FC<IResizableWindowProps> = ({
  children,
  className,
  onClose,
  title,
}) => {
  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleBarOffset = isTitleBarPinned ? TITLE_BAR_HEIGHT : 0;

  // Calculate and reset the container's gaps on all sides to
  // what is currently rendered on screen.
  const resetContainerStyles = () => {
    if (containerRef.current) {
      const boundingClientRect = containerRef.current.getBoundingClientRect();

      containerRef.current.style.top =
        boundingClientRect.top - titleBarOffset + "px";
      containerRef.current.style.left = boundingClientRect.left + "px";
      containerRef.current.style.bottom =
        document.documentElement.clientHeight -
        boundingClientRect.bottom +
        "px";
      containerRef.current.style.right =
        document.documentElement.clientWidth - boundingClientRect.right + "px";

      containerRef.current.style.height = "auto";
      containerRef.current.style.width = "auto";
    }
  };

  /**
   * When resizing and dragging, we only set the container's
   * top, left, bottom, and right styles to control its size
   * and position, and we leave width and height as auto.
   */

  // Top resize handlers
  const handleMouseMoveTop = (event: MouseEvent) => {
    if (containerRef.current) {
      const boundingClientRect = containerRef.current.getBoundingClientRect();
      const maxTop = boundingClientRect.bottom - titleBarOffset;
      const currentMouseTop = event.clientY - titleBarOffset;
      containerRef.current.style.top =
        Math.min(Math.max(currentMouseTop, 0), maxTop) + "px";
    }
  };
  const handleMouseDownTop: MouseEventHandler<HTMLDivElement> = () => {
    resetContainerStyles();
    document.addEventListener("mousemove", handleMouseMoveTop);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", handleMouseMoveTop);
      },
      { once: true }
    );
  };

  // Bottom resize handlers
  const handleMouseMoveBottom = (event: MouseEvent) => {
    if (containerRef.current) {
      const boundingClientRect = containerRef.current.getBoundingClientRect();
      const maxBottom =
        document.documentElement.clientHeight - boundingClientRect.top;
      const currentMouseBottom =
        document.documentElement.clientHeight - event.clientY;
      containerRef.current.style.bottom =
        Math.min(Math.max(currentMouseBottom, 0), maxBottom) + "px";
    }
  };
  const handleMouseDownBottom: MouseEventHandler<HTMLDivElement> = () => {
    resetContainerStyles();
    document.addEventListener("mousemove", handleMouseMoveBottom);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", handleMouseMoveBottom);
      },
      { once: true }
    );
  };

  // Left resize handlers
  const handleMouseMoveLeft = (event: MouseEvent) => {
    if (containerRef.current) {
      const boundingClientRect = containerRef.current.getBoundingClientRect();
      const maxLeft = boundingClientRect.right;
      containerRef.current.style.left =
        Math.min(Math.max(event.clientX, 0), maxLeft) + "px";
    }
  };
  const handleMouseDownLeft: MouseEventHandler<HTMLDivElement> = () => {
    resetContainerStyles();
    document.addEventListener("mousemove", handleMouseMoveLeft);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", handleMouseMoveLeft);
      },
      { once: true }
    );
  };

  // Right resize handlers
  const handleMouseMoveRight = (event: MouseEvent) => {
    if (containerRef.current) {
      const boundingClientRect = containerRef.current.getBoundingClientRect();
      const maxRight =
        document.documentElement.clientWidth - boundingClientRect.left;
      const currentMouseRight =
        document.documentElement.clientWidth - event.clientX;
      containerRef.current.style.right =
        Math.min(Math.max(currentMouseRight, 0), maxRight) + "px";
    }
  };
  const handleMouseDownRight: MouseEventHandler<HTMLDivElement> = () => {
    resetContainerStyles();
    document.addEventListener("mousemove", handleMouseMoveRight);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", handleMouseMoveRight);
      },
      { once: true }
    );
  };

  // Drag handlers
  const handleMouseDownDrag: MouseEventHandler<HTMLDivElement> = (event) => {
    const windowLeft =
      event.clientX - event.currentTarget.getBoundingClientRect().left;
    const windowTop =
      event.clientY - event.currentTarget.getBoundingClientRect().top;
    const handleMouseMoveDrag = (event: MouseEvent) => {
      if (containerRef.current) {
        const currentStyles = window.getComputedStyle(containerRef.current);
        const maxLeft =
          document.documentElement.clientWidth - parseInt(currentStyles.width);
        const maxTop =
          document.documentElement.clientHeight -
          titleBarOffset -
          parseInt(currentStyles.height);
        containerRef.current.style.left =
          Math.min(Math.max(event.clientX - windowLeft, 0), maxLeft) + "px";
        containerRef.current.style.top =
          Math.min(
            Math.max(event.clientY - titleBarOffset - windowTop, 0),
            maxTop
          ) + "px";
        containerRef.current.style.width = currentStyles.width;
        containerRef.current.style.height = currentStyles.height;
      }
    };

    document.addEventListener("mousemove", handleMouseMoveDrag);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", handleMouseMoveDrag);
      },
      { once: true }
    );
  };

  return (
    <div
      className={className}
      css={resizableWindowContainerStyles}
      ref={containerRef}
      tabIndex={0}
    >
      <div css={resizeRegionTopStyles} onMouseDown={handleMouseDownTop} />
      <div css={resizeRegionBottomStyles} onMouseDown={handleMouseDownBottom} />
      <div css={resizeRegionLeftStyles} onMouseDown={handleMouseDownLeft} />
      <div css={resizeRegionRightStyles} onMouseDown={handleMouseDownRight} />
      <div
        css={titleBarStyles}
        data-window-title-bar
        className={WINDOW_TITLE_BAR_CLASSNAME}
      >
        <div css={titleDragContainerStyles} onMouseDown={handleMouseDownDrag}>
          {title}
        </div>
        <button
          css={closeButtonStyles}
          id="titlebar-close"
          onClick={onClose}
          title="close"
        >
          <CloseIcon />
        </button>
      </div>
      <div css={contentContainerStyles}>{children}</div>
    </div>
  );
};
