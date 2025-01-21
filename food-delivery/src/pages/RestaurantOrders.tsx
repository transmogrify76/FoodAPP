import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode'; // Correct import

const RestaurantOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [restaurantId, setRestaurantId] = useState<string>(''); // To store restaurant ID

  useEffect(() => {
    // Fetch the restaurant token from local storage and decode it
    const storedRestaurantToken = localStorage.getItem('restaurant_token');
    if (storedRestaurantToken) {
      try {
        // Decode the JWT token to extract the restaurant ID
        const decodedToken: any = jwtDecode(storedRestaurantToken);
        console.log(decodedToken); // Log to check the structure of the decoded token
        setRestaurantId(decodedToken.restaurantId); // Assuming restaurantId exists in the token
      } catch (error) {
        console.error('Error decoding token:', error);
        setMessage('Invalid token.');
      }
    } else {
      setMessage('Restaurant token not found in local storage.');
    }
  }, []);

  useEffect(() => {
    if (!restaurantId) return; // Don't fetch if restaurantId is empty

    const fetchOrders = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:5000/order/resorderhistory', { resturentid: restaurantId });
        console.log('Orders fetched:', response.data); // Log response data
        setOrders(response.data.order_list);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log('API Error:', error.response); // Log API error response
          setMessage(error.response?.data?.error || 'Error fetching orders!');
        } else {
          console.error('Unexpected Error:', error);
          setMessage('Unexpected error occurred!');
        }
      }
    };

    fetchOrders();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-300 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-center text-yellow-600 mb-6">Restaurant Orders</h1>

        {message && <p className="text-red-500 text-center mb-4">{message}</p>}

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.uid} className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaShoppingCart className="text-yellow-500 mr-2" />
                    <h2 className="text-xl font-bold text-gray-700">Order #{order.uid}</h2>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="text-yellow-500 mr-2" />
                    <p className="text-sm text-gray-600">{order.userid}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaMapMarkerAlt className="text-yellow-500 mr-2" />
                    <p>Address: {order.restaurantid}</p>
                  </div>
                  <p className="text-sm text-gray-600"><strong>Items:</strong> {order.productid}</p>
                  <p className="text-sm text-gray-600"><strong>Quantity:</strong> {order.quantity}</p>
                  <p className="text-sm text-gray-600"><strong>Total Price:</strong> ${order.totalprice}</p>
                  <p className="text-sm text-gray-600"><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No orders available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;
