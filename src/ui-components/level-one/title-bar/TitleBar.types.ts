import { isTauri } from "@tauri-apps/api/core";

// In pixels
export const TITLE_BAR_HEIGHT = isTauri() ? 30 : 0;
