import { useState } from 'react';
import { FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaEdit, FaCheck } from 'react-icons/fa';
import Card, { CardBody, CardHeader, CardFooter } from '../common/Card';
import Button from '../common/Button';
import { getImageUrl } from '../../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const ProfileCard = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    address: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zipCode: profile.address?.zipCode || '',
      country: profile.address?.country || '',
    }
  });

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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    const success = await onUpdate(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
            <img
              src={profile.profileImage ? getImageUrl(profile.profileImage) : PLACEHOLDER_IMAGE}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className={`px-2 py-1 text-xs font-semibold text-white rounded ${profile.status === 'active' ? 'bg-green-500' : profile.status === 'on leave' ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {profile.status}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Personal Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <FaEnvelope className="mt-1 mr-2 text-gray-500" />
                <span>{profile.email}</span>
              </div>
              
              {isEditing ? (
                <div>
                  <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ) : profile.phone ? (
                <div className="flex items-start">
                  <FaPhone className="mt-1 mr-2 text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
              ) : null}
            </div>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium">Job Details</h3>
            
            <div className="space-y-3">
              {profile.department && (
                <div className="flex items-start">
                  <FaBuilding className="mt-1 mr-2 text-gray-500" />
                  <span>Department: {profile.department}</span>
                </div>
              )}
              
              {profile.position && (
                <div className="flex items-start">
                  <FaUserTag className="mt-1 mr-2 text-gray-500" />
                  <span>Position: {profile.position}</span>
                </div>
              )}
              
              <div>
                <span className="font-medium">Date of Joining:</span>{' '}
                {new Date(profile.dateOfJoining).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-medium">Address</h3>
          
          {isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="street" className="block mb-1 text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="state" className="block mb-1 text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block mb-1 text-sm font-medium text-gray-700">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="country" className="block mb-1 text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ) : (
            <div>
              {profile.address?.street && (
                <p>{profile.address.street}</p>
              )}
              {(profile.address?.city || profile.address?.state) && (
                <p>
                  {profile.address.city}
                  {profile.address.city && profile.address.state && ', '}
                  {profile.address.state} {profile.address.zipCode}
                </p>
              )}
              {profile.address?.country && (
                <p>{profile.address.country}</p>
              )}
              {!profile.address?.street && !profile.address?.city && !profile.address?.state && !profile.address?.country && (
                <p className="text-gray-500">No address information available</p>
              )}
            </div>
          )}
        </div>
      </CardBody>
      
      <CardFooter>
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSubmit}
            >
              <FaCheck className="mr-1" /> Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit className="mr-1" /> Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;