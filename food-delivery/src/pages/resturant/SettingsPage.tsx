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
    <div className="bg-gray-100 min-h-screen flex flex-col">
    
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-white">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-w-xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-4">Preferences</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">Theme</span>
            <select
              className="px-4 py-2 border rounded-lg"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 mb-4"
        >
          Save Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
