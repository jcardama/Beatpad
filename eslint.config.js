import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    rules: {
      // MVP guardrail: the View and Presenter layers must reach the backend
      // only through the IPC client in src/model/ipc. Tauri imports live there.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@tauri-apps/*"],
              message:
                "Import @tauri-apps only inside src/model/ipc/. Use the ipc client instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // The IPC client is the one sanctioned home for Tauri imports.
    files: ["src/model/ipc/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": "off" },
  },
);
