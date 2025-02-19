import React, { useState } from 'react';
import { 
  FaUser, 
  FaCog, 
  FaQuestionCircle, 
  FaPhone, 
  FaArrowLeft,
  FaBell,
  FaMapMarkerAlt,
  FaLock,
  FaMotorcycle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const profileData = {
    name: "Chitradeep Ghosh",
    photo: "https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg",
    contact: "+91 8084281810",
    vehicle: {
      type: "Motorcycle",
      model: "Yamaha MT-15",
      licensePlate: "ABC 1234"
    }
  };

  const supportData = {
    contact: "+91 8084281810",
    email: "support@riderapp.com",
    faqs: [
      { id: 1, question: "How do I reset my password?", answer: "Go to Settings > Change Password." },
      { id: 2, question: "How do I update my delivery areas?", answer: "Go to Settings > Preferred Delivery Areas." }
    ],
    emergencyContacts: [
      { id: 1, name: "Police", number: "911" },
      { id: 2, name: "Rider Support", number: "+1 (800) 123-4567" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
      {/* Header */}
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-4">
        {['profile', 'settings', 'support'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-full font-medium ${
              activeTab === tab
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-800 border'
            }`}
          >
            {tab === 'profile' ? 'Profile' : tab === 'settings' ? 'Settings' : 'Support'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'profile' && (
          <>
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
                />
                <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaPhone />
                  <span>{profileData.contact}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaMotorcycle className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Vehicle Details</h2>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">Type:</span> {profileData.vehicle.type}</p>
                <p><span className="font-medium">Model:</span> {profileData.vehicle.model}</p>
                <p><span className="font-medium">License Plate:</span> {profileData.vehicle.licensePlate}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaLock className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full p-2 border rounded-lg"
                />
                <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                  Update Password
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaBell className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Notification Settings</h2>
              </div>
              <div className="flex items-center justify-between">
                <span>Enable Notifications</span>
                <button
                  onClick={() => setNotificationEnabled(!notificationEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    notificationEnabled ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notificationEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Preferred Delivery Areas */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaMapMarkerAlt className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Preferred Delivery Areas</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Add Delivery Area"
                  className="w-full p-2 border rounded-lg"
                />
                <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'support' && (
          <>
            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaPhone className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Contact Support</h2>
              </div>
              <div className="space-y-2">
                <p>Phone: {supportData.contact}</p>
                <p>Email: {supportData.email}</p>
                <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                  Call Now
                </button>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaQuestionCircle className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">FAQs</h2>
              </div>
              <div className="space-y-3">
                {supportData.faqs.map(faq => (
                  <div key={faq.id} className="border-b pb-3">
                    <p className="font-medium">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaPhone className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Emergency Contacts</h2>
              </div>
              <div className="space-y-2">
                {supportData.emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex justify-between items-center">
                    <span>{contact.name}</span>
                    <a href={`tel:${contact.number}`} className="text-red-500 hover:underline">
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;