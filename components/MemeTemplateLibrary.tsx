
import React from 'react';
import { memeTemplates } from '../memeTemplates';
import type { MemeTemplate } from '../memeTemplates';

interface MemeTemplateLibraryProps {
    onSelectTemplate: (template: MemeTemplate) => void;
    selectedTemplateUrl: string | null;
    isLoading: boolean;
}

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

export const MemeTemplateLibrary: React.FC<MemeTemplateLibraryProps> = ({ onSelectTemplate, selectedTemplateUrl, isLoading }) => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-200 mb-3">Step 2: Choose a Popular Template</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {memeTemplates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        disabled={isLoading}
                        className={`relative aspect-video rounded-lg overflow-hidden group border-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
              ${selectedTemplateUrl === template.imageUrl ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-500'}
            `}
                        aria-label={`Select ${template.name} template`}
                        aria-pressed={selectedTemplateUrl === template.imageUrl}
                    >
                        <img src={template.imageUrl} alt={template.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs text-center truncate">
                            {template.name}
                        </div>
                        {selectedTemplateUrl === template.imageUrl && (
                            <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-1 flex items-center justify-center shadow-lg">
                                <CheckIcon />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
