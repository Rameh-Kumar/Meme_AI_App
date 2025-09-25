import React from 'react';

const BananaIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-10 h-10 text-yellow-300 inline-block mr-2 transform -rotate-45"
  >
    <path
      fillRule="evenodd"
      d="M14.615 1.585a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l2.965-7.19H4.5a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.14z"
      clipRule="evenodd"
    />
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="text-center py-6 md:py-10 border-b border-gray-700/50">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 text-transparent bg-clip-text">
          MEMEAI
        </span>
      </h1>
      <p className="mt-3 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
        Powered by Nano Banana ✨. Upload an image, and let the AI craft the perfect meme.
      </p>
    </header>
  );
};