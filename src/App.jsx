import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loaded components
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const EmployeeList = lazy(() => import('./pages/admin/EmployeeList'));
const AddEmployee = lazy(() => import('./pages/admin/AddEmployee'));
const EditEmployee = lazy(() => import('./pages/admin/EditEmployee'));
const AttendanceDashboard = lazy(() => import('./pages/admin/AttendanceDashboard'));
const LeaveDashboard = lazy(() => import('./pages/admin/LeaveDashboard'));
const MessageDashboard = lazy(() => import('./pages/admin/MessageDashboard'));
const NotificationDashboard = lazy(() => import('./pages/admin/NotificationDashboard'));
const Profile = lazy(() => import('./pages/employee/Profile'));
const EmployeeAttendance = lazy(() => import('./pages/employee/Attendance'));
const EmployeeLeave = lazy(() => import('./pages/employee/Leave'));
const EmployeeMessages = lazy(() => import('./pages/employee/Messages'));
const Documents = lazy(() => import('./pages/employee/Documents'));
const NotFound = lazy(() => import('./pages/NotFound'));
const EmployeeDetails = lazy(() => import('./pages/admin/EmployeeDetails'));
const EmployeeDocuments = lazy(() => import('./pages/admin/EmployeeDocuments'));
const Arrivals = lazy(() => import('./pages/employee/Arrivals'));
const VisaPassportManagement = lazy(() => import('./pages/admin/VisaPassportManagement'));
const Settings = lazy(() => import('./pages/admin/Settings'));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<EmployeeList />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="add-employee" element={<AddEmployee />} />
              <Route path="edit-employee/:id" element={<EditEmployee />} />
              <Route path="attendance" element={<AttendanceDashboard />} />
              <Route path="leaves" element={<LeaveDashboard />} />
              <Route path="messages" element={<MessageDashboard />} />
              <Route path="notifications" element={<NotificationDashboard />} />
              <Route path="employee-details/:id" element={<EmployeeDetails />} />
              <Route path="employee-documents" element={<EmployeeDocuments />} />
              {/* Add the new route for Visa/Passport management */}
              <Route path="visa-passport" element={<VisaPassportManagement />} />
              {/* Add the new route for Settings */}
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Employee routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="leave" element={<EmployeeLeave />} />
              <Route path="documents" element={<Documents />} />
              <Route path="messages" element={<EmployeeMessages />} />
              <Route path="arrivals" element={<Arrivals />} />
            </Route>
            
            {/* Redirect and 404 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}