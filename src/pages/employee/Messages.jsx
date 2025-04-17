import { FaEnvelope } from 'react-icons/fa';
import EmployeeMessages from '../../components/employee/EmployeeMessages';

const Messages = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <FaEnvelope className="mr-2 text-indigo-600 text-xl" />
        <h2 className="text-2xl font-semibold">Messages</h2>
      </div>
      <p className="text-gray-600">
        Send and receive messages with HR staff.
      </p>
      <EmployeeMessages />
    </div>
  );
};

export default Messages;