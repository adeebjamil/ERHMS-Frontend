import { useState, useEffect } from 'react';
import { format, differenceInDays, isWeekend } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';

const LeaveForm = ({ onLeaveApplied }) => {
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    numberOfDays: 1,
    leaveType: 'Casual Leave',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchLeaveBalance();
  }, []);
  
  useEffect(() => {
    // Calculate number of days when start or end date changes
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        setFormData(prev => ({
          ...prev,
          endDate: formData.startDate,
          numberOfDays: 1
        }));
        return;
      }
      
      // Basic calculation excluding weekends
      let days = 0;
      const currentDate = new Date(start);
      while (currentDate <= end) {
        if (!isWeekend(currentDate)) {
          days++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setFormData(prev => ({
        ...prev,
        numberOfDays: days
      }));
    }
  }, [formData.startDate, formData.endDate]);
  
  const fetchLeaveBalance = async () => {
    try {
      const { data } = await api.get('/leave/my-balance');
      setLeaveBalance(data);
    } catch (error) {
      console.error('Failed to fetch leave balance:', error);
      setError('Failed to fetch your leave balance');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) {
      setError('Please select start and end dates');
      return false;
    }
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date');
      return false;
    }
    
    if (!formData.leaveType) {
      setError('Please select a leave type');
      return false;
    }
    
    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave');
      return false;
    }
    
    if (leaveBalance && formData.numberOfDays > leaveBalance.remainingLeaves) {
      setError(`Insufficient leave balance. You have only ${leaveBalance.remainingLeaves} days remaining.`);
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/leave', formData);
      toast.success('Leave application submitted successfully!');
      
      // Reset form
      setFormData({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        numberOfDays: 1,
        leaveType: 'Casual Leave',
        reason: ''
      });
      
      // Refresh leave balance
      fetchLeaveBalance();
      
      // Call the callback function to refresh the leave list
      if (onLeaveApplied) {
        onLeaveApplied();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit leave application';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg">
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      
      {leaveBalance && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-lg font-medium text-blue-800">Leave Balance</h4>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-sm text-blue-600">Total: {leaveBalance.totalLeaves} days</p>
              <p className="text-sm text-blue-600">Used: {leaveBalance.usedLeaves} days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-800">
                Remaining: {leaveBalance.remainingLeaves} days
              </p>
              <p className="text-xs text-blue-600">
                Year: {leaveBalance.year}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block mb-1 font-medium text-gray-700">Start Date*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block mb-1 font-medium text-gray-700">End Date*</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full">
            <span className="text-2xl font-bold text-indigo-600">{formData.numberOfDays}</span>
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-gray-700">Number of Working Days</h4>
            <p className="text-sm text-gray-500">Weekends are automatically excluded</p>
          </div>
        </div>
        
        <div>
          <label htmlFor="leaveType" className="block mb-1 font-medium text-gray-700">Leave Type*</label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            required
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Vacation">Vacation</option>
            <option value="Emergency">Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="reason" className="block mb-1 font-medium text-gray-700">Reason*</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            rows="3"
            placeholder="Please provide a detailed reason for your leave request..."
            required
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-medium text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Submitting...' : 'Submit Leave Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveForm;