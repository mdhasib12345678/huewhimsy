/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDUSA_BACKEND_URL?: string;
  readonly VITE_MEDUSA_PUBLISHABLE_KEY?: string;
  readonly VITE_DEFAULT_REGION_ID?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
