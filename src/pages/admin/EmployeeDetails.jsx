import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import api from '../../services/api';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/admin/employees/${id}`);
        setEmployee(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee details');
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading employee details...</div>;
  }

  if (error) {
    return <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>;
  }

  if (!employee) {
    return <div className="p-4 text-center text-red-500">Employee not found</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/employees')}
        className="flex items-center mb-6 text-indigo-600 hover:text-indigo-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Employees
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mr-6">
              <img
                src={employee.profileImage ? `http://localhost:3000${employee.profileImage}` : PLACEHOLDER_IMAGE}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
              <p className="text-indigo-200">{employee.position} - {employee.department}</p>
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  employee.status === 'active' ? 'bg-green-500' : 
                  employee.status === 'on leave' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex">
                  <FaEnvelope className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{employee.email}</p>
                  </div>
                </div>
                
                {employee.phone && (
                  <div className="flex">
                    <FaPhone className="mt-1 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{employee.phone}</p>
                    </div>
                  </div>
                )}
                
                {employee.address && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Address</p>
                    <div className="text-gray-600">
                      {employee.address.street && <p>{employee.address.street}</p>}
                      {employee.address.city && employee.address.state && (
                        <p>{employee.address.city}, {employee.address.state} {employee.address.zipCode}</p>
                      )}
                      {employee.address.country && <p>{employee.address.country}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Employment Information</h2>
              <div className="space-y-4">
                <div className="flex">
                  <FaBuilding className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-gray-600">{employee.department || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <FaUserTag className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">Position</p>
                    <p className="text-gray-600">{employee.position || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <FaCalendarAlt className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">Date of Joining</p>
                    <p className="text-gray-600">
                      {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <FaDollarSign className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">Salary</p>
                    <p className="text-gray-600">
                      ${employee.salary ? employee.salary.toLocaleString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {employee.bankDetails && Object.values(employee.bankDetails).some(val => val) && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
              <div className="bg-gray-50 p-4 rounded">
                {employee.bankDetails.bankName && (
                  <p><span className="font-medium">Bank Name:</span> {employee.bankDetails.bankName}</p>
                )}
                {employee.bankDetails.accountHolderName && (
                  <p><span className="font-medium">Account Holder:</span> {employee.bankDetails.accountHolderName}</p>
                )}
                {employee.bankDetails.ifscCode && (
                  <p><span className="font-medium">IFSC Code:</span> {employee.bankDetails.ifscCode}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;