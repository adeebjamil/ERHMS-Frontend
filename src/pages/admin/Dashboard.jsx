import { Outlet } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Welcome, {currentUser?.username}</h1>
        <p className="text-gray-600">Manage your employees with the HR Employee Management System</p>
      </div>
      <Outlet />
    </AdminLayout>
  );
};

export default Dashboard;