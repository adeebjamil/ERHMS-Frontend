import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaBriefcase, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Pagination from '../common/Pagination';

const LeaveList = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  
  useEffect(() => {
    fetchLeaves();
  }, [refreshTrigger, pagination.page]);
  
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/leave/my-leaves?page=${pagination.page}&limit=${pagination.limit}`);
      setLeaves(data.leaves);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leave records');
      setLoading(false);
    }
  };
  
  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await api.delete(`/leave/${id}`);
        toast.success('Leave request cancelled successfully');
        fetchLeaves();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel leave request');
      }
    }
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FaCheck className="text-green-600" />;
      case 'Rejected':
        return <FaTimes className="text-red-600" />;
      case 'Pending':
        return <FaClock className="text-yellow-600" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading && leaves.length === 0) {
    return <div className="flex justify-center items-center h-32">Loading leave records...</div>;
  }
  
  if (error) {
    return <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>;
  }
  
  if (leaves.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FaBriefcase className="mx-auto text-gray-300" size={40} />
        <p className="mt-2">No leave records found</p>
        <p className="text-sm">Apply for leave using the form above</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {leaves.map((leave) => (
        <div 
          key={leave._id} 
          className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-indigo-500"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{leave.leaveType}</h4>
              <p className="text-sm text-gray-600">
                {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(leave.status)}`}>
                {getStatusIcon(leave.status)} 
                <span className="ml-1">{leave.status}</span>
              </span>
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs text-gray-500">Duration</h5>
              <p className="text-sm font-medium">{leave.numberOfDays} {leave.numberOfDays > 1 ? 'days' : 'day'}</p>
            </div>
            <div>
              <h5 className="text-xs text-gray-500">Applied On</h5>
              <p className="text-sm font-medium">{format(new Date(leave.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          
          <div className="mt-3">
            <h5 className="text-xs text-gray-500">Reason</h5>
            <p className="text-sm">{leave.reason}</p>
          </div>
          
          {leave.hrNotes && (
            <div className="mt-3 p-2 bg-gray-50 rounded">
              <h5 className="text-xs text-gray-500">HR Notes</h5>
              <p className="text-sm">{leave.hrNotes}</p>
            </div>
          )}
          
          {leave.status === 'Pending' && (
            <div className="mt-3">
              <button
                onClick={() => handleCancelLeave(leave._id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Cancel Request
              </button>
            </div>
          )}
        </div>
      ))}
      
      {!loading && leaves.length > 0 && (
        <div className="mt-6">
          <Pagination 
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default LeaveList;