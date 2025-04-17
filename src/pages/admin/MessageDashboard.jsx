import { FaEnvelope } from 'react-icons/fa';
import MessageCenter from '../../components/admin/MessageCenter';

const MessageDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <FaEnvelope className="mr-2 text-indigo-600 text-xl" />
        <h2 className="text-2xl font-semibold">Message Dashboard</h2>
      </div>
      <p className="text-gray-600">
        Send public announcements to all employees or message employees directly.
      </p>
      <MessageCenter />
    </div>
  );
};

export default MessageDashboard;