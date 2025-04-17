import { FaBell } from 'react-icons/fa';
import NotificationList from '../../components/admin/NotificationList';

const NotificationDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <FaBell className="mr-2 text-indigo-600 text-xl" />
        <h2 className="text-2xl font-semibold">Notifications</h2>
      </div>
      <p className="text-gray-600">
        View all employee activities and system notifications.
      </p>
      <NotificationList />
    </div>
  );
};

export default NotificationDashboard;