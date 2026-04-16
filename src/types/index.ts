export type SceneKey =
  | 'academic'
  | 'business_email'
  | 'social_media'
  | 'tech_doc'
  | 'creative'
  | 'translation';

export interface Scene {
  key: SceneKey;
  label: string;
  systemPrompt: string;
}

export interface PolishRequest {
  text: string;
  scene: SceneKey;
}

export interface PolishResponse {
  result: string;
}

export interface ApiError {
  message: string;
}

export type ResultState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; text: string }
  | { status: 'error'; message: string };
