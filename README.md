# Introduction

This project is given this name because it was "lightning fast" to implement. Before, I wouldn't dare dig into a rabbit hole such as video processing/playback or Rust or desktop app development. However, as I read through Tauri's documentation, it became apparent that developing a video player on Windows is now extremely easy for a web developer.

# Machine Setup

Follow the [Tauri documentation](https://v2.tauri.app/start/prerequisites/) to install all dependencies.

Install Node.js as well since we're using React.

Install pnpm following their [official docs](https://pnpm.io/installation).

# Running the program

Run

```
pnpm install
```

then

```
pnpm tauri dev
```

## Dev Ex

VS Code's `settings.json`:

```
"rust-analyzer.cargo.targetDir": "${workspaceFolder}/src-tauri/target"
```
