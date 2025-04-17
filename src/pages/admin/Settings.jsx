import { useState, useEffect } from 'react';
import { FaUserShield, FaUser, FaKey, FaSave } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/employees');
      setEmployees(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch employees');
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (e) => {
    const id = e.target.value;
    setSelectedEmployee(id);
    
    // Reset credentials fields when employee changes
    setCredentials({
      username: '',
      password: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    
    if (!credentials.username && !credentials.password) {
      toast.error('Please enter a new username or password');
      return;
    }
    
    try {
      setUpdating(true);
      
      // Only include fields that have values
      const updateData = {};
      if (credentials.username) updateData.username = credentials.username;
      if (credentials.password) updateData.password = credentials.password;
      
      await api.put(`/admin/user-credentials/${selectedEmployee}`, updateData);
      
      toast.success('Credentials updated successfully');
      
      // Keep a record of the updated credentials in admin notes
      const employee = employees.find(emp => emp._id === selectedEmployee);
      const noteText = `Credentials updated for ${employee.firstName} ${employee.lastName} on ${new Date().toLocaleDateString()}. ${credentials.username ? `New username: ${credentials.username}` : ''} ${credentials.password ? `New password: ${credentials.password}` : ''}`;
      
      try {
        await api.post('/admin/employee-notes', {
          employeeId: selectedEmployee,
          note: noteText,
          type: 'credential-update'
        });
      } catch (noteError) {
        console.error('Failed to save credential note:', noteError);
      }
      
      // Reset form
      setCredentials({
        username: '',
        password: ''
      });
      setSelectedEmployee('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update credentials');
    } finally {
      setUpdating(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Recovery</h1>
        <p className="text-gray-600">Reset employee credentials when they've been forgotten</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center">
            <FaUserShield className="mr-2 text-indigo-600" /> 
            Employee Credential Management
          </h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-700">
              Search Employee
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employee" className="block mb-2 text-sm font-medium text-gray-700">
                Select Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={handleEmployeeSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select an employee --</option>
                {filteredEmployees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.email}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedEmployee && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">
                  {employees.find(emp => emp._id === selectedEmployee)?.firstName} {employees.find(emp => emp._id === selectedEmployee)?.lastName}
                </h3>
                <p className="text-sm text-blue-700">
                  Enter new username and/or password for this employee
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                  <FaUser className="inline mr-2" /> New Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="Enter new username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!selectedEmployee}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                  <FaKey className="inline mr-2" /> New Password
                </label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!selectedEmployee}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Password will be stored in plaintext in admin notes for future reference
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updating || !selectedEmployee || (!credentials.username && !credentials.password)}
                className={`flex items-center px-6 py-2 rounded-md text-white font-medium
                  ${updating || !selectedEmployee || (!credentials.username && !credentials.password) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                <FaSave className="mr-2" />
                {updating ? 'Updating...' : 'Update Credentials'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-700">Important Notes</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Only use this feature when an employee has forgotten their credentials</li>
              <li>Updated credentials will be stored securely in admin notes for reference</li>
              <li>Inform the employee of their new credentials via a secure channel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;