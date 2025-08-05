import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaLock, 
  FaBell, 
  FaShieldAlt, 
  FaFileAlt, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaHome, 
  FaHistory, 
  FaShoppingCart, 
  FaArrowLeft,
  FaUserAlt 
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const SettingsPageUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
          <button onClick={() => navigate(-1)} className="text-xl">
            <FaArrowLeft />
          </button>
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-6">
        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaLock className="text-orange-500 text-xl" />
              <span className="text-gray-800">Change Password</span>
            </div>
            <button
              onClick={() => navigate('/settings/change-password')}
              className="text-orange-500 font-medium text-sm active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBell className="text-orange-500 text-xl" />
              <span className="text-gray-800">Notification Settings</span>
            </div>
            <button
              onClick={() => navigate('/settings/notifications')}
              className="text-orange-500 font-medium text-sm active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-orange-500 text-xl" />
              <span className="text-gray-800">Privacy & Security</span>
            </div>
            <button
              onClick={() => navigate('/settings/privacy')}
              className="text-orange-500 font-medium text-sm active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFileAlt className="text-orange-500 text-xl" />
              <span className="text-gray-800">Terms & Conditions</span>
            </div>
            <button
              onClick={() => navigate('/settings/terms')}
              className="text-orange-500 font-medium text-sm active:scale-95 transition-transform"
            >
              View
            </button>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaSignOutAlt className="text-orange-500 text-xl" />
              <span className="text-gray-800">Logout</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-orange-500 font-medium text-sm active:scale-95 transition-transform"
            >
              Logout
            </button>
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
        <button 
          onClick={() => navigate('/history')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaHistory className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
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
          <FaUserCircle className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPageUser;