import { useState, useEffect, useRef } from 'react';
import { FaPassport, FaSearch, FaFilter, FaEye, FaDownload, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import { format, differenceInDays } from 'date-fns';
import api from '../../services/api';
import { toast } from 'react-toastify';

const VisaPassportManagement = () => {
  const alertsProcessedRef = useRef(false);
  const shownAlertsRef = useRef(new Set());

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDocuments();
  }, [filter, currentPage]);

  useEffect(() => {
    if (!alertsProcessedRef.current) {
      checkAndAlertExpiringDocuments();
      alertsProcessedRef.current = true;
    }
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 10);

      if (filter !== 'all') {
        params.append('expiryStatus', filter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const { data } = await api.get(`/admin/travel-documents?${params.toString()}`);
      setDocuments(data.documents);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch travel documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return differenceInDays(expiry, today);
  };

  const getStatusBadge = (days) => {
    if (days < 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired {Math.abs(days)} days ago</span>;
    } else if (days <= 30) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Expires in {days} days</span>;
    } else if (days <= 90) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Expires in {days} days</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Valid ({days} days left)</span>;
    }
  };

  const viewDocument = (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const downloadImage = (imageUrl, documentType) => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL.replace('/api', '')}${imageUrl}`;
    link.download = `${documentType}_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createExpiryNotification = async (employeeId, employeeName, documentType, expiryDate) => {
    try {
      const formattedDate = format(new Date(expiryDate), 'MMMM dd, yyyy');
      const message = `${employeeName}'s ${documentType} will expire in 10 days on ${formattedDate}.`;

      await api.post('/notifications/admin', {
        type: 'document',
        message,
        employeeId,
        metadata: {
          documentType,
          expiryDate
        }
      });
    } catch (error) {
      console.error(`Error creating ${documentType} expiry notification:`, error);
    }
  };

  const showExpiryToast = (employeeName, documentType, daysLeft, docId) => {
    const toastId = `${documentType}_${docId}_${daysLeft}`;

    if (!toast.isActive(toastId)) {
      toast.error(
        <div>
          <div className="flex items-center font-bold mb-1">
            <FaExclamationTriangle className="mr-2 text-yellow-400" />
            Critical Document Expiry Alert
          </div>
          <p>
            <strong>{employeeName}'s {documentType}</strong> expires in <strong>{daysLeft}</strong> {daysLeft === 1 ? 'day' : 'days'}!
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 10000,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          className: "border-l-4 border-red-500",
          toastId: toastId
        }
      );
    }
  };

  const checkAndAlertExpiringDocuments = async () => {
    try {
      const params = new URLSearchParams();
      params.append('expiryStatus', 'all');

      const { data } = await api.get(`/admin/travel-documents?${params.toString()}`);
      const documents = data.documents;

      const criticalDocuments = documents.filter(doc => {
        const passportDays = getDaysUntilExpiry(doc.passportExpiryDate);
        const visaDays = getDaysUntilExpiry(doc.visaExpiryDate);

        return (passportDays <= 10 && passportDays >= 0) || (visaDays <= 10 && visaDays >= 0);
      });

      if (criticalDocuments.length > 0) {
        criticalDocuments.forEach(doc => {
          const employeeName = `${doc.employeeId.firstName} ${doc.employeeId.lastName}`;
          const passportDays = getDaysUntilExpiry(doc.passportExpiryDate);
          const visaDays = getDaysUntilExpiry(doc.visaExpiryDate);

          const passportAlertKey = `passport_${doc._id}_${passportDays}`;
          const visaAlertKey = `visa_${doc._id}_${visaDays}`;

          if (passportDays <= 10 && passportDays >= 0 && !shownAlertsRef.current.has(passportAlertKey)) {
            showExpiryToast(employeeName, 'passport', passportDays, doc._id);
            shownAlertsRef.current.add(passportAlertKey);
          }

          if (visaDays <= 10 && visaDays >= 0 && !shownAlertsRef.current.has(visaAlertKey)) {
            showExpiryToast(employeeName, 'visa', visaDays, doc._id);
            shownAlertsRef.current.add(visaAlertKey);
          }
        });
      }

      await createServerNotifications(documents);
    } catch (error) {
      console.error('Error checking for critical expiring documents:', error);
    }
  };

  const createServerNotifications = async (documents) => {
    try {
      const expiringDocuments = documents.filter(doc => {
        const passportDays = getDaysUntilExpiry(doc.passportExpiryDate);
        const visaDays = getDaysUntilExpiry(doc.visaExpiryDate);

        return passportDays === 10 || visaDays === 10;
      });

      for (const doc of expiringDocuments) {
        const employeeName = `${doc.employeeId.firstName} ${doc.employeeId.lastName}`;

        if (getDaysUntilExpiry(doc.passportExpiryDate) === 10) {
          await createExpiryNotification(doc.employeeId._id, employeeName, 'passport', doc.passportExpiryDate);
        }

        if (getDaysUntilExpiry(doc.visaExpiryDate) === 10) {
          await createExpiryNotification(doc.employeeId._id, employeeName, 'visa', doc.visaExpiryDate);
        }
      }
    } catch (error) {
      console.error('Error creating server notifications:', error);
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Visa & Passport Management</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or document number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Documents</option>
            <option value="expired">Expired</option>
            <option value="expiring-soon">Expiring within 30 days</option>
            <option value="approaching">Expiring within 90 days</option>
            <option value="valid">Valid ({'>'} 90 days)</option>
          </select>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FaPassport className="mx-auto text-gray-300 text-6xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No travel documents found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passport Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visa Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => {
                  const passportDays = getDaysUntilExpiry(document.passportExpiryDate);
                  const visaDays = getDaysUntilExpiry(document.visaExpiryDate);

                  return (
                    <tr key={document._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-14 w-14">
                            <img
                              className="h-14 w-14 rounded-full object-cover"
                              src={document.employeeId.profileImage ?
                                `${import.meta.env.VITE_API_URL.replace('/api', '')}${document.employeeId.profileImage}`
                                : "/default-avatar.png"
                              }
                              alt=""
                              onError={(e) => { e.target.src = "/default-avatar.png" }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {document.employeeId.firstName} {document.employeeId.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {document.employeeId.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Number: {document.passportNumber}</div>
                        <div className="text-sm text-gray-500">
                          Expires: {format(new Date(document.passportExpiryDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(passportDays)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Number: {document.visaNumber}</div>
                        <div className="text-sm text-gray-500">
                          Expires: {format(new Date(document.visaExpiryDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(visaDays)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewDocument(document)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEye className="inline mr-1" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === index + 1
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
              <h3 className="text-lg font-medium">Travel Document Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Employee Information</h4>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <img
                    src={selectedDocument.employeeId.profileImage ?
                      `${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedDocument.employeeId.profileImage}`
                      : "/default-avatar.png"
                    }
                    alt=""
                    className="h-24 w-24 rounded-full object-cover"
                    onError={(e) => { e.target.src = "/default-avatar.png" }}
                  />
                  <div className="flex-1">
                    <div className="text-xl text-gray-900 font-medium">
                      {selectedDocument.employeeId.firstName} {selectedDocument.employeeId.lastName}
                    </div>
                    <div className="text-gray-600">{selectedDocument.employeeId.email}</div>
                    <div className="text-gray-600">{selectedDocument.employeeId.department} • {selectedDocument.employeeId.position}</div>
                  </div>

                  <div className="flex flex-col gap-3 mt-2 md:mt-0">
                    {selectedDocument.employeeId.phone && (
                      <a
                        href={`tel:${selectedDocument.employeeId.phone}`}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-md hover:shadow-lg transition-all duration-200 w-full"
                      >
                        <FaPhone size={20} className="text-white" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <FaPassport className="mr-2 text-indigo-600" /> Passport
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Full Name (as per passport)</div>
                      <div className="font-medium">{selectedDocument.fullNameAsPerDocuments}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Date of Birth</div>
                      <div className="font-medium">{format(new Date(selectedDocument.dateOfBirth), 'MMMM dd, yyyy')}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Passport Number</div>
                      <div className="font-medium">{selectedDocument.passportNumber}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Expiry Date</div>
                      <div className="font-medium">{format(new Date(selectedDocument.passportExpiryDate), 'MMMM dd, yyyy')}</div>
                      <div className="mt-1">
                        {getStatusBadge(getDaysUntilExpiry(selectedDocument.passportExpiryDate))}
                      </div>
                    </div>

                    {selectedDocument.passportImageUrl && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2 flex justify-between items-center">
                          <span>Passport Image</span>
                          <button
                            onClick={() => downloadImage(selectedDocument.passportImageUrl, 'passport')}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Download Passport"
                          >
                            <FaDownload size={16} />
                          </button>
                        </div>
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedDocument.passportImageUrl}`}
                          alt="Passport"
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <FaPassport className="mr-2 text-indigo-600" /> Visa
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Visa Number</div>
                      <div className="font-medium">{selectedDocument.visaNumber}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Expiry Date</div>
                      <div className="font-medium">
                        {format(new Date(selectedDocument.visaExpiryDate), 'MMMM dd, yyyy')}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(getDaysUntilExpiry(selectedDocument.visaExpiryDate))}
                      </div>
                    </div>

                    {selectedDocument.visaImageUrl && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2 flex justify-between items-center">
                          <span>Visa Image</span>
                          <button
                            onClick={() => downloadImage(selectedDocument.visaImageUrl, 'visa')}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Download Visa"
                          >
                            <FaDownload size={16} />
                          </button>
                        </div>
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedDocument.visaImageUrl}`}
                          alt="Visa"
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaPassportManagement;