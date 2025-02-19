import React, { useState } from 'react';
import { FaMapMarkedAlt, FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState('newOrders');
  const navigate = useNavigate();

  const orders = {
    newOrders: [
      { id: 1, pickup: 'Restaurant A', dropoff: 'Customer 1', customer: 'John Doe' },
      { id: 2, pickup: 'Store B', dropoff: 'Customer 2', customer: 'Jane Smith' }
    ],
    ongoingOrders: [
      { id: 3, pickup: 'Cafe C', dropoff: 'Customer 3', customer: 'Mike Ross' }
    ],
    completedOrders: [
      { id: 4, pickup: 'Bakery D', dropoff: 'Customer 4', earnings: '$20' }
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
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Tabs */}
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {['newOrders', 'ongoingOrders', 'completedOrders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {tab === 'newOrders' ? 'New' : tab === 'ongoingOrders' ? 'Ongoing' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {activeTab === 'newOrders' && orders.newOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.pickup} → {order.dropoff}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                    <FaCheckCircle className="text-xl" />
                  </button>
                  <button className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'ongoingOrders' && orders.ongoingOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.pickup} → {order.dropoff}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                    <FaMapMarkedAlt className="text-xl" />
                  </button>
                  <button className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200">
                    Picked Up
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'completedOrders' && orders.completedOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.pickup} → {order.dropoff}</p>
                </div>
                <span className="text-green-600 font-bold">{order.earnings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;