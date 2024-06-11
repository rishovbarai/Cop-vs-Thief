import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const { result } = location.state;
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-4">Capture Result</h1>
      {result.captured ? (
        <p className="text-green-600">
          The fugitive was caught by Cop {result.copId} in {result.fugitiveLocation}.
        </p>
      ) : (
        <p className="text-red-600">The fugitive was not caught.</p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleRedirect}
      >
        Play again
      </button>
    </div>
  );
}

export default ResultPage;
