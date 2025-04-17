import { useState, useEffect } from 'react';
import { FaFileAlt, FaFileImage, FaFilePdf, FaDownload, FaSearch, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/documents');
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      setLoading(false);
    }
  };
  
  const updateDocumentStatus = async (documentId, status, remarks = '') => {
    try {
      await api.put(`/documents/${documentId}/status`, { 
        status,
        remarks
      });
      
      toast.success(`Document marked as ${status}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    }
  };
  
  const handleApprove = (documentId) => {
    updateDocumentStatus(documentId, 'approved');
  };
  
  const handleReject = (documentId) => {
    const remarks = window.prompt('Please enter reason for rejection:');
    if (remarks !== null) {
      updateDocumentStatus(documentId, 'rejected', remarks);
    }
  };
  
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await api.delete(`/documents/${documentId}`);
        toast.success('Document deleted successfully');
        fetchDocuments(); // Refresh the document list
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error(error.response?.data?.message || 'Failed to delete document');
      }
    }
  };
  
  const getDocumentTypeName = (type) => {
    const typeMap = {
      'aadhar_front': 'Aadhaar Front',
      'aadhar_back': 'Aadhaar Back',
      'pan_card': 'PAN Card',
      'passbook': 'Bank Passbook',
      'certificate': 'Certificate'
    };
    return typeMap[type] || type;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const filteredDocuments = documents
    .filter(doc => {
      if (filter === 'all') return true;
      return doc.status === filter;
    })
    .filter(doc => {
      if (!searchTerm) return true;
      
      const employeeName = `${doc.employeeId?.firstName || ''} ${doc.employeeId?.lastName || ''}`.toLowerCase();
      const documentType = getDocumentTypeName(doc.documentType).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return employeeName.includes(searchLower) || 
             documentType.includes(searchLower) || 
             doc.status.includes(searchLower);
    });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Employee Documents</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FaFileAlt className="mx-auto text-gray-300 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No documents found</h3>
          <p className="text-gray-500 mt-2">
            {filter !== 'all' 
              ? `No ${filter} documents match your search criteria.` 
              : 'No documents match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.employeeId?.firstName} {document.employeeId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.employeeId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDocumentTypeName(document.documentType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {document.fileType.includes('pdf') ? (
                          <FaFilePdf className="text-red-500 mr-2" />
                        ) : (
                          <FaFileImage className="text-blue-500 mr-2" />
                        )}
                        <span className="truncate max-w-xs">{document.fileName}</span>
                        <span className="ml-2 text-xs text-gray-500">({formatFileSize(document.fileSize)})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        document.status === 'approved' ? 'bg-green-100 text-green-800' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <a
                          href={`http://localhost:3000${document.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Download"
                        >
                          <FaDownload />
                        </a>
                        
                        <button
                          onClick={() => handleDelete(document._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Document"
                        >
                          <FaTrash />
                        </button>
                        
                        {document.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(document._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(document._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;