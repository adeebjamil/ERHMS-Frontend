import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmployeeForm from '../../components/admin/EmployeeForm';
import { toast } from 'react-toastify'; // Add this import

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/admin/employees/${id}`);
        setEmployee(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee details');
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleSubmit = async (employeeData) => {
    try {
      setSubmitting(true);
      const { data } = await api.put(`/admin/employees/${id}`, employeeData);
      setSubmitting(false);
      toast.success("Employee updated successfully");
      navigate('/admin/employees');
      return data; // Return the data with _id
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
      setSubmitting(false);
      throw err; // Re-throw to be caught in the form
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading employee data...</div>;
  }

  if (!employee && !loading) {
    return <div className="p-4 text-center text-red-500">Employee not found</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Edit Employee</h2>
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      <EmployeeForm 
        onSubmit={handleSubmit} 
        loading={submitting} 
        initialData={employee} 
        isEditMode={true}
      />
    </div>
  );
};

export default EditEmployee;