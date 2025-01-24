import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Install this library using `npm install jwt-decode` or `yarn add jwt-decode`

interface Order {
  uid: string;
  productid: string;
  quantity: number;
  userid: string;
  restaurantid: string;
  totalprice: number;
  created_at: string;
}

interface DecodedToken {
  userid: string; // Update the key based on your token structure
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Retrieve the token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated');
        }

        // Decode the token to extract the user ID
        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userid;

        // Create FormData and append the user ID
        const formData = new FormData();
        formData.append('userid', userId);

        // Make the API request with FormData
        const response = await fetch('http://localhost:5000/order/userbasedhistory', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }

        const data = await response.json();
        setOrders(data.order_list);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order History</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul>
          {orders.map((order) => (
            <li key={order.uid} className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</h3>
                <p className="text-gray-600">
                  Product ID: {order.productid}, Quantity: {order.quantity}
                </p>
              </div>
              <span className="text-xl text-red-600">₹{Number(order.totalprice).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
