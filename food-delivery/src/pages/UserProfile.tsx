import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaUserAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

interface UserProfileData {
  name: string;
  email: string;
  address: string;
  phonenumber: string;
  profilepicture: string | null;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('User is not authenticated');
          
          const decoded: any = jwtDecode(token);
          const userid = decoded.userid;
      
          const formData = new FormData();
          formData.append('userid', userid);
      
          const response = await axios.post(
            'http://127.0.0.1:5000/users/details',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
      
          setUserData(response.data.data);
          setName(response.data.data.name);
          setEmail(response.data.data.email);
          setPhoneNumber(response.data.data.phonenumber);
          setAddress(response.data.data.address);
        } catch (error) {
          console.error('Error fetching user details:', error);
          alert('Failed to fetch user data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Get the userid from the token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('User is not authenticated');
      return;
    }
    const decoded: any = jwtDecode(token);
    const userid = decoded.userid;
  
    // Create a FormData object to send the updated data
    const formData = new FormData();
    formData.append('userid', userid);  // Append the userid to the form data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phonenumber', phoneNumber);
    formData.append('address', address);
  
    if (profilePicture) {
      formData.append('profilepicture', profilePicture);
    }
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/users/updateprofile',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert('Profile updated successfully!');
      setUserData(response.data.updated_user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300">
        <p className="text-red-600 text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300">
        <p className="text-red-600 text-xl font-bold">Unable to fetch user data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-md border-4 border-red-300">
            {userData.profilepicture ? (
              <img
                src={`data:image/jpeg;base64,${userData.profilepicture}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserAlt className="text-gray-400 w-full h-full" />
            )}
            <button className="absolute bottom-1 right-1 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 transition">
              <FaEdit />
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-red-600 mt-4">{userData.name}</h1>
          <p className="text-gray-600 text-lg">Account Details</p>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-lg text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                type="submit"
                className="bg-red-500 text-white text-lg font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all"
              >
                Update Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-red-500 text-lg" />
              <p className="text-gray-700 text-lg">{userData.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <FaPhone className="text-red-500 text-lg" />
              <p className="text-gray-700 text-lg">{userData.phonenumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-red-500 text-lg" />
              <p className="text-gray-700 text-lg">{userData.address}</p>
            </div>
          </div>
        )}

        {!editing && (
          <div className="mt-8 text-center">
            <button
              onClick={handleEditClick}
              className="bg-red-500 text-white text-lg font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
