import { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBullhorn, FaInbox } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import MessageList from '../common/MessageList';
import MessageForm from '../common/MessageForm';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/helpers';

const MessageCenter = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'public', 'private'
  
  useEffect(() => {
    fetchEmployees();
    fetchAllMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchAllMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (selectedEmployee) {
      fetchConversation(selectedEmployee);
    }
  }, [selectedEmployee]);
  
  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/messages/users');
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    }
  };
  
  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/messages');
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
      toast.error('Failed to load messages');
    }
  };
  
  const fetchConversation = async (selected) => {
    if (!selected || !selected.userId) return;
    
    try {
      setLoading(true);
      const { data } = await api.get(`/messages/${selected.userId}`);
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setLoading(false);
      toast.error('Failed to load conversation');
    }
  };
  
  const fetchPublicMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/messages/public');
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch public messages:', error);
      setLoading(false);
      toast.error('Failed to load public messages');
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedEmployee(null);
    
    if (tab === 'public') {
      fetchPublicMessages();
    } else {
      fetchAllMessages();
    }
  };
  
  const handleEmployeeSelect = (employeeId) => {
    const selectedEmp = employees.find(emp => emp._id === employeeId);
    if (selectedEmp && selectedEmp.userId) {
      setActiveTab('private');
      // Store both IDs to reference the employee and user
      setSelectedEmployee({
        employeeId: employeeId,
        userId: selectedEmp.userId._id
      });
    }
  };
  
  const handleSendMessage = async (content, isPublic) => {
    try {
      let messageData = {
        content,
        isPublic
      };
      
      if (!isPublic && !selectedEmployee) {
        toast.error('Please select an employee to message');
        return;
      }
      
      if (!isPublic) {
        messageData.receiverId = selectedEmployee.userId; // Use the user ID
      }
      
      const { data } = await api.post('/messages', messageData);
      
      // Update the message list with the new message
      setMessages([...messages, data]);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };
  
  const getEmployeeName = (selected) => {
    if (!selected || !selected.employeeId) return 'Employee';
    
    const employee = employees.find(emp => emp._id === selected.employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee';
  };

  const getFilteredMessages = () => {
    if (activeTab === 'inbox') {
      return messages;
    } else if (activeTab === 'public') {
      return messages.filter(msg => msg.isPublic);
    } else {
      // Already filtered for the selected employee through the API call
      return messages;
    }
  };

  // Add image error handling function
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE;
  };
  
  if (loading && messages.length === 0) {
    return <div className="flex justify-center p-8">Loading messages...</div>;
  }
  
  return (
    <div className="flex h-[calc(100vh-13rem)]">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-md border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Messaging</h2>
        </div>
        
        <div className="p-3">
          <div className="mb-4 flex">
            <button
              onClick={() => handleTabChange('inbox')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mr-1 flex-1 ${
                activeTab === 'inbox' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaInbox className="mr-2" /> Inbox
            </button>
            <button
              onClick={() => handleTabChange('public')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md flex-1 ${
                activeTab === 'public' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaBullhorn className="mr-2" /> Public
            </button>
          </div>
          
          <div className="mb-2 px-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Employees
            </h3>
          </div>
          
          <div className="space-y-1 max-h-[calc(100vh-25rem)] overflow-y-auto">
            {employees.map(employee => (
              <button
                key={employee._id}
                onClick={() => handleEmployeeSelect(employee._id)}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  selectedEmployee === employee._id 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-3">
                  <img
                    src={employee.profileImage ? getImageUrl(employee.profileImage) : PLACEHOLDER_IMAGE}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div className="text-left">
                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                  <div className="text-xs text-gray-500">{employee.department}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-white shadow-lg flex flex-col">
        <div className="border-b p-4 bg-gray-50 flex items-center">
          {selectedEmployee ? (
            <div className="flex items-center">
              <FaUser className="text-gray-500 mr-2" />
              <span className="font-medium">{getEmployeeName(selectedEmployee)}</span>
            </div>
          ) : activeTab === 'public' ? (
            <div className="flex items-center">
              <FaUsers className="text-gray-500 mr-2" />
              <span className="font-medium">Public Announcements</span>
            </div>
          ) : (
            <div className="flex items-center">
              <FaInbox className="text-gray-500 mr-2" />
              <span className="font-medium">All Messages</span>
            </div>
          )}
        </div>
        
        <MessageList messages={getFilteredMessages()} />
        
        <MessageForm 
          onSendMessage={handleSendMessage} 
          enablePublicOption={activeTab === 'public' || !selectedEmployee} 
        />
      </div>
    </div>
  );
};

export default MessageCenter;