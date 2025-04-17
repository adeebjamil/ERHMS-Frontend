import AttendanceList from '../../components/admin/AttendanceList';

const AttendanceDashboard = () => {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Attendance Management</h2>
      <AttendanceList />
    </div>
  );
};

export default AttendanceDashboard;