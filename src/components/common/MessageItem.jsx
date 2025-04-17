import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import api from '../../services/api';

const MessageItem = ({ message }) => {
  const { currentUser } = useAuth();
  const [isRead, setIsRead] = useState(message.isRead);
  
  // Add null check for message.senderId
  const senderExists = message.senderId && typeof message.senderId === 'object';
  const senderId = senderExists ? message.senderId._id : message.senderId;
  const senderName = senderExists ? message.senderId.username : 'Unknown User';
  
  // Check if message is from current user
  const isOwnMessage = currentUser && senderId === currentUser._id;
  const isPublic = message.isPublic;
  
  const markAsRead = async () => {
    if (isOwnMessage || isRead) return;
    
    try {
      await api.put(`/messages/${message._id}/read`);
      setIsRead(true);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };
  
  return (
    <div 
      className={`mb-4 p-4 rounded-lg ${isOwnMessage 
        ? 'ml-auto bg-blue-100 text-blue-900' 
        : 'mr-auto bg-gray-100 text-gray-900'} 
        ${isPublic ? 'border-l-4 border-yellow-500' : ''}`}
      style={{ maxWidth: '80%' }}
      onClick={markAsRead}
    >
      <div className="flex justify-between mb-2">
        <p className="text-xs font-bold">
          {isOwnMessage ? 'You' : senderName}
          {isPublic && <span className="ml-2 px-1 bg-yellow-200 text-yellow-800 rounded text-xs">Public</span>}
        </p>
        <p className="text-xs text-gray-500">
          {format(new Date(message.createdAt), 'MMM d, h:mm a')}
        </p>
      </div>
      
      <p className="whitespace-pre-wrap">{message.content}</p>
      
      {isOwnMessage && (
        <div className="flex justify-end mt-1">
          {isRead ? (
            <FaCheckDouble className="text-blue-600 text-xs" />
          ) : (
            <FaCheck className="text-gray-400 text-xs" />
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;