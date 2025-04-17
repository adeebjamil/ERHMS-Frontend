import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaFileAlt, FaEnvelope, FaSignOutAlt, FaFileUpload, FaPlane } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PLACEHOLDER_IMAGE, COMPANY } from '../../utils/constants';

const EmployeeSidebar = () => {
  const [leaveUpdates, setLeaveUpdates] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    fetchNotificationCounts();
    fetchProfileImage();
  }, []);

  const fetchNotificationCounts = async () => {
    try {
      const { data } = await api.get('/leave/updates-count');
      setLeaveUpdates(data.count);
    } catch (error) {
      console.error('Failed to fetch notification counts', error);
      setLeaveUpdates(0);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const { data } = await api.get('/employees/profile');
      if (data.profileImage) {
        setProfileImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.profileImage}`);
      }
    } catch (error) {
      console.error('Failed to fetch profile image', error);
    }
  };

  return (
    <aside className="flex flex-col w-64 bg-gray-800 text-white overflow-y-auto">
      {/* Company header section */}
      <div className="p-5 bg-gray-900">
        <div className="flex flex-col items-center text-center">
          <img 
            src="/Frame 3.png" 
            alt={COMPANY.shortName || "Company"}
            className="w-16 h-16 object-contain mb-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM0QjU1NjMiLz48L3N2Zz4=";
            }}
          />
          <h1 className="text-xl font-bold">{COMPANY.name || "Lovosis technonogy private limited"}</h1>
        </div>
      </div>
      
      {/* User info section */}
      <div className="p-5 flex items-center border-b border-gray-700">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-600">
          <img 
            src={profileImage || PLACEHOLDER_IMAGE} 
            alt={currentUser?.name || "User"} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNEMUQxRDEiLz48L3N2Zz4=";
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentUser?.name || currentUser?.username || "User"}</span>
          <span className="text-xs text-gray-400">Employee</span>
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex flex-col p-4 space-y-2">
        <NavLink 
          to="/employee/profile" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-purple-900' : 'hover:bg-purple-900'}`}
        >
          <FaUser className="mr-2" /> Profile
        </NavLink>
        
        <NavLink 
          to="/employee/attendance" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-red-900' : 'hover:bg-red-900'}`}
        >
          <FaCalendarAlt className="mr-2" /> Attendance
        </NavLink>
        
        <NavLink 
          to="/employee/leave" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded relative transition-colors ${isActive ? 'bg-cyan-900' : 'hover:bg-cyan-900'}`}
        >
          <FaFileAlt className="mr-2" /> Leave
          {leaveUpdates > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {leaveUpdates}
            </span>
          )}
        </NavLink>
        
        <NavLink 
          to="/employee/documents" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-fuchsia-900' : 'hover:bg-fuchsia-900'}`}
        >
          <FaFileUpload className="mr-2" /> Documents
        </NavLink>
        
        <NavLink 
          to="/employee/arrivals" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-green-700' :'hover:bg-green-700'}`}
        >
          <FaPlane className="mr-2" /> Arrivals
        </NavLink>
        
        <NavLink 
          to="/employee/messages" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-emerald-900' : 'hover:bg-emerald-900'}`}
        >
          <FaEnvelope className="mr-2" /> Messages
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-gray-700">
          <button 
            onClick={logout}
            className="flex items-center px-4 py-2 rounded text-gray-400 hover:bg-red-700 hover:text-white w-full transition-colors"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default EmployeeSidebar;