import { atomWithStorage } from "jotai/utils";

// 0-100 range
export const volumeState = atomWithStorage("volume", 100);
