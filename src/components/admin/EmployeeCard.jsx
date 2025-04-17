import { FaEdit, FaTrash, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaWhatsapp, FaEye } from 'react-icons/fa';
import Card, { CardBody, CardFooter } from '../common/Card';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleEmailClick = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleWhatsAppClick = (phone) => {
    // Format phone number by removing any non-digit characters
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/employee-details/${id}`);
  };

  return (
    <Card>
      <CardBody>
        {/* Employee Image */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200">
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
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {employee.firstName} {employee.lastName}
          </h3>
          <div className={`px-2 py-1 text-xs font-semibold text-white rounded ${employee.status === 'active' ? 'bg-green-500' : employee.status === 'on leave' ? 'bg-yellow-500' : 'bg-red-500'}`}>
            {employee.status}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start">
            <FaEnvelope className="mt-1 mr-2 text-gray-500" />
            <span>{employee.email}</span>
          </div>
          
          {employee.phone && (
            <div className="flex items-start">
              <FaPhone className="mt-1 mr-2 text-gray-500" />
              <span>{employee.phone}</span>
            </div>
          )}
          
          {employee.department && (
            <div className="flex items-start">
              <FaBuilding className="mt-1 mr-2 text-gray-500" />
              <span>{employee.department}</span>
            </div>
          )}
          
          {employee.position && (
            <div className="flex items-start">
              <FaUserTag className="mt-1 mr-2 text-gray-500" />
              <span>{employee.position}</span>
            </div>
          )}

          {employee.salary ? (
            <div className="mt-2 font-semibold">
              Salary: ${employee.salary.toLocaleString()}
            </div>
          ) : null}
        </div>
      </CardBody>
      
      <CardFooter>
        <div className="flex justify-between w-full">
          <div className="flex space-x-2">
            {/* Action Icons */}
            <button 
              onClick={() => handleEmailClick(employee.email)}
              className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
              title="Send Email"
            >
              <FaEnvelope />
            </button>
            {employee.phone && (
              <button 
                onClick={() => handleWhatsAppClick(employee.phone)}
                className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                title="Contact via WhatsApp"
              >
                <FaWhatsapp />
              </button>
            )}
            <button 
              onClick={() => handleViewDetails(employee._id)}
              className="p-2 text-purple-600 bg-purple-100 rounded-full hover:bg-purple-200"
              title="View Details"
            >
              <FaEye />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={onEdit}
              className="flex items-center px-3 py-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
            <button 
              onClick={onDelete}
              className="flex items-center px-3 py-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;