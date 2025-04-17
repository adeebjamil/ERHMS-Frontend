import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaCalendarCheck, FaBriefcase, FaEnvelope, FaUser, FaInfoCircle, FaPassport } from 'react-icons/fa';
import api from '../../services/api';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/helpers';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications/admin');
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <FaCalendarCheck className="text-blue-500" />;
      case 'leave':
        return <FaBriefcase className="text-yellow-500" />;
      case 'message':
        return <FaEnvelope className="text-green-500" />;
      case 'profile':
        return <FaUser className="text-purple-500" />;
      case 'document':
        return <FaPassport className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  if (loading && notifications.length === 0) {
    return <div className="flex justify-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">Activity Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <FaCheck className="mr-1" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FaBell className="mx-auto text-4xl mb-4 text-gray-300" />
          <p>No notifications to display</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-4 flex items-start hover:bg-gray-50 transition-colors cursor-default ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="mr-4 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                {notification.employeeId ? (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 mr-2 overflow-hidden rounded-full">
                      <img
                        src={notification.employeeId.profileImage ? getImageUrl(notification.employeeId.profileImage) : PLACEHOLDER_IMAGE}
                        alt="Employee"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>
                    <span className="font-medium text-sm">
                      {notification.employeeId.firstName} {notification.employeeId.lastName}
                    </span>
                  </div>
                ) : null}
                <p className="text-gray-800">{notification.message}</p>
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;