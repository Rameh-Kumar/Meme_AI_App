
import React from 'react';
import type { UploadedImage, DigitalTwinStyle } from '../types';
import { Loader } from './Loader';
import { DigitalTwinStyleSelector } from './DigitalTwinStyleSelector';

interface DigitalTwinCreatorProps {
    isToggled: boolean;
    onTwinCreate: () => void;
    onTwinRemove: () => void;
    twin: UploadedImage | null;
    isCreating: boolean;
    isLoadingApp: boolean;
    title: string;
    selectedStyle: DigitalTwinStyle;
    onStyleChange: (style: DigitalTwinStyle) => void;
    onPreview: () => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ExpandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);

export const DigitalTwinCreator: React.FC<DigitalTwinCreatorProps> = ({ 
    isToggled, 
    onTwinCreate, 
    onTwinRemove, 
    twin, 
    isCreating, 
    isLoadingApp, 
    title,
    selectedStyle,
    onStyleChange,
    onPreview
}) => {
    if (!isToggled) {
        return null;
    }
    
    const isUiDisabled = isCreating || !!twin;

    return (
        <div className="mt-6 p-4 border-2 border-dashed border-cyan-500/50 rounded-lg bg-gray-800/30 transition-all duration-300">
            <h3 className="text-lg font-medium text-cyan-300 mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">
                Turn all subjects in your image into versatile digital models. This isolates them, removes the background, and often leads to better, funnier memes.
            </p>
            
            <DigitalTwinStyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={onStyleChange}
              isDisabled={isUiDisabled}
            />

            <div className="flex items-center justify-center min-h-[80px] pt-4">
                {isCreating ? (
                    <div className="flex flex-col items-center">
                        <Loader />
                        <p className="mt-2 text-sm text-cyan-300 animate-pulse">Creating model...</p>
                    </div>
                ) : twin ? (
                    <div className="relative group w-32 h-32">
                        <button
                            onClick={onPreview}
                            className="w-full h-full bg-gray-900/50 rounded-lg flex items-center justify-center p-1 border-2 border-cyan-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300"
                            aria-label="Preview Digital Twin in fullscreen"
                        >
                            <img
                                src={`data:${twin.mimeType};base64,${twin.data}`}
                                alt="Digital Twin Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                                <ExpandIcon />
                            </div>
                        </button>
                        <button
                            onClick={onTwinRemove}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 z-10"
                            aria-label="Remove Digital Twin"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onTwinCreate}
                        disabled={isCreating || isLoadingApp}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg"
                    >
                        ✨ Create Digital Twin
                    </button>
                )}
            </div>
        </div>
    );
};
