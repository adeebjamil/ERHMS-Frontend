import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmployeeForm from '../../components/admin/EmployeeForm';
import { toast } from 'react-toastify'; // Add this import

const AddEmployee = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (employeeData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/admin/employees', employeeData);
      setLoading(false);
      toast.success("Employee created successfully");
      navigate('/admin/employees');
      return data; // Return the data with _id
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
      setLoading(false);
      throw err; // Re-throw to be caught in the form
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Add New Employee</h2>
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      <EmployeeForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddEmployee;