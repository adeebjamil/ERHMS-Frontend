import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmployeeCard from '../../components/admin/EmployeeCard';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/employees');
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/admin/employees/${id}`);
        setEmployees(employees.filter(emp => emp._id !== id));
        toast.success("Employee deleted successfully");
      } catch (err) {
        setError('Failed to delete employee');
        toast.error("Failed to delete employee");
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <button 
          onClick={() => navigate('/admin/add-employee')}
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          <FaUserPlus className="mr-2" /> Add Employee
        </button>
      </div>

      {error && <p className="p-3 mb-4 text-white bg-red-500 rounded">{error}</p>}

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="p-4 text-center text-gray-500">No employees found</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map(employee => (
            <EmployeeCard 
              key={employee._id} 
              employee={employee} 
              onDelete={() => handleDelete(employee._id)} 
              onEdit={() => navigate(`/admin/edit-employee/${employee._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;