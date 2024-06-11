import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8">Cops vs Thief</h1>
      <p className="text-xl text-gray-700 text-center mb-12">
        A thrilling chase to catch the fugitive! Can you and your fellow cops corner the thief?
      </p>
      <Link to="/citySelectionPage">
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md"
        >
          Start Game
        </button>
      </Link>
    </div>
  );
}

export default LandingPage;