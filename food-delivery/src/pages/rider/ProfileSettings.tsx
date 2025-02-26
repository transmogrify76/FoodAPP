import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface RaiderProfile {
  fullname: string;
  email: string;
  address?: string;
  phonenumber?: string;
  profilepicture?: string;
  vehicleregno: string;
  drivinglicense: string;
  preferreddelivelrylocation: string;
  raiderstatus: string;
}

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [profileData, setProfileData] = useState<RaiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phonenumber: '',
    address: '',
    vehicleregno: '',
    drivinglicense: '',
    preferreddelivelrylocation: '',
    profilepicture: null as File | null,
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

 
  const getRaiderIdFromraider_token = () => {
    const raider_token = localStorage.getItem('raider_token');
    if (raider_token) {
      const decoded: any = jwtDecode(raider_token);
      return decoded?.raiderid;
    }
    return null;
  };

  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const raiderid = getRaiderIdFromraider_token();
        if (!raiderid) {
          throw new Error('Raider not authenticated');
        }

        const response = await axios.post(
          'http://192.168.0.225:5000/raiderops/getprofilebyid',
          new URLSearchParams({ raiderid })
        );

        if (response.data.data) {
          setProfileData(response.data.data);
          setFormData({
            fullname: response.data.data.fullname,
            email: response.data.data.email,
            phonenumber: response.data.data.phonenumber || '',
            address: response.data.data.address || '',
            vehicleregno: response.data.data.vehicleregno,
            drivinglicense: response.data.data.drivinglicense,
            preferreddelivelrylocation: response.data.data.preferreddelivelrylocation,
            profilepicture: null,
          });
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilepicture: e.target.files[0] });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdateProfile = async () => {
    try {
      const raiderid = getRaiderIdFromraider_token();
      if (!raiderid) {
        throw new Error('Raider not authenticated');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('raiderid', raiderid);
      formDataToSend.append('fullname', formData.fullname);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phonenumber', formData.phonenumber);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('vehicleregno', formData.vehicleregno);
      formDataToSend.append('drivinglicense', formData.drivinglicense);
      formDataToSend.append('preferreddelivelrylocation', formData.preferreddelivelrylocation);
      if (formData.profilepicture) {
        formDataToSend.append('profilepicture', formData.profilepicture);
      }

      const response = await axios.post(
        'http://192.168.0.225:5000/raiderops/updateprofile',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setProfileData(response.data.updated_data);
        setEditMode(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    try {
      const raiderid = getRaiderIdFromraider_token();
      if (!raiderid) {
        throw new Error('Raider not authenticated');
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        alert('New password and confirm password do not match.');
        return;
      }

      const response = await axios.post(
        'http://192.168.0.225:5000/raiderops/updateprofile',
        new URLSearchParams({
          raiderid,
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        })
      );

      if (response.status === 200) {
        alert('Password updated successfully!');
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
      }
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Failed to update password.');
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
      { id: 1, name: "Police", number: "100" },
      { id: 2, name: "Rider Support", number: "+91 9955679832" }
    ]
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 p-4 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 p-4 flex items-center justify-center text-red-600">{error}</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 p-4 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 p-4 flex items-center justify-center text-red-600">{error}</div>;
  }

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

      {/* Tab Navigation */}
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'profile' && profileData && (
          <>
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={profileData.profilepicture 
                    ? `data:image/png;base64,${profileData.profilepicture}`
                    : "https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
                />
                {editMode ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                ) : null}
                <h2 className="text-2xl font-bold text-gray-800">
                  {editMode ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    profileData.fullname
                  )}
                </h2>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaPhone />
                  {editMode ? (
                    <input
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    <span>{profileData.phonenumber || 'N/A'}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaUser />
                  <span>Status: {profileData.raiderstatus}</span>
                </div>
                {editMode ? (
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaMotorcycle className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Vehicle Details</h2>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Registration:</span>
                  {editMode ? (
                    <input
                      type="text"
                      name="vehicleregno"
                      value={formData.vehicleregno}
                      onChange={handleInputChange}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    profileData.vehicleregno
                  )}
                </p>
                <p>
                  <span className="font-medium">License:</span>
                  {editMode ? (
                    <input
                      type="text"
                      name="drivinglicense"
                      value={formData.drivinglicense}
                      onChange={handleInputChange}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    profileData.drivinglicense
                  )}
                </p>
                <p>
                  <span className="font-medium">Preferred Areas:</span>
                  {editMode ? (
                    <input
                      type="text"
                      name="preferreddelivelrylocation"
                      value={formData.preferreddelivelrylocation}
                      onChange={handleInputChange}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    profileData.preferreddelivelrylocation
                  )}
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaLock className="text-red-500 text-xl" />
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  name="old_password"
                  placeholder="Current Password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="password"
                  name="new_password"
                  placeholder="New Password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm New Password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  onClick={handleUpdatePassword}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Notification Settings Section */}
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
          </>
        )}

        {activeTab === 'support' && (
          <>
            {/* Contact Support Section */}
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

            {/* FAQs Section */}
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

            {/* Emergency Contacts Section */}
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