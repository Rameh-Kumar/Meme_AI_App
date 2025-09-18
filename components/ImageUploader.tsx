
import React, { useRef } from 'react';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  onFilesSelect: (files: FileList) => void;
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  title: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelect, uploadedImages, isLoading, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelect(event.target.files);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesSelect(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-200 mb-2">{title}</h3>
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative block w-full border-2 border-dashed border-gray-500 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors duration-300 bg-gray-800/20"
      >
        <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="mt-2 text-sm text-gray-400">
                <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif, image/webp"
          multiple
          ref={fileInputRef}
          disabled={isLoading}
        />
      </label>
      
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300">Image Preview:</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg shadow-md border-2 border-gray-700">
                <img
                  src={`data:${image.mimeType};base64,${image.data}`}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
