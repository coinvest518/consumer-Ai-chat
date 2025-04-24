/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly ASTRA_DB_ID: string
  readonly ASTRA_DB_REGION: string
  readonly ASTRA_DB_APPLICATION_TOKEN: string
  readonly VITE_ASTRA_DB_APPLICATION_TOKEN: string
  readonly VITE_ASTRA_DB_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 