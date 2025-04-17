import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import { FaUpload, FaUser } from 'react-icons/fa';
import api from '../../services/api';
import { uploadFile } from '../../utils/FileUploadHelper';
import { getImageUrl } from '../../utils/helpers';

const EmployeeForm = ({ onSubmit, loading, initialData = {}, isEditMode = false, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employmentType: 'Full Time',
    salary: '',
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      ifscCode: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        bankDetails: {
          ...prev.bankDetails,
          ...(initialData.bankDetails || {})
        },
        address: {
          ...prev.address,
          ...(initialData.address || {})
        }
      }));
      
      // Set the profile image preview if it exists
      if (initialData.profileImage) {
        setPreview(getImageUrl(initialData.profileImage));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('bankDetails.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum size is 5MB.");
      return;
    }
    
    if (!file.type.match('image.*')) {
      toast.error("Please select an image file.");
      return;
    }
    
    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      employmentType: 'Full Time',
      salary: '',
      bankDetails: {
        bankName: '',
        accountHolderName: '',
        ifscCode: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setProfileImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast.info('Saving employee data...');

      // Submit basic employee data
      const response = await onSubmit(formData);
      console.log('Employee save response:', response);
      
      const employeeId = response?._id || initialData?._id;
      
      if (!employeeId) {
        toast.error('Failed to get employee ID for file uploads');
        return;
      }

      // Handle profile image upload if selected
      let hasUploadErrors = false;

      if (profileImage) {
        try {
          await uploadFile(profileImage, employeeId, 'image');
        } catch (error) {
          console.error('Profile image upload failed:', error);
          hasUploadErrors = true;
        }
      }
      
      if (hasUploadErrors) {
        toast.warning('Employee saved but profile image failed to upload. Please try uploading again.');
      } else {
        toast.success(`Employee ${isEditMode ? 'updated' : 'created'} successfully`);
        resetForm();
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} employee: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-32 h-32 overflow-hidden bg-gray-200 rounded-full">
            {preview ? (
              <img src={preview} alt="Profile Preview" className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <FaUser size={40} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
          >
            <FaUpload />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-600">Upload a passport size photo</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Authentication details (only for new employees) */}
        {!isEditMode && (
          <>
            <div>
              <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
                Username*
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                required={!isEditMode}
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                Password*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                required={!isEditMode}
              />
            </div>
          </>
        )}

        {/* Personal information */}
        <div>
          <label htmlFor="firstName" className="block mb-1 font-medium text-gray-700">
            First Name*
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block mb-1 font-medium text-gray-700">
            Last Name*
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>

        {/* Contact information */}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        {/* Employment details */}
        <div>
          <label htmlFor="department" className="block mb-1 font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
        <div>
          <label htmlFor="position" className="block mb-1 font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
        
        {/* Employment Type Dropdown */}
        <div>
          <label htmlFor="employmentType" className="block mb-1 font-medium text-gray-700">
            Employment Type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          >
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Intern">Intern</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="salary" className="block mb-1 font-medium text-gray-700">
            Salary
          </label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Bank Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="bankName" className="block mb-1 font-medium text-gray-700">
              Bank Name
            </label>
            <input
              type="text"
              id="bankName"
              name="bankDetails.bankName"
              value={formData.bankDetails.bankName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="accountHolderName" className="block mb-1 font-medium text-gray-700">
              Account Holder Name
            </label>
            <input
              type="text"
              id="accountHolderName"
              name="bankDetails.accountHolderName"
              value={formData.bankDetails.accountHolderName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="ifscCode" className="block mb-1 font-medium text-gray-700">
              IFSC Code
            </label>
            <input
              type="text"
              id="ifscCode"
              name="bankDetails.ifscCode"
              value={formData.bankDetails.ifscCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Address</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="street" className="block mb-1 font-medium text-gray-700">
              Street
            </label>
            <input
              type="text"
              id="street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="city" className="block mb-1 font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="state" className="block mb-1 font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block mb-1 font-medium text-gray-700">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="country" className="block mb-1 font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 font-bold text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Processing...' : isEditMode ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;