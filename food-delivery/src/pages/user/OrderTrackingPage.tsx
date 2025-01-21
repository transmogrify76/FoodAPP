import React, { useEffect, useState } from 'react';

const OrderTrackingPage: React.FC = () => {
  const [orderStatus, setOrderStatus] = useState('Order Placed');

  useEffect(() => {
    // Example WebSocket or Firebase setup for order status updates
    const updateStatus = () => {
      setOrderStatus('Order Shipped');
    };

    // Simulate status update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order Tracking</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Current Status:</h3>
        <p className="text-lg text-gray-600">{orderStatus}</p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
