import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaCalendarCheck, FaBriefcase, FaEnvelope, FaBell, FaFileAlt, FaSignOutAlt, FaPassport, FaCog } from 'react-icons/fa';
import { COMPANY } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const AdminSidebar = () => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [expiringDocuments, setExpiringDocuments] = useState(0);
  const [viewedExpiringDocs, setViewedExpiringDocs] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  // Check if user is on the visa-passport page
  useEffect(() => {
    if (location.pathname === '/admin/visa-passport' && expiringDocuments > 0) {
      // Mark notifications as viewed
      localStorage.setItem('lastViewedExpiringDocs', Date.now().toString());
      setViewedExpiringDocs(true);
    }
  }, [location.pathname, expiringDocuments]);

  useEffect(() => {
    fetchUnreadCount();
    fetchExpiringDocumentsCount();
    
    // Check for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchExpiringDocumentsCount();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadNotifications(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notification count', error);
    }
  };

  const fetchExpiringDocumentsCount = async () => {
    try {
      const { data } = await api.get('/admin/travel-documents/expiring-count');
      const count = data.count || 0;
      setExpiringDocuments(count);
      
      // Check if this count has been viewed before
      const lastViewed = localStorage.getItem('lastViewedExpiringDocs');
      const lastViewedCount = localStorage.getItem('lastExpiringDocsCount');
      
      if (lastViewed && lastViewedCount) {
        // If the count is the same as last viewed, consider it viewed
        if (parseInt(lastViewedCount) === count) {
          setViewedExpiringDocs(true);
        } else {
          // If count changed, need to view again
          setViewedExpiringDocs(false);
          localStorage.setItem('lastExpiringDocsCount', count.toString());
        }
      } else {
        // First time seeing documents
        localStorage.setItem('lastExpiringDocsCount', count.toString());
        setViewedExpiringDocs(false);
      }
    } catch (error) {
      console.error('Failed to fetch expiring documents count', error);
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
      
      {/* Admin info section */}
      <div className="p-5 flex items-center border-b border-gray-700">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-600">
          <img 
            src="/img1.jpg" 
            alt="Admin" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNEMUQxRDEiLz48L3N2Zz4=";
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentUser?.name || 'Admin User'}</span>
          <span className="text-xs text-gray-400">Administrator</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col p-4 space-y-2">
        <div className="px-4 py-2 mt-2 text-xs text-gray-400 uppercase">
          Employees
        </div>
        
        <NavLink 
          to="/admin/employees" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-yellow-700' : 'hover:bg-yellow-700'}`}
        >
          <FaUsers className="mr-2" /> Employee List
        </NavLink>
        
        <NavLink 
          to="/admin/add-employee" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
        >
          <FaUserPlus className="mr-2" /> Add Employee
        </NavLink>
        
        <div className="px-4 py-2 mt-4 mb-2 text-xs text-gray-400 uppercase">
          Management
        </div>
        
        <NavLink 
          to="/admin/attendance" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-green-700' : 'hover:bg-green-700'}`}
        >
          <FaCalendarCheck className="mr-2" /> Attendance
        </NavLink>
        
        <NavLink 
          to="/admin/leaves" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`}
        >
          <FaBriefcase className="mr-2" /> Leaves
        </NavLink>
        
        <NavLink 
          to="/admin/employee-documents" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-teal-600' : 'hover:bg-teal-600'}`}
        >
          <FaFileAlt className="mr-2" /> Documents
        </NavLink>
        
        {/* Modified Visa/Passport link */}
        <NavLink 
          to="/admin/visa-passport" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded relative transition-colors ${isActive ? 'bg-cyan-600' : 'hover:bg-cyan-600'}`}
        >
          <FaPassport className="mr-2" /> Visa/Passport
          {expiringDocuments > 0 && !viewedExpiringDocs && (
            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {expiringDocuments}
            </span>
          )}
        </NavLink>
        
        <div className="px-4 py-2 mt-4 mb-2 text-xs text-gray-400 uppercase">
          Communication
        </div>
        
        <NavLink 
          to="/admin/messages" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-fuchsia-600' : 'hover:bg-fuchsia-600'}`}
        >
          <FaEnvelope className="mr-2" /> Messages
        </NavLink>
        
        <NavLink 
          to="/admin/notifications" 
          className={({isActive}) => `flex items-center px-4 py-2 rounded relative ${isActive ? 'bg-pink-600' : 'hover:bg-pink-600'}`}
        >
          <FaBell className="mr-2" /> Notifications
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-gray-700">
          <NavLink 
            to="/admin/settings" 
            className={({isActive}) => `flex items-center px-4 py-2 rounded transition-colors ${isActive ? 'bg-lime-700' : 'hover:bg-lime-700'}`}
          >
            <FaCog className="mr-2" /> Settings
          </NavLink>
          
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

export default AdminSidebar;