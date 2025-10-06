## Quick orientation

This repository is a Tauri desktop app built with Vite + React + TypeScript (frontend) and Rust (backend) under `src-tauri`.

- Frontend: `src/` (React + TSX). Entry: `src/main.tsx`, main UI: `src/App.tsx`.
- Tauri/Rust backend: `src-tauri/src/*` (commands exposed to the frontend). Key files: `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml`.
- Tooling/config: `vite.config.ts`, `package.json`, `eslint.config.js`, `tsconfig.json`, `src-tauri/tauri.conf.json`.

## Big-picture architecture & flow

- The UI runs in a Vite dev server (port 1420) during development. Vite serves the SPA and supports HMR.
- Tauri wraps the built frontend and a Rust backend. Frontend <-> backend RPC is done via Tauri commands (`#[tauri::command]`) and `invoke(...)` from `@tauri-apps/api`.
- Example: `src/App.tsx` calls `invoke('greet', { name })`; `src-tauri/src/lib.rs` registers `greet` with `tauri::generate_handler![greet]`.

Why some structural choices exist (discoverable):

- `vite.config.ts` sets `server.port = 1420` and `strictPort = true`. Tauri expects a stable dev URL (`http://localhost:1420`).
- `vite.config.ts` ignores watching `src-tauri` to prevent Vite from watching Rust sources.
- In `src-tauri/Cargo.toml` the library is named `temp_lib` (not just `temp`) to avoid Windows linker/name collisions between the binary and library.

## Key developer workflows (commands you can run)

Note: this project uses pnpm as the JS package manager. Example commands (PowerShell):

```powershell
# Run the frontend dev server (Vite)
pnpm dev

# Run Tauri development (bundles frontend + Rust runtime) — use when testing the desktop app
pnpm tauri dev

# Build the frontend (TypeScript compile + Vite build)
pnpm build

# Package a production application (calls pnpm build via tauri.conf.json then runs cargo/tauri packaging)
pnpm tauri build

# Lint JS/TS
pnpm lint
```

Notes discovered in config:

- `tauri.conf.json` sets `beforeDevCommand` -> `pnpm dev` and `beforeBuildCommand` -> `pnpm build`. Tauri delegates frontend lifecycle to these scripts.
- `pnpm build` runs `tsc && vite build` (see `package.json`). The final frontend artifact is expected under `../dist` (see `src-tauri/tauri.conf.json` -> `frontendDist`).

## Project-specific conventions & gotchas

- Fixed dev port: Vite server is fixed at port 1420 (see `vite.config.ts`). Do not randomly change this without updating `src-tauri/tauri.conf.json`.
- Environment prefixes: `vite.config.ts` exposes env vars with prefixes `VITE_` and `TAURI_ENV_*` via `import.meta.env`.
- Debug flags: `TAURI_ENV_DEBUG` is used at build-time to control sourcemaps and minification in `vite.config.ts`.
- Rust lib naming: keep the `name = "temp_lib"` and the crate-type entries in `src-tauri/Cargo.toml` — there is a Windows-specific note in the file explaining the reason.
- Vite ignores `src-tauri` in its watch list to avoid noise and accidental rebuilds of native code.

## Integration patterns (concrete examples)

- Registering commands in Rust

  - `src-tauri/src/lib.rs`
    - `#[tauri::command] fn greet(name: &str) -> String { ... }`
    - Registered via `.invoke_handler(tauri::generate_handler![greet])`.

- Calling from frontend

  - `src/App.tsx` uses `import { invoke } from "@tauri-apps/api/core"` and calls `await invoke('greet', { name })`.

- Plugins

  - `src-tauri/src/lib.rs` initializes `tauri_plugin_opener::init()` — check `Cargo.toml` for plugin dependencies.

## Linting / types

- ESLint config lives in `eslint.config.js` and is wired to run via `pnpm lint`.
- TypeScript is strict (`tsconfig.json` -> `strict: true`) and the project builds with `tsc` as part of `pnpm build`.

## Files to inspect when changing behavior

- Frontend routing / UI: `src/App.tsx`, `src/main.tsx`.
- Vite & dev server: `vite.config.ts` (ports, env prefixes, watch ignores, build flags).
- Tauri packaging/dev lifecycle: `src-tauri/tauri.conf.json` (devUrl, beforeDevCommand, beforeBuildCommand, frontendDist).
- Rust command handlers: `src-tauri/src/lib.rs` and any other files you add under `src-tauri/src`.
- Rust manifest / crate config: `src-tauri/Cargo.toml` (note lib name and crate types).

## What agents should avoid changing without explicit confirmation

- The fixed dev port (1420) and the `src-tauri` watch-ignore in `vite.config.ts`.
- The `name` field and `crate-type` in `src-tauri/Cargo.toml` (Windows-specific linker behavior).
- `tauri.conf.json`'s `frontendDist` path — packaging expects built frontend to land there.

## Editor / debugging hints

- Recommended IDE: VS Code with the Tauri extension and `rust-analyzer` (documented in `README.md`).
- When running `pnpm tauri dev`, logs from both Vite and the Rust side appear; `vite.config.ts` sets `clearScreen: false` to avoid losing Rust errors.

If any of the above is unclear or you'd like me to include more examples (e.g., common PR changes, code-gen steps, or a short debugging checklist), tell me which area to expand and I will iterate.
