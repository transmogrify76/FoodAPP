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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
        
        const decoded: any = jwtDecode(token);
        const userid = decoded.userid;
  
        const response = await axios.post(
          'http://127.0.0.1:8000/users/details',
          { userid },
          { headers: { 'Content-Type': 'application/json' } }
        );
  
        setUserData(response.data.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  

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
        <div className="mt-8 text-center">
          <button className="bg-red-500 text-white text-lg font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
