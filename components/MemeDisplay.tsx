import React from 'react';
import { Loader } from './Loader';

interface MemeDisplayProps {
  memes: string[];
  selectedMeme: string | null;
  onSelectMeme: (memeUrl: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const MemeDisplay: React.FC<MemeDisplayProps> = ({ memes, selectedMeme, onSelectMeme, isLoading, error }) => {
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
        <p className="mt-4 text-gray-500">Your generated memes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Choose Your Favorite!</h2>
        
        {/* Main Preview Area */}
        <div className="bg-gray-900/50 p-2 rounded-lg shadow-lg border border-gray-700 min-h-[300px] flex items-center justify-center">
            {selectedMeme ? (
                <img src={selectedMeme} alt="Selected Meme" className="w-full h-auto max-h-[60vh] object-contain rounded-md" />
            ) : (
                <p className="text-gray-500 p-8 text-center">Select a variation below to see it in all its glory.</p>
            )}
        </div>

        {/* Thumbnails */}
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
            Download Selected Meme
        </a>
    </div>
  );
};