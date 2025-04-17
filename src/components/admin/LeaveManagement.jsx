import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaFilter, FaCalendarAlt, FaSearch, FaIdCard, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  
  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  
  // Action modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [actionFormData, setActionFormData] = useState({
    status: '',
    hrNotes: ''
  });
  
  useEffect(() => {
    fetchLeaveRequests();
    fetchEmployees();
  }, []);
  
  const fetchLeaveRequests = async (filters = {}) => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      if (!filters.page) queryParams.append('page', pagination.page);
      if (!filters.limit) queryParams.append('limit', pagination.limit);
      
      const { data } = await api.get(`/leave?${queryParams.toString()}`);
      setLeaveRequests(data.leaves);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leave requests');
      setLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/admin/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };
  
  const handleFilter = () => {
    const filters = {
      employeeId: selectedEmployee || undefined,
      status: selectedStatus || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: 1
    };
    
    fetchLeaveRequests(filters);
  };
  
  const handleResetFilters = () => {
    setSelectedEmployee('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    fetchLeaveRequests();
  };
  
  const handlePageChange = (newPage) => {
    const filters = {
      employeeId: selectedEmployee || undefined,
      status: selectedStatus || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: newPage
    };
    
    fetchLeaveRequests(filters);
  };
  
  const openActionModal = (leave, defaultStatus) => {
    setCurrentLeave(leave);
    setActionFormData({
      status: defaultStatus || leave.status,
      hrNotes: leave.hrNotes || ''
    });
    setIsActionModalOpen(true);
  };
  
  const handleActionFormChange = (e) => {
    const { name, value } = e.target;
    setActionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/leave/${currentLeave._id}`, actionFormData);
      toast.success(`Leave request ${actionFormData.status.toLowerCase()} successfully`);
      setIsActionModalOpen(false);
      fetchLeaveRequests({
        employeeId: selectedEmployee || undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${actionFormData.status.toLowerCase()} leave request`;
      toast.error(errorMessage);
    }
  };
  
  const handleDeleteLeave = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await api.delete(`/leave/${id}`);
        toast.success('Leave request deleted successfully');
        fetchLeaveRequests({
          employeeId: selectedEmployee || undefined,
          status: selectedStatus || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete leave request');
      }
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
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FaCheck className="mr-1" />;
      case 'Rejected':
        return <FaTimes className="mr-1" />;
      case 'Pending':
        return <FaClock className="mr-1" />;
      default:
        return null;
    }
  };
  
  if (loading && leaveRequests.length === 0) {
    return <div className="flex justify-center p-8">Loading leave requests...</div>;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Employee Leave Requests</h2>
        
        {/* Filter section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="employee" className="block mb-1 text-sm font-medium text-gray-700">
                <FaIdCard className="inline mr-1" /> Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">
                <FaFilter className="inline mr-1" /> Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-1" /> From Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-1" /> To Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaFilter className="inline mr-2" /> Filter
            </button>
            
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
        
        {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
        
        {/* Leave Requests */}
        {leaveRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            <FaCalendarAlt className="mx-auto text-gray-300" size={40} />
            <p className="mt-2">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <div 
                key={leave._id} 
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${leave.status === 'Pending' ? 'border-yellow-500' : leave.status === 'Approved' ? 'border-green-500' : 'border-red-500'}`}
              >
                <div className="flex flex-wrap justify-between items-start mb-3">
                  {/* Employee Info */}
                  <div className="mb-2 md:mb-0">
                    <h4 className="font-medium">
                      {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {leave.employeeId?.department} • {leave.employeeId?.position}
                    </p>
                    <p className="text-xs text-gray-500">ID: {leave.employeeId?._id}</p>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mb-2 flex items-center ${getStatusColor(leave.status)}`}>
                      {getStatusIcon(leave.status)} {leave.status}
                    </span>
                    
                    {leave.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openActionModal(leave, 'Approved')}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(leave, 'Rejected')}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {leave.status !== 'Pending' && (
                      <button
                        onClick={() => openActionModal(leave)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <h5 className="text-xs text-gray-500">Leave Duration</h5>
                    <p className="text-sm">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-700 font-medium">
                      {leave.numberOfDays} {leave.numberOfDays > 1 ? 'days' : 'day'}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs text-gray-500">Leave Type</h5>
                    <p className="text-sm font-medium">{leave.leaveType}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs text-gray-500">Applied On</h5>
                    <p className="text-sm">{format(new Date(leave.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-xs text-gray-500">Reason</h5>
                  <p className="text-sm">{leave.reason}</p>
                </div>
                
                {leave.hrNotes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="text-xs text-gray-500">HR Notes</h5>
                    <p className="text-sm">{leave.hrNotes}</p>
                  </div>
                )}
                
                <div className="mt-3 text-right">
                  <button 
                    onClick={() => handleDeleteLeave(leave._id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && leaveRequests.length > 0 && (
          <div className="mt-4">
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${actionFormData.status} Leave Request`}
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          {currentLeave && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="text-md font-medium">Employee Details</h4>
              <p className="text-sm text-gray-600">
                {currentLeave.employeeId?.firstName} {currentLeave.employeeId?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                ID: {currentLeave.employeeId?._id}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Leave Period:</span> {format(new Date(currentLeave.startDate), 'MMM dd, yyyy')} - {format(new Date(currentLeave.endDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm">
                <span className="font-medium">Duration:</span> {currentLeave.numberOfDays} days
              </p>
              <p className="text-sm">
                <span className="font-medium">Reason:</span> {currentLeave.reason}
              </p>
            </div>
          )}
          
          <div>
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={actionFormData.status}
              onChange={handleActionFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="hrNotes" className="block mb-1 font-medium text-gray-700">HR Notes</label>
            <textarea
              id="hrNotes"
              name="hrNotes"
              value={actionFormData.hrNotes}
              onChange={handleActionFormChange}
              placeholder="Add notes for employee (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded ${
                actionFormData.status === 'Approved' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : actionFormData.status === 'Rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {actionFormData.status === 'Pending' 
                ? 'Mark as Pending' 
                : actionFormData.status === 'Approved' 
                ? 'Approve Leave' 
                : 'Reject Leave'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;