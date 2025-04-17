import { useState, useEffect } from 'react';
import LeaveForm from '../../components/employee/LeaveForm';
import LeaveList from '../../components/employee/LeaveList';
import api from '../../services/api';

const Leave = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Mark leave notifications as read when the component mounts
    const markLeaveUpdatesAsRead = async () => {
      try {
        await api.put('/leave/mark-updates-read');
      } catch (error) {
        console.error('Failed to mark leave updates as read:', error);
      }
    };

    markLeaveUpdatesAsRead();
  }, []);

  const handleLeaveApplied = () => {
    // Increment to trigger refresh in LeaveList
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">My Leaves</h2>
      
      {/* Leave Application Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Apply for Leave</h3>
        <LeaveForm onLeaveApplied={handleLeaveApplied} />
      </div>
      
      {/* Leave History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Leave History</h3>
        </div>
        <div className="p-6">
          <LeaveList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Leave;