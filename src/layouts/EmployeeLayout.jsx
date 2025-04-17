import EmployeeNavbar from '../components/employee/EmployeeNavbar';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';

const EmployeeLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSidebar />
      <div className="flex flex-col flex-1">
        <EmployeeNavbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;