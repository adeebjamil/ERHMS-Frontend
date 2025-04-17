import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-6xl font-bold text-red-500">404</h1>
        <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-6 text-gray-600">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;