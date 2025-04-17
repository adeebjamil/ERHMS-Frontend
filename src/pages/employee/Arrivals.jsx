import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPassport, FaIdCard, FaUpload, FaCheckCircle, FaLock, FaSpinner, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';

const Arrivals = () => {
  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(null); // Initialize as null to indicate "unknown state"
  const initialCheckDoneRef = useRef(false);
  
  const [formData, setFormData] = useState({
    fullNameAsPerDocuments: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiryDate: '',
    visaNumber: '',
    visaExpiryDate: ''
  });
  const [passportImage, setPassportImage] = useState(null);
  const [visaImage, setVisaImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);
  const [visaPreview, setVisaPreview] = useState(null);

  useEffect(() => {
    // Always check the server first
    const checkStatus = async () => {
      try {
        setLoading(true);
        // Try to get submission status from server
        const { data: statusData } = await api.get('/employees/travel-documents/status');
        
        if (statusData && statusData.isSubmitted) {
          setIsSubmitted(true);
          // If already submitted, fetch complete data
          const { data: fullData } = await api.get('/employees/travel-documents');
          if (fullData) {
            setExistingData(fullData);
            updateFormDataFromServer(fullData);
          }
        } else {
          setIsSubmitted(false);
          fetchExistingData();
        }
      } catch (error) {
        console.error('Error checking document status:', error);
        
        // If status endpoint fails, try to check using the main document endpoint
        try {
          const { data } = await api.get('/employees/travel-documents');
          if (data && data.isSubmitted) {
            setIsSubmitted(true);
            setExistingData(data);
            updateFormDataFromServer(data);
          } else {
            setIsSubmitted(false);
            if (data) {
              setExistingData(data);
              updateFormDataFromServer(data);
            }
          }
        } catch (fallbackError) {
          console.error('Error with fallback document check:', fallbackError);
          // Default to not submitted so user can try again
          setIsSubmitted(false);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, []);

  const updateFormDataFromServer = (data) => {
    setFormData({
      fullNameAsPerDocuments: data.fullNameAsPerDocuments || '',
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
      passportNumber: data.passportNumber || '',
      passportExpiryDate: data.passportExpiryDate ? data.passportExpiryDate.split('T')[0] : '',
      visaNumber: data.visaNumber || '',
      visaExpiryDate: data.visaExpiryDate ? data.visaExpiryDate.split('T')[0] : ''
    });

    if (data.passportImageUrl) {
      setPassportPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.passportImageUrl}`);
    }
    
    if (data.visaImageUrl) {
      setVisaPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.visaImageUrl}`);
    }
  };

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/employees/travel-documents');
      
      if (data) {
        setExistingData(data);
        updateFormDataFromServer(data);
      }
    } catch (error) {
      console.error('Error fetching travel documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (isSubmitted) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, documentType) => {
    if (isSubmitted) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
      toast.error("Please select an image or PDF file.");
      return;
    }
    
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (documentType === 'passport') {
          setPassportPreview(reader.result);
          setPassportImage(file);
        } else {
          setVisaPreview(reader.result);
          setVisaImage(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (documentType === 'passport') {
        setPassportImage(file);
        setPassportPreview(null);
      } else {
        setVisaImage(file);
        setVisaPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitted || (existingData && existingData.isSubmitted)) {
      toast.error("Documents have already been submitted and cannot be modified.");
      return;
    }
    
    try {
      const { data } = await api.get('/employees/travel-documents/status');
      if (data && data.isSubmitted) {
        setIsSubmitted(true);
        toast.error("Documents have already been submitted and cannot be modified.");
        return;
      }
    } catch (error) {
      console.error('Error verifying submission status:', error);
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      formDataToSend.append('isSubmitted', true);
      
      if (passportImage) {
        formDataToSend.append('passportImage', passportImage);
      }
      
      if (visaImage) {
        formDataToSend.append('visaImage', visaImage);
      }

      await api.post('/employees/travel-documents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsSubmitted(true);
      toast.success('Travel documents submitted successfully! Your documents are now locked for editing.');
      
      setTimeout(() => {
        fetchExistingData();
      }, 1000);
    } catch (error) {
      console.error('Error submitting travel documents:', error);
      toast.error(error.response?.data?.message || 'Failed to submit travel documents');
    } finally {
      setLoading(false);
    }
  };

  // Modify the render logic to prevent form from showing during loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="ml-2">Loading your document status...</p>
      </div>
    );
  }

  // Only return content when we know the submission status
  if (isSubmitted === null) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Travel Documents</h2>
        <p className="mt-2 text-gray-600">
          {isSubmitted ? (
            <span className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" /> Your travel documents have been submitted and cannot be modified.
            </span>
          ) : (
            "Please provide your passport and visa details as they appear on your documents."
          )}
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <FaLock className="text-blue-500 mr-2 flex-shrink-0 mt-1" />
              <div>
                <p className="text-blue-700">Your travel documents have been successfully submitted and are now locked.</p>
                <p className="mt-2 text-blue-700">
                  If you need to make changes to your submitted documents, please contact HR.
                </p>
                <a 
                  href="mailto:hr@company.com" 
                  className="mt-3 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <FaEnvelope className="mr-1" /> Contact HR
                </a>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FaPassport className="mr-2 text-indigo-600" /> Passport Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name (as per documents)</p>
                  <p className="font-medium">{formData.fullNameAsPerDocuments}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formData.dateOfBirth}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Passport Number</p>
                  <p className="font-medium">{formData.passportNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Passport Expiry Date</p>
                  <p className="font-medium">{formData.passportExpiryDate}</p>
                </div>
                
                {passportPreview && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Passport Image</p>
                    <img 
                      src={passportPreview} 
                      alt="Passport" 
                      className="w-full max-w-md h-auto rounded-md border border-gray-300" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FaIdCard className="mr-2 text-indigo-600" /> Visa Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Visa Number</p>
                  <p className="font-medium">{formData.visaNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Visa Expiry Date</p>
                  <p className="font-medium">{formData.visaExpiryDate}</p>
                </div>
                
                {visaPreview && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Visa Image</p>
                    <img 
                      src={visaPreview} 
                      alt="Visa" 
                      className="w-full max-w-md h-auto rounded-md border border-gray-300" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullNameAsPerDocuments" className="block mb-1 font-medium text-gray-700">
                Full Name (as per documents)*
              </label>
              <input
                type="text"
                id="fullNameAsPerDocuments"
                name="fullNameAsPerDocuments"
                value={formData.fullNameAsPerDocuments}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                }`}
                required
                readOnly={isSubmitted}
                disabled={isSubmitted}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block mb-1 font-medium text-gray-700">
                Date of Birth*
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                }`}
                required
                readOnly={isSubmitted}
                disabled={isSubmitted}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FaPassport className="mr-2 text-indigo-600" /> Passport Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="passportNumber" className="block mb-1 font-medium text-gray-700">
                  Passport Number*
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                  }`}
                  required
                  readOnly={isSubmitted}
                  disabled={isSubmitted}
                />
              </div>

              <div>
                <label htmlFor="passportExpiryDate" className="block mb-1 font-medium text-gray-700">
                  Passport Expiry Date*
                </label>
                <input
                  type="date"
                  id="passportExpiryDate"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                  }`}
                  required
                  readOnly={isSubmitted}
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-1 font-medium text-gray-700">
                Passport Image/Scan*
              </label>
              <div className="mt-2">
                {passportPreview ? (
                  <div className="relative">
                    <img 
                      src={passportPreview} 
                      alt="Passport Preview" 
                      className="w-full max-w-md h-auto rounded-md border border-gray-300" 
                    />
                    {!isSubmitted && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <label className="cursor-pointer bg-white text-indigo-600 px-3 py-1 rounded-md shadow hover:bg-indigo-50">
                          Change Image
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, 'passport')}
                            className="hidden"
                            accept="image/*,.pdf"
                            disabled={isSubmitted}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md">
                    <label className={`flex flex-col items-center ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <FaUpload className="text-gray-400 text-3xl mb-2" />
                      <span className="text-gray-500">Upload passport image</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'passport')}
                        className="hidden"
                        accept="image/*,.pdf"
                        required={!existingData?.passportImageUrl}
                        disabled={isSubmitted}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FaIdCard className="mr-2 text-indigo-600" /> Visa Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="visaNumber" className="block mb-1 font-medium text-gray-700">
                  Visa Number*
                </label>
                <input
                  type="text"
                  id="visaNumber"
                  name="visaNumber"
                  value={formData.visaNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                  }`}
                  required
                  readOnly={isSubmitted}
                  disabled={isSubmitted}
                />
              </div>

              <div>
                <label htmlFor="visaExpiryDate" className="block mb-1 font-medium text-gray-700">
                  Visa Expiry Date*
                </label>
                <input
                  type="date"
                  id="visaExpiryDate"
                  name="visaExpiryDate"
                  value={formData.visaExpiryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isSubmitted ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200'
                  }`}
                  required
                  readOnly={isSubmitted}
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-1 font-medium text-gray-700">
                Visa Image/Scan*
              </label>
              <div className="mt-2">
                {visaPreview ? (
                  <div className="relative">
                    <img 
                      src={visaPreview} 
                      alt="Visa Preview" 
                      className="w-full max-w-md h-auto rounded-md border border-gray-300" 
                    />
                    {!isSubmitted && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <label className="cursor-pointer bg-white text-indigo-600 px-3 py-1 rounded-md shadow hover:bg-indigo-50">
                          Change Image
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, 'visa')}
                            className="hidden"
                            accept="image/*,.pdf"
                            disabled={isSubmitted}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md">
                    <label className={`flex flex-col items-center ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <FaUpload className="text-gray-400 text-3xl mb-2" />
                      <span className="text-gray-500">Upload visa image</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'visa')}
                        className="hidden"
                        accept="image/*,.pdf"
                        required={!existingData?.visaImageUrl}
                        disabled={isSubmitted}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 font-medium text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? 'Submitting...' : 'Submit Documents'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Arrivals;