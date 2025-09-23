
import React from 'react';
import type { DigitalTwinStyle } from '../types';

interface DigitalTwinStyleSelectorProps {
  selectedStyle: DigitalTwinStyle;
  onStyleChange: (style: DigitalTwinStyle) => void;
  isDisabled: boolean;
}

const styles: { id: DigitalTwinStyle; label: string; description: string }[] = [
  { id: 'sticker', label: 'Sticker', description: 'Clean, enhanced photorealistic cutout.' },
  { id: '3d_model', label: '3D Model', description: 'Pixar-style 3D character render.' },
  { id: 'cartoon', label: 'Cartoon', description: 'Vibrant 2D animated style.' },
  { id: 'pixel_art', label: 'Pixel Art', description: 'Classic 16-bit video game sprite.' },
];

export const DigitalTwinStyleSelector: React.FC<DigitalTwinStyleSelectorProps> = ({ selectedStyle, onStyleChange, isDisabled }) => {
  return (
    <div className="my-4">
      <h4 className="text-sm font-medium text-gray-300 mb-2 text-center">Choose a Model Style:</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            disabled={isDisabled}
            className={`p-3 rounded-lg text-left transition-all duration-200 border-2 text-sm
              ${isDisabled ? 'cursor-not-allowed bg-gray-700/50 border-gray-600' : ''}
              ${!isDisabled && selectedStyle === style.id ? 'bg-cyan-600/30 border-cyan-500 shadow-md' : ''}
              ${!isDisabled && selectedStyle !== style.id ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500' : ''}
            `}
          >
            <p className="font-bold text-white">{style.label}</p>
            <p className="text-xs text-gray-400 mt-1">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
