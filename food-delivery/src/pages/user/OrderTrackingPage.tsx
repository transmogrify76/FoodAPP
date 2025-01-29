import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface Order {
  uid: string;
  productid: string;
  quantity: number;
  userid: string;
  restaurantid: string;
  totalprice: number;
  orderstatus: string;
  tempstatus: string;  // To track the order's progress
  created_at: string;
  restaurant?: {
    resturantname: string;
    location: string;
    cuisin_type: string;
    address: string;
  };
}

interface DecodedToken {
  userid: string;
}

const OrderTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from local storage
    const token = localStorage.getItem('token'); // Adjust if you store it differently
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded.userid);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        try {
          const response = await axios.post(
            'http://localhost:5000/order/orderhistory',
            { userid: userId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } // Send token if required
          );
          setOrders(response.data.order_list);
        } catch (error) {
          console.error('Error fetching order history:', error);
        }
      };

      fetchOrders();
    }
  }, [userId]);

  // Function to determine order status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'started preparing':
        return 'bg-yellow-200 text-yellow-700';
      case 'dispatched':
        return 'bg-blue-200 text-blue-700';
      case 'delivered':
        return 'bg-green-200 text-green-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order Tracking</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Order Status</h3>
        <ul>
          {orders.map((order) => (
            <li key={order.uid} className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-md shadow">
              <div>
                <h4 className="font-semibold text-lg">{order.restaurant?.resturantname || 'Unknown Restaurant'}</h4>
                <p className="text-gray-600">Order ID: {order.uid}</p>
                <p className="text-gray-600">Total Price: ₹{order.totalprice}</p>
              </div>
              <span className={`text-sm font-bold p-2 rounded ${getStatusColor(order.tempstatus || order.orderstatus)}`}>
                {order.tempstatus || order.orderstatus}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
