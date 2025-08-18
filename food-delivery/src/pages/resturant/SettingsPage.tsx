import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/restaurant-login");
  };

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Settings</h1>
        <div className="w-8"></div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex-1 overflow-y-auto max-w-lg mx-auto w-full space-y-5">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile</h2>

          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Preferences Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-5 w-5 accent-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">Theme</span>
            <select
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-md hover:from-orange-600 hover:to-orange-700 transition"
        >
          Save Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gray-500 text-white font-semibold rounded-xl shadow-md hover:bg-gray-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
