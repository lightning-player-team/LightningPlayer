# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lightning Player is a Tauri v2 desktop media player built with:

- **Frontend**: React 19 + TypeScript + Vite + Emotion (CSS-in-JS)
- **Backend**: Rust (Tauri)
- **State Management**: Jotai
- **Routing**: React Router v7
- **Media Processing**: mediabunny library for video decoding and playback

## Commands

```powershell
pnpm tauri dev     # Development (Vite + Tauri together)
pnpm dev           # Frontend only (Vite at localhost:1420)
pnpm build         # Build frontend (tsc + vite build)
pnpm tauri build   # Production build
pnpm lint          # ESLint
```

## Architecture

### Frontend (`src/`)

- **Entry**: `src/main.tsx` - React Router setup
- **Routes** (`src/route-components/routes.ts`):
  - `/` → Home - File picker UI
  - `/player` → Player - Canvas-based video playback

### Backend (`src-tauri/src/`)

- `lib.rs` - Tauri plugins (shell, fs, dialog, opener) and command handler setup

## Conventions

### File Naming and Structure

- `Component.tsx` - React component
- `Component.styles.[ts|tsx]` - Emotion styles
- `Component.types.ts` - TypeScript interfaces

UI components in `src/ui-components/`:

- `base/` - Primitives (Button, TitleBar, ResizableWindow, FullscreenContainer)
- `level-one/` - Composed components (PlayerControlOverlay)
- Each level imports from components from lower levels, and not the other way around.

### Updating Theme

- Add new fields to `src/themes/emoton.d.ts`.
- Update each theme configuration (`dark-default.json`, etc.).
- Access via Emotion's `useTheme()` or `css` prop with `(theme: Theme) => css({...`.

### Coding Style

- All fields in objects, types, interfaces, enums, and function parameters are alphanumerically sorted. When doing this in styles files, CSS selectors (like &:hover, [data-...]) need to be kept at the end and retain their original order to preserve cascade behavior.

- When writing functions, if we need multiple parameters, put the parameters in a single object and type it inline in the function signature.

- A file containing only one function should use the exact same name as the function. A file should define at most one React component. A file containing a react component should use the exact same name as the component.

- When initializing a react ref, use undefined if the ref is not pointing to an HTML element.

- Only pass refs to a function when the function updates the ref (i.e. ref.current = ...) otherwise pass the ref.current directly.

- When debugging or making changes, keep debug comments such as `console.log` or at least comment them out instead of removing them.

## Implementation Notes

### Root (`src/route-components/root/Root.tsx`)

Provides Emotion ThemeProvider, global styles, and Tauri-specific components (TitleBar, DragAndDropOverlay) conditionally rendered via `isTauri()`.

### Player (`src/route-components/player/Player.tsx`)

Uses mediabunny for video decoding:

1. Creates `Input` from file blob with `BlobSource`
2. Gets video/audio tracks via `getVideoTracks()` / `getAudioTracks()`
3. Creates `VideoSampleSink` for frame iteration
4. Renders frames to canvas via `requestAnimationFrame` loop
5. Manual frame timing and cleanup with `VideoSample.close()`

## Critical Configuration

**Do not change without developer consent:**

- `README.md`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `src-tauri/tauri.conf.json`
