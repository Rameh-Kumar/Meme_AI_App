
import React from 'react';
import { Loader } from './Loader';
import type { MemeGenerationMode } from '../types';

interface MemeDisplayProps {
  memes: string[];
  selectedMeme: string | null;
  onSelectMeme: (memeUrl: string) => void;
  isLoading: boolean;
  error: string | null;
  onOpenFullscreen: (memeUrl: string) => void;
  memeMode: MemeGenerationMode;
}

const ExpandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);


export const MemeDisplay: React.FC<MemeDisplayProps> = ({ memes, selectedMeme, onSelectMeme, isLoading, error, onOpenFullscreen, memeMode }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-4 w-full aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center transition-all duration-300">
        <Loader />
        <p className="mt-4 text-gray-300 font-medium animate-pulse">Generating your masterpiece...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 w-full bg-red-900/50 border border-red-500 rounded-lg flex items-center justify-center text-red-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p>{error}</p>
      </div>
    );
  }
  
  if (memes.length === 0) {
    return (
      <div className="mt-8 p-4 w-full min-h-[300px] aspect-video bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="mt-4 text-gray-500">Your generated creations will appear here.</p>
      </div>
    );
  }
  
  if (memeMode === 'story') {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Your Story Unfolds...</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {memes.map((memeUrl, index) => (
            <div 
              key={index} 
              className="relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 border-gray-700 group text-white" 
              onClick={() => onOpenFullscreen(memeUrl)}
              aria-label={`View panel ${index + 1} fullscreen`}
            >
              <img src={memeUrl} alt={`Story panel ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">{index + 1}</div>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                <ExpandIcon />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">Click on a panel to view it in fullscreen.</p>
      </div>
    );
  }

  const isVariationMode = memeMode === 'classic' || memeMode === 'popular';

  return (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            {isVariationMode ? 'Choose Your Favorite!' : 'Your Creation!'}
        </h2>
        
        {/* Main Preview Area */}
        <div className="relative bg-gray-900/50 p-2 rounded-lg shadow-lg border border-gray-700 min-h-[300px] flex items-center justify-center">
            {selectedMeme ? (
                <>
                    <img src={selectedMeme} alt="Selected Meme" className="w-full h-auto max-h-[60vh] object-contain rounded-md" />
                    <button 
                        onClick={() => onOpenFullscreen(selectedMeme)}
                        className="absolute top-2 right-2 p-2 text-white bg-black/50 rounded-full hover:bg-black/75 transition-colors"
                        aria-label="View fullscreen"
                    >
                        <ExpandIcon />
                    </button>
                </>
            ) : (
                <p className="text-gray-500 p-8 text-center">
                    {isVariationMode ? 'Select a variation below to see it in all its glory.' : 'Your meme is ready!'}
                </p>
            )}
        </div>

        {/* Thumbnails */}
        {isVariationMode && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
              {memes.map((memeUrl, index) => (
                  <div
                      key={index}
                      onClick={() => onSelectMeme(memeUrl)}
                      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-4 transition-all duration-200 ${selectedMeme === memeUrl ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-500'}`}
                  >
                      <img src={memeUrl} alt={`Meme variation ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
              ))}
          </div>
        )}

        <a
            href={selectedMeme ?? '#'}
            download={selectedMeme ? "ai-generated-meme.png" : undefined}
            aria-disabled={!selectedMeme}
            onClick={(e) => !selectedMeme && e.preventDefault()}
            className={`mt-6 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center transform focus:outline-none focus:ring-4 shadow-lg ${
                !selectedMeme 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 focus:ring-green-500/50'
            }`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download {isVariationMode ? 'Selected Meme' : 'Meme'}
        </a>
    </div>
  );
};
