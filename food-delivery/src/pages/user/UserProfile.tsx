import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaUserAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaHome, FaHistory, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!token) return;

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
      setUserData(response.data.updated_user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-gray-600">Unable to fetch user data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-orange-500 text-white">
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-lg font-bold">Foodie Heaven</h3>
          </div>
          <button onClick={toggleSidebar} className="text-xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUserAlt className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button onClick={toggleSidebar} className="text-xl">
            <FaSearch />
          </button>
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">User Profile</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-orange-200 mb-4">
              {userData.profilepicture ? (
                <img
                  src={`data:image/jpeg;base64,${userData.profilepicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                  <FaUserAlt className="text-orange-400 text-4xl" />
                </div>
              )}
              
              {/* Only show edit button when in editing mode */}
              {editing && (
                <label className="absolute bottom-0 right-0 cursor-pointer bg-orange-500 text-white p-2 rounded-full shadow hover:bg-orange-600 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <FaEdit className="text-sm" />
                </label>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Account Details</p>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <FaEnvelope className="text-orange-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-700">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <FaPhone className="text-orange-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-700">{userData.phonenumber}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <FaMapMarkerAlt className="text-orange-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-700">{userData.address}</p>
                  </div>
                </div>
                <button
                  onClick={handleEditClick}
                  className="w-full mt-6 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button 
          onClick={() => navigate('/home')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <FaSearch className="text-lg" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button 
          onClick={() => navigate('/cart')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="text-orange-500 flex flex-col items-center"
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;