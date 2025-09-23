
export interface UploadedImage {
  data: string; // base64 encoded string
  mimeType: string;
}

export type MemeGenerationMode = 'classic' | 'popular' | 'custom' | 'story';

export type DigitalTwinStyle = 'sticker' | '3d_model' | 'cartoon' | 'pixel_art';
