
import React, { useEffect } from 'react';

interface FullScreenViewerProps {
  memeUrl: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PrevIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

const NextIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export const FullScreenViewer: React.FC<FullScreenViewerProps> = ({ memeUrl, onClose, onNext, onPrev, showNavigation, isFirst, isLast }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (showNavigation) {
        if (event.key === 'ArrowRight' && onNext && !isLast) {
          onNext();
        }
        if (event.key === 'ArrowLeft' && onPrev && !isFirst) {
          onPrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev, showNavigation, isFirst, isLast]);

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
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20"
        aria-label="Close fullscreen viewer"
      >
        <CloseIcon />
      </button>

      {showNavigation && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
            disabled={isFirst}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed z-20"
            aria-label="Previous panel"
          >
            <PrevIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext?.(); }}
            disabled={isLast}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed z-20"
            aria-label="Next panel"
          >
            <NextIcon />
          </button>
        </>
      )}
      
      <div className="relative p-4 w-full h-full flex items-center justify-center">
        <img
          src={memeUrl}
          alt="Fullscreen Meme"
          className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl animate-fade-in"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
        />
      </div>
    </div>
  );
};
