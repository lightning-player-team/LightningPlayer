import { isTauri } from "@tauri-apps/api/core";
import { TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { isWindowFocusedState } from "../atoms/isWindowFocusedState";
import { isWindowMaximizedState } from "../atoms/isWindowMaximizedState";

/**
 * Subscribes to Tauri window events and keeps the isWindowMaximized and
 * isWindowFocused Jotai atoms updated. No-ops outside of Tauri.
 */
export const useWindowState = () => {
  const setIsWindowFocused = useSetAtom(isWindowFocusedState);
  const setIsWindowMaximized = useSetAtom(isWindowMaximizedState);

  // Update isWindowMaximized and isWindowFullscreen when the window is resized.
  useEffect(() => {
    if (!isTauri()) return;

    const appWindow = getCurrentWindow();

    const handleResize = async () => {
      const maximized = await appWindow.isMaximized();
      setIsWindowMaximized(maximized);
    };

    handleResize();

    const promiseUnlisten = appWindow.listen(
      TauriEvent.WINDOW_RESIZED,
      handleResize,
    );
    return () => {
      promiseUnlisten.then((unlistenFn) => unlistenFn());
    };
  }, [setIsWindowMaximized]);

  // Update isWindowFocused when the window is focused or blurred.
  useEffect(() => {
    if (!isTauri()) return;

    const appWindow = getCurrentWindow();

    const handleFocus = async () => {
      const focused = await appWindow.isFocused();
      setIsWindowFocused(focused);
    };

    handleFocus();

    const unlistenFocus = appWindow.listen(
      TauriEvent.WINDOW_FOCUS,
      handleFocus,
    );
    const unlistenBlur = appWindow.listen(TauriEvent.WINDOW_BLUR, handleFocus);
    return () => {
      unlistenFocus.then((unlistenFn) => unlistenFn());
      unlistenBlur.then((unlistenFn) => unlistenFn());
    };
  }, [setIsWindowFocused]);
};
