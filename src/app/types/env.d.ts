// types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_AUDIOSALAD_API_BASE_URL: string;
    NEXT_PUBLIC_AUDIOSALAD_API_ID_KEY: string;
    AUDIOSALAD_API_REFRESH_TOKEN: string;
  }
}
