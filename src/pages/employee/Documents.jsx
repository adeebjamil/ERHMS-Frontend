import { useState, useEffect } from 'react';
import { FaFileUpload, FaFilePdf, FaFileImage, FaTrash, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/documents/employee');
      setDocuments(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents. Please try again later.');
      setDocuments([]);
      setLoading(false);
    }
  };
  
  const handleUpload = async (documentType, file) => {
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Only image or PDF files are allowed');
      return;
    }
    
    try {
      setUploading(prev => ({ ...prev, [documentType]: true }));
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };
  
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await api.delete(`/documents/${documentId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };
  
  const getDocumentByType = (type) => {
    return documents.find(doc => doc.documentType === type);
  };
  
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return (
          <span className="flex items-center text-sm text-green-600">
            <FaCheckCircle className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center text-sm text-red-600">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center text-sm text-yellow-600">
            <FaHourglassHalf className="mr-1" /> Pending
          </span>
        );
    }
  };
  
  const renderDocumentCard = (title, description, documentType, required = true) => {
    const document = getDocumentByType(documentType);
    const isUploading = uploading[documentType];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {document && renderStatusBadge(document.status)}
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {document ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {document.fileType.includes('pdf') ? (
                  <FaFilePdf className="text-red-500 text-xl mr-2" />
                ) : (
                  <FaFileImage className="text-blue-500 text-xl mr-2" />
                )}
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {document.fileName}
                </span>
              </div>
              
              <div className="flex">
                <a
                  href={`http://localhost:3000${document.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View
                </a>
                
                <button
                  onClick={() => handleDelete(document._id)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {document.remarks && (
              <div className="text-sm italic text-gray-500 mt-1">
                HR Note: {document.remarks}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div>
            <label className="block mt-4">
              <div className={`flex items-center justify-center px-6 py-4 border-2 border-dashed rounded-md ${required ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} cursor-pointer hover:bg-gray-100`}>
                <FaFileUpload className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {isUploading ? 'Uploading...' : `Select ${required ? 'required' : ''} ${title} file`}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  disabled={isUploading}
                  onChange={(e) => handleUpload(documentType, e.target.files[0])}
                />
              </div>
            </label>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Personal Documents</h2>
        <p className="mt-2 text-gray-600">
          Upload your personal documents for HR verification. Supported formats: JPG, PNG, PDF (Max 5MB)
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderDocumentCard(
            'Aadhaar Card (Front)', 
            'Upload the front side of your Aadhaar card', 
            'aadhar_front',
            true
          )}
          
          {renderDocumentCard(
            'Aadhaar Card (Back)', 
            'Upload the back side of your Aadhaar card', 
            'aadhar_back',
            true
          )}
          
          {renderDocumentCard(
            'PAN Card', 
            'Upload your PAN card', 
            'pan_card',
            true
          )}
          
          {renderDocumentCard(
            'Bank Passbook/Statement', 
            'First page of passbook or statement with account details', 
            'passbook',
            true
          )}
          
          {renderDocumentCard(
            'Certificates', 
            'Any degree or professional certificates (Optional)', 
            'certificate',
            false
          )}
        </div>
      )}
    </div>
  );
};

export default Documents;