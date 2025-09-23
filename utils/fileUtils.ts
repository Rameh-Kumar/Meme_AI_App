
import type { UploadedImage } from '../types';

export const fileToBase64 = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve({ data: base64Data, mimeType: file.type });
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const imageUrlToBase64 = async (url: string): Promise<UploadedImage> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // It's very likely a CORS issue if this fails on a cross-origin request.
      // In a real-world scenario, you'd fetch this server-side or use a CORS proxy.
      console.error(`Failed to fetch image from ${url}. Status: ${response.status}. This may be a CORS issue.`);
      throw new Error(`Failed to fetch image. Status: ${response.status}. This may be a CORS issue if you are running this locally.`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        if (base64Data) {
          resolve({ data: base64Data, mimeType });
        } else {
          reject(new Error("Failed to convert fetched image to base64."));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("Error in imageUrlToBase64:", error);
    // Re-throw to be caught by the caller.
    throw error;
  }
};
