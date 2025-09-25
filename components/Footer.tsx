import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto py-4 text-center text-gray-500 text-sm border-t border-gray-700/50">
      <p>&copy; {new Date().getFullYear()} MEMEAI. All rights reserved.</p>
    </footer>
  );
};