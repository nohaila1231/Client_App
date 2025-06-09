import React from 'react';

const IntroAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      <div className="flex items-center space-x-4">
        {/* Logo animé */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 border-opacity-75"></div>
        <h1 className="text-4xl font-bold animate-pulse">CineSoul</h1>
      </div>
      {/* Texte animé */}
      <p className="mt-4 text-lg text-gray-400 animate-bounce">
        Chargement des films, veuillez patienter...
      </p>
    </div>
  );
};

export default IntroAnimation;