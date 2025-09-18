
import React, { useRef } from 'react';
import type { UploadedImage } from '../types';

interface TemplateUploaderProps {
  onTemplateSelect: (file: File) => void;
  templateImage: UploadedImage | null;
  isLoading: boolean;
}

export const TemplateUploader: React.FC<TemplateUploaderProps> = ({ onTemplateSelect, templateImage, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onTemplateSelect(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onTemplateSelect(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Upload Meme Template</h3>
       {!templateImage && (
        <label
            htmlFor="template-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative block w-full border-2 border-dashed border-gray-500 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition-colors duration-300 bg-gray-800/20"
        >
            <div className="flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.135 48.424 48.424 0 0 0 1.123.08M13.5 18.75a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M5.25 18.75c0 .621.504 1.125 1.125 1.125H9" /></svg>
                <p className="mt-2 text-sm text-gray-400">
                    <span className="font-semibold text-pink-400">Upload your template</span> or drag it here
                </p>
            </div>
            <input
                id="template-upload"
                name="template-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif, image/webp"
                ref={fileInputRef}
                disabled={isLoading}
            />
        </label>
       )}
      
      {templateImage && (
        <div className="mt-2">
          <div className="relative w-48 mx-auto aspect-video overflow-hidden rounded-lg shadow-md border-2 border-pink-500">
            <img
              src={`data:${templateImage.mimeType};base64,${templateImage.data}`}
              alt="Template Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
