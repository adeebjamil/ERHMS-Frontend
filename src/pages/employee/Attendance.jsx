import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { FaCalendarAlt, FaClipboardCheck } from 'react-icons/fa';
import AttendanceForm from '../../components/employee/AttendanceForm';
import Pagination from '../../components/common/Pagination';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch employee profile first
        const profileResponse = await api.get('/employees/profile');
        setEmployeeDetails(profileResponse.data);
        
        // Then fetch attendance records with pagination
        await fetchAttendanceRecords();
      } catch (err) {
        setError('Failed to fetch attendance records');
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.page]);
  
  const fetchAttendanceRecords = async () => {
    try {
      const { data } = await api.get(`/attendance/me?page=${pagination.page}&limit=${pagination.limit}`);
      setAttendance(data.attendance);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance records');
      setLoading(false);
    }
  };
  
  const refreshAttendance = async () => {
    try {
      // Reset to first page when refreshing
      setPagination(prev => ({ ...prev, page: 1 }));
      await fetchAttendanceRecords();
    } catch (err) {
      setError('Failed to refresh attendance records');
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">My Attendance</h2>
      
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      
      {/* Employee ID Badge */}
      {employeeDetails && (
        <div className="p-4 bg-white rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-100">
              <FaClipboardCheck className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {employeeDetails.firstName} {employeeDetails.lastName}
              </h3>
              <p className="text-gray-600">Employee ID: {employeeDetails._id}</p>
              <p className="text-gray-600">{employeeDetails.department} • {employeeDetails.position}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendance Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Mark Attendance</h3>
        <AttendanceForm onAttendanceMarked={refreshAttendance} />
      </div>
      
      {/* Attendance History Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Attendance History</h3>
        </div>
        
        {attendance.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCalendarAlt className="mx-auto text-gray-300" size={40} />
            <p className="mt-2">No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.notes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;