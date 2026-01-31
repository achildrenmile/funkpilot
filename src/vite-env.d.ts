/// <reference types="vite/client" />

declare const __BUILD_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
