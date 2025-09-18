
import React, { useEffect } from 'react';

interface FullScreenViewerProps {
  memeUrl: string;
  onClose: () => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const FullScreenViewer: React.FC<FullScreenViewerProps> = ({ memeUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen image viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close fullscreen viewer"
      >
        <CloseIcon />
      </button>
      
      <div className="relative p-4">
        <img
          src={memeUrl}
          alt="Fullscreen Meme"
          className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
        />
      </div>
    </div>
  );
};
