import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaFilter, FaCalendarAlt, FaSearch, FaIdCard } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const AttendanceList = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  
  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Add pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    status: '',
    notes: ''
  });
  
  useEffect(() => {
    fetchAttendanceRecords();
    fetchEmployees();
  }, []);
  
  const fetchAttendanceRecords = async (filters = {}) => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      // If no page specified, use pagination state
      if (!filters.page) queryParams.append('page', pagination.page);
      if (!filters.limit) queryParams.append('limit', pagination.limit);
      
      const { data } = await api.get(`/attendance?${queryParams.toString()}`);
      setAttendanceRecords(data.attendance);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance records');
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
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: 1 // Reset to page 1 when filtering
    };
    
    fetchAttendanceRecords(filters);
  };
  
  const handleResetFilters = () => {
    setSelectedEmployee('');
    setStartDate('');
    setEndDate('');
    fetchAttendanceRecords();
  };
  
  const handlePageChange = (newPage) => {
    const filters = {
      employeeId: selectedEmployee || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: newPage
    };
    
    fetchAttendanceRecords(filters);
  };
  
  const openEditModal = (record) => {
    setCurrentRecord(record);
    setEditFormData({
      date: format(new Date(record.date), 'yyyy-MM-dd'),
      status: record.status,
      notes: record.notes || ''
    });
    setIsEditModalOpen(true);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/attendance/${currentRecord._id}`, editFormData);
      toast.success('Attendance record updated successfully');
      setIsEditModalOpen(false);
      fetchAttendanceRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update attendance record');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await api.delete(`/attendance/${id}`);
        toast.success('Attendance record deleted successfully');
        setAttendanceRecords(prev => prev.filter(record => record._id !== id));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete attendance record');
      }
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half-day':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading && attendanceRecords.length === 0) {
    return <div className="flex justify-center p-8">Loading attendance records...</div>;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Employee Attendance Records</h2>
        
        {/* Filter section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="employee" className="block mb-1 text-sm font-medium text-gray-700">
                <FaIdCard className="inline mr-1" /> Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full min-w-[200px] px-3 py-2 border border-gray-300 rounded-md"
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
            
            <div className="flex space-x-2">
              <button
                onClick={handleFilter}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaFilter className="mr-2" /> Filter
              </button>
              
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
        
        {/* Attendance table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {record.employeeId?._id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={record.employeeId?.profileImage ? `http://localhost:3000${record.employeeId.profileImage}` : PLACEHOLDER_IMAGE}
                            alt={`${record.employeeId?.firstName} ${record.employeeId?.lastName}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.employeeId?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.checkInTime), 'hh:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit attendance"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete attendance"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Add pagination below the attendance table */}
        {!loading && attendanceRecords.length > 0 && (
          <div className="mt-4">
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Attendance Record"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {currentRecord && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0 mr-3 rounded-full overflow-hidden">
                  <img 
                    className="h-12 w-12 object-cover"
                    src={currentRecord.employeeId?.profileImage ? `http://localhost:3000${currentRecord.employeeId.profileImage}` : PLACEHOLDER_IMAGE}
                    alt={`${currentRecord.employeeId?.firstName} ${currentRecord.employeeId?.lastName}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-md font-medium">
                    {currentRecord.employeeId?.firstName} {currentRecord.employeeId?.lastName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    ID: {currentRecord.employeeId?._id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentRecord.employeeId?.department} • {currentRecord.employeeId?.position || ''}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="edit-date" className="block mb-1 font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={editFormData.date}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-status" className="block mb-1 font-medium text-gray-700">Status</label>
            <select
              id="edit-status"
              name="status"
              value={editFormData.status}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half-day">Half-day</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="edit-notes" className="block mb-1 font-medium text-gray-700">Notes</label>
            <textarea
              id="edit-notes"
              name="notes"
              value={editFormData.notes}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceList;