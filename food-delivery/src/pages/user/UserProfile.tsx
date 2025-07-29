import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaUserAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
          'https://backend.foodapp.transev.site/users/details',
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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User is not authenticated');
      return;
    }
    const decoded: any = jwtDecode(token);
    const userid = decoded.userid;

    const formData = new FormData();
    formData.append('userid', userid);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phonenumber', phoneNumber);
    formData.append('address', address);

    if (profilePicture) {
      formData.append('profilepicture', profilePicture);
    }

    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/users/updateprofile',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">Unable to fetch user data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 via-white to-gray-100 flex flex-col">
      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>
      <div className="flex-1 flex items-center justify-center pt-20 pb-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-red-300 hover:border-red-500 transition-all">
              {userData.profilepicture ? (
                <img
                  src={`data:image/jpeg;base64,${userData.profilepicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserAlt className="text-gray-400 w-full h-full" />
              )}
              <label className="absolute bottom-2 right-2 cursor-pointer bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <FaEdit />
              </label>
            </div>

            <h1 className="text-3xl font-extrabold text-red-600 mt-6">{userData.name}</h1>
            <p className="text-gray-600 text-xl">Account Details</p>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg text-gray-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-lg text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-lg text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-lg text-gray-700">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="mt-10 text-center">
                <button
                  type="submit"
                  className="bg-red-500 text-white text-lg font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
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
            <div className="mt-10 text-center">
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
    </div>
  );
};

export default UserProfile;
