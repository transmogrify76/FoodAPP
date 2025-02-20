import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaMoneyBillWave, 
  FaInfoCircle, 
  FaRoute,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OrderDetailsNavigation = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const orderDetails = {
    restaurant: {
      name: "La Piazza Restaurant",
      address: "Basana Apartment",
      pickupTime: "7:00 PM - 7:15 PM"
    },
    customer: {
      name: "Chitradeep Ghosh",
      address: "Banasa Apartment",
      phone: "+91 8084281810"
    },
    payment: {
      method: "COD",
      amount: "24.50"
    },
    instructions: "Gate code: 1234. Please ring doorbell twice."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
      {/* Header */}
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Order #12345</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-md p-4">
          {/* Restaurant Section */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaMapMarkerAlt className="text-red-500 mr-2 text-lg" />
              <h2 className="text-lg font-semibold">Pickup Details</h2>
            </div>
            <p className="font-medium">{orderDetails.restaurant.name}</p>
            <p className="text-gray-600 text-sm">{orderDetails.restaurant.address}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <FaClock className="mr-2" />
              <span>{orderDetails.restaurant.pickupTime}</span>
            </div>
          </div>

          {/* Customer Section */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaUser className="text-red-500 mr-2 text-lg" />
              <h2 className="text-lg font-semibold">Customer Details</h2>
            </div>
            <p className="font-medium">{orderDetails.customer.name}</p>
            <p className="text-gray-600 text-sm">{orderDetails.customer.address}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <FaPhone className="mr-2" />
              <span>{orderDetails.customer.phone}</span>
            </div>
          </div>

          {/* Payment & Instructions */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center mb-2">
                <FaMoneyBillWave className="text-red-500 mr-2 text-lg" />
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
              <p className="text-gray-600">
                Method: {orderDetails.payment.method}<br />
                Amount: {orderDetails.payment.amount}
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <FaInfoCircle className="text-red-500 mr-2 text-lg" />
                <h2 className="text-lg font-semibold">Special Instructions</h2>
              </div>
              <p className="text-gray-600">{orderDetails.instructions}</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            {/* Replace with actual map component */}
            <div className="text-center text-gray-500">
              <FaRoute className="text-4xl mb-2" />
              <p>Map integration placeholder</p>
              <p className="text-sm">(Google Maps implementation)</p>
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="p-4 border-t">
            <button 
              onClick={() => setIsNavigating(!isNavigating)}
              className={`w-full py-3 rounded-lg font-medium transition-colors {
                isNavigating 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isNavigating ? 'Stop Navigation' : 'Start Navigation'}
            </button>
            
            {isNavigating && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Distance:</span>
                  <span className="font-medium">2.5 km</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Time:</span>
                  <span className="font-medium">8-10 mins</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-white text-gray-800 p-3 rounded-xl shadow-md hover:bg-gray-50">
            Contact Customer
          </button>
          <button className="bg-red-500 text-white p-3 rounded-xl shadow-md hover:bg-red-600">
            Order Picked Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsNavigation;