import { useState, useEffect } from 'react';
import { FaUserTie } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import MessageList from '../common/MessageList';
import MessageForm from '../common/MessageForm';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeMessages = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  useEffect(() => {
    fetchMessageUsers();
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchMessageUsers = async () => {
    try {
      const { data } = await api.get('/messages/users');
      setAdmins(data);
      
      // If there's at least one admin, select the first one
      if (data.length > 0) {
        setSelectedAdmin(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error('Failed to load admins');
    }
  };
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [privateRes, publicRes] = await Promise.all([
        api.get('/messages'),
        api.get('/messages/public')
      ]);
      
      // Combine and sort messages by date
      const allMessages = [
        ...privateRes.data,
        ...publicRes.data
      ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(allMessages);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
      toast.error('Failed to load messages');
    }
  };
  
  const handleSendMessage = async (content) => {
    if (!selectedAdmin) {
      toast.error('Please select an admin to message');
      return;
    }
    
    try {
      const { data } = await api.post('/messages', {
        receiverId: selectedAdmin,
        content,
        isPublic: false // Employees can only send private messages
      });
      
      setMessages([...messages, data]);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };
  
  if (loading && messages.length === 0) {
    return <div className="flex justify-center p-8">Loading messages...</div>;
  }
  
  if (admins.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <FaUserTie className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">No HR Contacts Available</h3>
        <p className="text-gray-600">
          There are currently no HR contacts available to message. Please check back later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-13rem)]">
      <div className="border-b p-4 bg-gray-50">
        <h2 className="text-lg font-medium">Messaging</h2>
        <div className="mt-2">
          <label htmlFor="admin-select" className="block text-sm font-medium text-gray-700 mb-1">
            Send Message To:
          </label>
          <select
            id="admin-select"
            value={selectedAdmin || ''}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {admins.map(admin => (
              <option key={admin._id} value={admin._id}>
                {admin.username} (HR)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <MessageList messages={messages} />
      
      <MessageForm onSendMessage={handleSendMessage} />
    </div>
  );
};

export default EmployeeMessages;