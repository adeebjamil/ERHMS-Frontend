import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProfileCard from '../../components/employee/ProfileCard';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching employee profile...');
        const { data } = await api.get('/employees/profile');
        console.log('Profile data received:', data);
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile data');
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updatedData) => {
    try {
      const { data } = await api.put('/employees/profile', updatedData);
      setProfile(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">My Profile</h2>
      {error && <div className="p-3 mb-4 text-white bg-red-500 rounded">{error}</div>}
      {profile ? (
        <ProfileCard profile={profile} onUpdate={updateProfile} />
      ) : (
        <div className="p-4 text-center text-red-500">Profile not found</div>
      )}
    </div>
  );
};

export default Profile;