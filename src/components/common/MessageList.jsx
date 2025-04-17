import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Create a map to deduplicate messages by ID
  const uniqueMessages = messages.reduce((acc, current) => {
    // Use both ID and timestamp to ensure uniqueness
    const key = `${current._id}_${current.createdAt}`;
    if (!acc[key]) {
      acc[key] = current;
    }
    return acc;
  }, {});
  
  // Convert back to array
  const deduplicatedMessages = Object.values(uniqueMessages);
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {deduplicatedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet
        </div>
      ) : (
        deduplicatedMessages.map((message, index) => (
          <MessageItem 
            key={`${message._id}_${index}`} 
            message={message} 
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;