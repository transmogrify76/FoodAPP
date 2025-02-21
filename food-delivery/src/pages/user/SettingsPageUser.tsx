import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaBell, FaShieldAlt, FaFileAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const SettingsPageUser: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      
      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10 flex items-center">
        <FaUserCircle className="text-2xl mr-2" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-20">
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaLock className="text-red-500 text-2xl" />
              <span className="text-lg text-gray-800">Change Password</span>
            </div>
            <button
              onClick={() => navigate('/settings/change-password')}
              className="text-red-500 font-semibold active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBell className="text-red-500 text-2xl" />
              <span className="text-lg text-gray-800">Notification Settings</span>
            </div>
            <button
              onClick={() => navigate('/settings/notifications')}
              className="text-red-500 font-semibold active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-red-500 text-2xl" />
              <span className="text-lg text-gray-800">Privacy & Security</span>
            </div>
            <button
              onClick={() => navigate('/settings/privacy')}
              className="text-red-500 font-semibold active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFileAlt className="text-red-500 text-2xl" />
              <span className="text-lg text-gray-800">Terms & Conditions</span>
            </div>
            <button
              onClick={() => navigate('/settings/terms')}
              className="text-red-500 font-semibold active:scale-95 transition-transform"
            >
              View
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaSignOutAlt className="text-red-500 text-2xl" />
              <span className="text-lg text-gray-800">Logout</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 font-semibold active:scale-95 transition-transform"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageUser;
