# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.









import { useState, useEffect } from 'react';
import { FaFileAlt, FaFileImage, FaFilePdf, FaDownload, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
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








///////////







const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Employee = require('../models/Employee');

// Make sure upload directories exist
const documentsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.documentType || 'document'}-${uniqueSuffix}${ext}`);
  }
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
}).single('document');

// Upload document handler
exports.uploadDocument = (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    try {
      // Get employee ID from the authenticated user
      const employee = await Employee.findOne({ userId: req.user._id });
      
      if (!employee) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      // Validate document type
      const docType = req.body.documentType;
      if (!['aadhar_front', 'aadhar_back', 'pan_card', 'passbook', 'certificate'].includes(docType)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid document type' });
      }
      
      // Check if document already exists
      const existingDoc = await Document.findOne({
        employeeId: employee._id,
        documentType: docType
      });
      
      if (existingDoc) {
        // Delete old file if it exists
        const oldFilePath = path.join(__dirname, '..', existingDoc.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
        
        // Update existing document
        existingDoc.fileName = req.file.originalname;
        existingDoc.filePath = `/uploads/documents/${path.basename(req.file.path)}`;
        existingDoc.fileSize = req.file.size;
        existingDoc.fileType = req.file.mimetype;
        existingDoc.uploadDate = Date.now();
        existingDoc.status = 'pending'; // Reset status
        
        await existingDoc.save();
        return res.status(200).json({
          message: 'Document updated successfully',
          document: existingDoc
        });
      }
      
      // Create new document
      const newDocument = new Document({
        employeeId: employee._id,
        documentType: docType,
        fileName: req.file.originalname,
        filePath: `/uploads/documents/${path.basename(req.file.path)}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      });
      
      await newDocument.save();
      
      res.status(201).json({
        message: 'Document uploaded successfully',
        document: newDocument
      });
      
    } catch (error) {
      console.error('Document upload error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: 'Failed to upload document',
        error: error.message
      });
    }
  });
};

// Get employee documents
exports.getEmployeeDocuments = async (req, res) => {
  try {
    // Get employee ID from authenticated user
    const employee = await Employee.findOne({ userId: req.user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const documents = await Document.find({ employeeId: employee._id });
    
    res.status(200).json(documents);
  } catch (error) {
    console.error('Get employee documents error:', error);
    res.status(500).json({
      message: 'Failed to fetch employee documents',
      error: error.message
    });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(200).json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete file from storage
    const filePath = path.join(__dirname, '..', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await Document.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Update document status (admin only)
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(200).json({
      message: 'Document status updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({
      message: 'Failed to update document status',
      error: error.message
    });
  }
};

// Get all documents (admin only)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate('employeeId', 'firstName lastName email');
    
    res.status(200).json(documents);
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};











////////////////////////////////










const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const documentController = require('../controllers/documentController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/documents/';
    
    // Set destination based on document type
    if (req.body.documentType === 'aadhaarFront' || req.body.documentType === 'aadhaarBack') {
      uploadPath += 'aadhaar/';
    } else if (req.body.documentType === 'panCard') {
      uploadPath += 'pan/';
    } else if (req.body.documentType === 'passbook') {
      uploadPath += 'bank/';
    } else if (req.body.documentType === 'certificates') {
      uploadPath += 'certificates/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.documentType}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Fix missing routes that frontend is requesting
router.get('/employee', protect, documentController.getEmployeeDocuments);
router.post('/upload', protect, documentController.uploadDocument);

// Routes for both employees and admin
router.get('/:id', protect, documentController.getDocumentById);
router.delete('/:id', protect, documentController.deleteDocument);

// Admin only routes
router.put('/:id/status', protect, isAdmin, documentController.updateDocumentStatus);
router.get('/', protect, isAdmin, documentController.getAllDocuments);

module.exports = router;