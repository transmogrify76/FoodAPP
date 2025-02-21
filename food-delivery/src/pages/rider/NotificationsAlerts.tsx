import React, { useState } from 'react';
import {
  FaBell,
  FaMoneyBillWave,
  FaTools,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationsAlerts = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      message: 'New order available: Restaurant A → Customer X (1.2km)',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received: 15.50 for Order #12345',
      time: '1 hour ago',
      read: true
    },
    {
      id: 3,
      type: 'system',
      message: 'System update: New features available in app version 2.1',
      time: '5 hours ago',
      read: false
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
 
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
              <FaArrowLeft className="text-xl text-gray-800" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h1>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBell className="text-red-500 text-xl" />
              <span className="font-medium">Push Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors {
                notificationsEnabled ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform {
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-md p-4 {
                !notification.read ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="pt-1">
                  {notification.type === 'order' && (
                    <FaBell className="text-red-500 text-xl" />
                  )}
                  {notification.type === 'payment' && (
                    <FaMoneyBillWave className="text-green-500 text-xl" />
                  )}
                  {notification.type === 'system' && (
                    <FaTools className="text-blue-500 text-xl" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">{notification.time}</span>
                    {!notification.read && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaBell className="text-red-500" />
                <span>New Order Alerts</span>
              </div>
              <FaCheckCircle className="text-green-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaMoneyBillWave className="text-green-500" />
                <span>Payment Received Alerts</span>
              </div>
              <FaCheckCircle className="text-green-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaTools className="text-blue-500" />
                <span>System Updates</span>
              </div>
              <FaCheckCircle className="text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAlerts;