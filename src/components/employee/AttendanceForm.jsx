import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';

const AttendanceForm = ({ onAttendanceMarked }) => {
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState({
    date: formattedToday,
    status: 'Present',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.date) {
      setError('Please select a date');
      return false;
    }
    if (!formData.status) {
      setError('Please select attendance status');
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
      await api.post('/attendance', formData);
      toast.success('Attendance marked successfully!');
      
      // Reset form
      setFormData({
        date: formattedToday,
        status: 'Present',
        notes: ''
      });
      
      // Call the callback function to refresh the attendance list
      if (onAttendanceMarked) {
        onAttendanceMarked();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg">
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="date" className="block mb-1 font-medium text-gray-700">Date*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={formattedToday}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">Status*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half-day">Half-day</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block mb-1 font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            rows="3"
            placeholder="Add any specific comments or information here..."
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-medium text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;