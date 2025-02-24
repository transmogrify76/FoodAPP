import React, { useState } from 'react';
import { FaMotorcycle, FaClipboardList, FaUser, FaBell, FaWallet } from 'react-icons/fa';
import * as Switch from '@radix-ui/react-switch';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

// Define the interface for the decoded token payload
interface DecodedToken {
  raiderid: string;
  // include additional fields from the token payload if needed
}

const RiderDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const navigate = useNavigate();

  const toggleStatus = async () => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('raider_token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    // Decode the token to extract the raiderid
    let raiderid: string;
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      raiderid = decodedToken.raiderid;
    } catch (error) {
      console.error('Error decoding token:', error);
      return;
    }

    // Prepare form data with the extracted raiderid
    const formData = new FormData();
    formData.append('raiderid', raiderid);

    try {
      // Replace the URL below with your actual API endpoint
      const response = await fetch('http://127.0.0.1:5000/ops/raiderstatus', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        // Update UI based on the new status returned by the API
        setIsOnline(result.online_status === 'on');
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error updating raider status:", error);
    }
  };

  const handleNavigation = (tab: string, route: string): void => {
    setActiveTab(tab);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
      <div className="w-full p-4">
        <div className="w-full bg-white shadow-2xl rounded-2xl p-4">
          <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-4">Rider Dashboard</h1>
          
          <div className="flex items-center justify-between p-3 bg-red-100 border border-red-300 rounded-xl mb-4 shadow-md">
            <span className="text-base font-semibold">
              Status:
              <span className={isOnline ? 'text-green-600' : 'text-gray-500'}>
                {isOnline ? ' Online' : ' Offline'}
              </span>
            </span>
            <Switch.Root
              checked={isOnline}
              onCheckedChange={toggleStatus}
              className="w-12 h-6 bg-gray-300 rounded-full relative"
            >
              <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
            </Switch.Root>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-center shadow-md">
              <FaClipboardList className="text-red-500 text-3xl mr-3" />
              <div>
                <p className="text-sm font-semibold">Active Orders</p>
                <span className="text-2xl font-extrabold">3</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-300 rounded-xl flex items-center shadow-md">
              <FaMotorcycle className="text-orange-500 text-3xl mr-3" />
              <div>
                <p className="text-sm font-semibold">Pending Orders</p>
                <span className="text-2xl font-extrabold">5</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-center text-gray-800">Earnings Summary</h2>
            <div className="space-y-3">
              {[
                { label: 'Today', amount: '50' },
                { label: 'This Week', amount: '350' },
                { label: 'This Month', amount: '1200' }
              ].map((item, index) => (
                <div key={index} className="text-center bg-white p-2 rounded-xl shadow-md border">
                  <p className="text-gray-600 font-medium text-xs">{item.label}</p>
                  <span className="text-xl font-extrabold text-gray-800">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl">
        <div className="grid grid-cols-5 gap-2 p-2">
          <button
            onClick={() => handleNavigation('home', '/rider-dashboard')}
            className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'home' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
          >
            <FaMotorcycle className="text-xl mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => handleNavigation('earnings', '/rider-earnings')}
            className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'earnings' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
          >
            <FaWallet className="text-xl mb-1" />
            <span className="text-xs">Earnings</span>
          </button>
          <button
            onClick={() => handleNavigation('orders', '/rider-ordermanagement')}
            className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'orders' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
          >
            <FaClipboardList className="text-xl mb-1" />
            <span className="text-xs">Orders</span>
          </button>
          <button
            onClick={() => handleNavigation('alerts', '/rider-notification')}
            className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'alerts' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
          >
            <FaBell className="text-xl mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <button
            onClick={() => handleNavigation('profile', '/rider-profile')}
            className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'profile' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
          >
            <FaUser className="text-xl mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
