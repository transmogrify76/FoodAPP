import React, { useState } from 'react';
import { FaMotorcycle, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import * as Switch from '@radix-ui/react-switch';

const RiderDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);

  const toggleStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex justify-center items-center px-6 py-5 md:px-6">
      <div className="max-w-lg w-full min-h-[600px] bg-white shadow-xl rounded-2xl p-6 md:p-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-10 md:mb-8">Rider Dashboard</h1>
        
        {/* Rider Status */}
        <div className="flex items-center justify-between p-4 bg-red-100 border border-red-300 rounded-lg mb-4 shadow-md">
          <span className="text-base md:text-lg font-semibold">Status: <span className={isOnline ? 'text-green-600' : 'text-gray-500'}>{isOnline ? 'Online' : 'Offline'}</span></span>
          <Switch.Root
            checked={isOnline}
            onCheckedChange={toggleStatus}
            className="w-14 h-7 bg-gray-300 rounded-full relative transition-all duration-300"
          >
            <Switch.Thumb className={`block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
          </Switch.Root>
        </div>
        
        {/* Orders Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-center shadow-md hover:shadow-lg transition duration-300">
            <FaClipboardList className="text-red-500 text-4xl mr-3" />
            <div>
              <p className="text-sm md:text-base font-semibold">Active Orders</p>
              <span className="text-2xl font-extrabold">3</span>
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg flex items-center shadow-md hover:shadow-lg transition duration-300">
            <FaMotorcycle className="text-orange-500 text-4xl mr-3" />
            <div>
              <p className="text-sm md:text-base font-semibold">Pending Orders</p>
              <span className="text-2xl font-extrabold">5</span>
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-gray-800">Earnings Summary</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Today', amount: '$50' },
              { label: 'This Week', amount: '$350' },
              { label: 'This Month', amount: '$1200' }
            ].map((item, index) => (
              <div key={index} className="text-center bg-white p-3 rounded-lg shadow-md border hover:shadow-lg transition duration-300">
                <p className="text-gray-600 text-xs font-medium">{item.label}</p>
                <span className="text-xl font-extrabold text-gray-800">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;