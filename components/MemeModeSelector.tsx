
import React from 'react';
import type { MemeGenerationMode } from '../types';

interface MemeModeSelectorProps {
  selectedMode: MemeGenerationMode;
  onModeChange: (mode: MemeGenerationMode) => void;
}

const modes: { id: MemeGenerationMode; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic Caption', description: 'AI adds a witty caption to your image.' },
  { id: 'popular', label: 'Popular Template', description: 'AI recreates your image in a famous meme format.' },
  { id: 'custom', label: 'Custom Template', description: 'Blend your subject into a template you provide.' },
  { id: 'story', label: 'Story Mode', description: 'AI generates a 4-panel story with your character.' },
];

export const MemeModeSelector: React.FC<MemeModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-200 mb-3">Generation Mode</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
              selectedMode === mode.id
                ? 'bg-purple-600/30 border-purple-500 shadow-lg'
                : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
          >
            <p className="font-bold text-white">{mode.label}</p>
            <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
