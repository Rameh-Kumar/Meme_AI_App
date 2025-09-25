
import React from 'react';
import type { MemeGenerationMode } from '../types';

interface MemeTopicInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  memeMode: MemeGenerationMode;
}

export const MemeTopicInput: React.FC<MemeTopicInputProps> = ({ value, onChange, isLoading, memeMode }) => {
  
  const getLabel = () => {
    switch (memeMode) {
      case 'custom':
        return 'Meme Instruction (Required)';
      case 'story':
        return 'Story Theme (Optional)';
      default:
        return 'Meme Topic (Optional)';
    }
  };

  const getPlaceholder = () => {
    switch (memeMode) {
      case 'custom':
        return "e.g., 'replace the person on the left with my subject'";
      case 'story':
        return "e.g., 'a story about a cat who wants to be an astronaut'";
      default:
        return "e.g., 'when the coffee hits' or 'my cat judging me'";
    }
  };
  
  const getDescription = () => {
     switch (memeMode) {
      case 'custom':
        return "Describe visual changes (e.g., 'swap characters') or provide text. Note: Text will only be added if the template originally contained text.";
      case 'story':
        return "Describe a theme for a 4-panel comic. If left blank, the AI will invent a story for your character.";
       default:
        return "Give the AI some creative direction! The more specific, the better the meme.";
    }
  }

  return (
    <div className="mt-6">
      <label htmlFor="meme-topic" className="block text-sm font-medium text-gray-300 mb-2">
        {getLabel()}
      </label>
      <div className="relative">
        <input
          id="meme-topic"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          placeholder={getPlaceholder()}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <p className="mt-2 text-xs text-gray-500">
          {getDescription()}
        </p>
      </div>
    </div>
  );
};
