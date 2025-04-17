import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { COMPANY, PLACEHOLDER_IMAGE } from '../utils/constants';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(username, password);
      toast.success(`Welcome! You've successfully logged in.`);
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center">
          {/* Replace with your actual company logo */}
          <div className="w-24 h-24 mb-4 overflow-hidden bg-blue-600 rounded-full">
            <img 
              src={COMPANY.logo || PLACEHOLDER_IMAGE} 
              alt="Company Logo" 
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-center text-gray-800">{COMPANY.name}</h1>
          <h2 className="text-xl font-semibold text-center text-gray-600">HR & Employee Login</h2>
        </div>
        
        {error && <p className="p-3 text-sm text-center text-white bg-red-500 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white transition-colors bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        
        <div className="mt-6 text-center text-gray-500">
          <p className="text-sm">© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

