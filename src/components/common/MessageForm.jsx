import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const MessageForm = ({ onSendMessage, enablePublicOption = false }) => {
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    onSendMessage(message, isPublic);
    setMessage('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t p-3">
      {enablePublicOption && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="public-message"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="public-message" className="text-sm font-medium">
            Public message (visible to all employees)
          </label>
        </div>
      )}
      
      <div className="flex">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 border rounded-l-lg p-2 resize-none focus:outline-none focus:ring focus:border-blue-300"
          rows={2}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-600 text-white px-4 rounded-r-lg disabled:bg-blue-300"
        >
          <FaPaperPlane />
        </button>
      </div>
    </form>
  );
};

export default MessageForm;