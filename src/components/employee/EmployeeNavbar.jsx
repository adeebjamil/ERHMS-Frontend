import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { COMPANY, PLACEHOLDER_IMAGE } from '../../utils/constants';
import { FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EmployeeNavbar = () => {
  const { logout, currentUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        if (currentUser && currentUser.role === 'employee') {
          setLoading(true);
          const { data } = await api.get('/employees/profile');
          if (data.profileImage) {
            setProfileImage(`http://localhost:3000${data.profileImage}`);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out successfully');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center">
        <div className="w-10 h-10 mr-3 overflow-hidden rounded-full">
          <img
            src={profileImage || COMPANY.logo || PLACEHOLDER_IMAGE}
            alt={profileImage ? "Profile Picture" : "Company Logo"}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
        <div>
          <h1 className="text-xl font-bold">Employee Dashboard</h1>
          <p className="text-xs text-gray-500">{COMPANY.name}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <span className="mr-4 text-sm font-medium text-gray-700">
          Welcome, {currentUser?.username}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 font-bold text-white transition bg-red-600 rounded hover:bg-red-700"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;