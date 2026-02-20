import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaHome,
  FaHistory,
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaCamera,
  FaTimes,
  FaCheck,
  FaBell,
  FaRegHeart,
  FaShoppingBag,
  FaCog,
  FaUtensils,
  FaSignOutAlt
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

interface UserProfileData {
  name: string;
  email: string;
  address: string;
  phone_number: string;
  profilepicture: string | null;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          'http://192.168.0.103:5020/users/details',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // Map response to match interface
        const user = response.data.data;
        const mappedUser: UserProfileData = {
          name: user.name,
          email: user.email,
          address: user.address,
          phone_number: user.phonenumber || user.phone_number || '',
          profilepicture: user.profilepicture
        };

        setUserData(mappedUser);
        setName(mappedUser.name);
        setEmail(mappedUser.email);
        setPhoneNumber(mappedUser.phone_number);
        setAddress(mappedUser.address);
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

  const handleCancelEdit = () => {
    setEditing(false);
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setPhoneNumber(userData.phone_number);
      setAddress(userData.address);
    }
    setProfilePicture(null);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
    formData.append('phone_number', phone_number);
    formData.append('address', address);
    if (profilePicture) {
      formData.append('profilepicture', profilePicture);
    }

    try {
      const response = await axios.post(
        'http://192.168.0.103:5020/users/updateprofile',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUserData(response.data.updated_user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
    <div className="min-h-screen bg-orange-50 pb-24">
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
                className="flex items-center w-full p-3 rounded-lg bg-orange-100 text-orange-700"
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
            <li>
              <button
                onClick={() => navigate('/track-order')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaShoppingBag className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order Tracking</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUtensils className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">All Menus</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaCog className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/favourites')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaRegHeart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Favorites</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaShoppingCart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">View Cart</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-lg hover:bg-red-100 text-red-600 mt-6"
              >
                <FaSignOutAlt className="mr-3 text-lg" />
                <span className="font-medium">Logout</span>
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

      {/* Header (same as HomePage) */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button onClick={toggleSidebar} className="text-xl">
            <FaBars />
          </button>
          <div className="flex items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="Logo"
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">My Profile</h1>
          </div>
          <div className="w-6"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Picture Section */}
          <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 h-24"></div>
          <div className="relative px-4 pb-6">
            <div className="flex justify-center -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-100">
                  {userData.profilepicture ? (
                    <img
                      src={`data:image/jpeg;base64,${userData.profilepicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-200">
                      <FaUserAlt className="text-orange-500 text-3xl" />
                    </div>
                  )}
                </div>
                {editing && (
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-orange-600 transition"
                  >
                    <FaCamera />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              {userData.name}
            </h2>
            <p className="text-center text-orange-500 text-sm mb-6">Member</p>

            {!editing ? (
              /* View Mode */
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                    <FaEnvelope className="text-orange-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium break-all">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                    <FaPhone className="text-orange-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-800 font-medium">
                      {userData.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="text-orange-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-800 font-medium">
                      {userData.address || 'Not provided'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEditClick}
                  className="w-full mt-4 bg-orange-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone_number}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Enter address"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (exactly as HomePage) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button
          className="text-gray-500 flex flex-col items-center"
          onClick={() => navigate('/home')}
        >
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          className="text-gray-500 flex flex-col items-center"
          onClick={() => navigate('/notification-user')}
        >
          <FaBell className="text-lg" />
          <span className="text-xs mt-1">Notifications</span>
        </button>
        <button
          className="text-gray-500 flex flex-col items-center"
          onClick={() => navigate('/cart')}
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button
          className="text-gray-500 flex flex-col items-center"
          onClick={() => navigate('/history')}
        >
          <FaHistory className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button
          className="text-orange-500 flex flex-col items-center"
          onClick={() => navigate('/profile')}
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;