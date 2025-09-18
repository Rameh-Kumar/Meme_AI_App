
export interface UploadedImage {
  data: string; // base64 encoded string
  mimeType: string;
}

export type MemeGenerationMode = 'classic' | 'popular' | 'custom';
