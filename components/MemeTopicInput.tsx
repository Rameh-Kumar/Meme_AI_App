
import React from 'react';
import type { MemeGenerationMode } from '../types';

interface MemeTopicInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  memeMode: MemeGenerationMode;
}

export const MemeTopicInput: React.FC<MemeTopicInputProps> = ({ value, onChange, isLoading, memeMode }) => {
  const isCustomMode = memeMode === 'custom';

  return (
    <div className="mt-6">
      <label htmlFor="meme-topic" className="block text-sm font-medium text-gray-300 mb-2">
        {isCustomMode ? 'Meme Topic / Instruction (Required)' : 'Meme Topic (Optional)'}
      </label>
      <div className="relative">
        <input
          id="meme-topic"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          placeholder={isCustomMode ? "e.g., 'me after deploying to prod on Friday'" : "e.g., 'when the coffee hits' or 'my cat judging me'"}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <p className="mt-2 text-xs text-gray-500">
          {isCustomMode 
            ? "Describe changes (e.g., 'replace the person on the left') or provide text. Note: Text will only be added if the template originally contained text."
            : "Give the AI some creative direction! The more specific, the better the meme."
          }
        </p>
      </div>
    </div>
  );
};
