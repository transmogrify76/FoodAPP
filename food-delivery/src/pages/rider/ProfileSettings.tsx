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
  FaMotorcycle,
  FaSave,
  FaEdit
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
          'http://192.168.0.200:5020/raiderops/getprofilebyid',
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
        'http://192.168.0.200:5020/raiderops/updateprofile',
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
        'http://192.168.0.200:5020/raiderops/updateprofile',
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
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center text-red-600 bg-white p-6 rounded-2xl shadow-md">
          <p className="text-lg font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-6 shadow-lg rounded-b-3xl flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
      </div>

      {/* TABS */}
      <div className="px-5 mt-5 flex space-x-3">
        {['profile', 'settings', 'support'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full font-semibold transition-all ${
              activeTab === tab
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white border text-gray-700 hover:bg-orange-50"
            }`}
          >
            {tab === 'profile' ? 'Profile' : tab === 'settings' ? 'Settings' : 'Support'}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="p-5 space-y-5">
        {activeTab === 'profile' && profileData && (
          <>
            {/* PROFILE CARD */}
            <div className="bg-white p-5 rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={profileData.profilepicture 
                      ? `data:image/png;base64,${profileData.profilepicture}`
                      : "https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                  />
                  {editMode && (
                    <div className="mt-3 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                  )}
                </div>
                
                <div className="w-full text-center">
                  {editMode ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full text-2xl font-bold text-center border-b-2 border-orange-200 focus:border-orange-500 focus:outline-none py-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800">{profileData.fullname}</h2>
                  )}
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      {editMode ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full font-medium border-b border-gray-300 focus:border-orange-500 focus:outline-none py-1"
                        />
                      ) : (
                        <p className="font-medium  text-gray-500">{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Phone</p>
                      {editMode ? (
                        <input
                          type="text"
                          name="phonenumber"
                          value={formData.phonenumber}
                          onChange={handleInputChange}
                          className="w-full font-medium border-b  border-gray-300 focus:border-orange-500 focus:outline-none py-1"
                        />
                      ) : (
                        <p className="font-medium  text-gray-500">{profileData.phonenumber || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium text-green-600">{profileData.raiderstatus}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 w-full">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center space-x-2"
                      >
                        <FaSave />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaMotorcycle className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">Vehicle Details</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm text-gray-500 font-medium">Vehicle Registration</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="vehicleregno"
                      value={formData.vehicleregno}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{profileData.vehicleregno}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 font-medium">Driving License</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="drivinglicense"
                      value={formData.drivinglicense}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{profileData.drivinglicense}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 font-medium">Preferred Delivery Areas</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="preferreddelivelrylocation"
                      value={formData.preferreddelivelrylocation}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{profileData.preferreddelivelrylocation}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {/* CHANGE PASSWORD */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaLock className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">Change Password</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <input
                    type="password"
                    name="old_password"
                    placeholder="Current Password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="new_password"
                    placeholder="New Password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleUpdatePassword}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* NOTIFICATION SETTINGS */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaBell className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">Notification Settings</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Enable Notifications</p>
                    <p className="text-sm text-gray-600">Receive order updates and alerts</p>
                  </div>
                  <button
                    onClick={() => setNotificationEnabled(!notificationEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationEnabled ? 'bg-orange-500' : 'bg-gray-300'
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
            </div>
          </>
        )}

        {activeTab === 'support' && (
          <>
            {/* CONTACT SUPPORT */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaPhone className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">Contact Support</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">{supportData.contact}</p>
                  </div>
                  <a 
                    href={`tel:${supportData.contact}`}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Call
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">{supportData.email}</p>
                  </div>
                  <a 
                    href={`mailto:${supportData.email}`}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>

            {/* FAQS */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaQuestionCircle className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">FAQs</h2>
              </div>
              
              <div className="divide-y">
                {supportData.faqs.map(faq => (
                  <div key={faq.id} className="p-4 hover:bg-orange-50 transition">
                    <p className="font-medium text-gray-800 mb-2">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* EMERGENCY CONTACTS */}
            <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition">
              <div className="p-4 border-b flex items-center space-x-3">
                <FaPhone className="text-orange-500 text-xl" />
                <h2 className="font-semibold text-gray-900 text-lg">Emergency Contacts</h2>
              </div>
              
              <div className="p-4 space-y-3">
                {supportData.emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-800">{contact.name}</span>
                    <a 
                      href={`tel:${contact.number}`}
                      className="text-red-600 font-semibold hover:underline"
                    >
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