import { Outlet } from 'react-router-dom';
import EmployeeLayout from '../../layouts/EmployeeLayout';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <EmployeeLayout>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Welcome, {currentUser?.username}</h1>
        <p className="text-gray-600">Access your employee information</p>
      </div>
      <Outlet />
    </EmployeeLayout>
  );
};

export default Dashboard;