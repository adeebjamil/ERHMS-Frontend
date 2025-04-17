import api from '../services/api';
import { toast } from 'react-toastify';

export const uploadFile = async (file, employeeId, type) => {
  // We only support image uploads now
  if (type !== 'image') {
    console.error('Unsupported file type');
    return;
  }

  const formData = new FormData();
  formData.append('profileImage', file);
  
  try {
    console.log(`Uploading profile image for employee ID ${employeeId}`);
    const response = await api.post(`/upload/profile-image/${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    toast.success('Profile image uploaded successfully');
    return response.data;
  } catch (error) {
    console.error('Profile image upload error:', error);
    toast.error(`Failed to upload profile image: ${error.message}`);
    throw error;
  }
};