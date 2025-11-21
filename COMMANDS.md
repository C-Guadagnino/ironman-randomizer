# Commands to Run

## Development

To start the app in development mode:

```bash
cargo tauri dev
```

This will:
- Start the Vite dev server at `http://localhost:5173`
- Launch the Tauri desktop app
- Hot reload on code changes

## Building

To build a production version:

```bash
cargo tauri build
```

This will:
- Build the frontend with `npm run build`
- Compile the Rust backend
- Create an installer in `src-tauri/target/release/bundle/`

## Frontend Only (Testing)

If you just want to test the frontend web version:

```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

**Note:** The frontend currently uses WASM for shuffling. To use Tauri commands instead, you'll need to update the React components to call `invoke('shuffle_characters', ...)` instead of the WASM module.

