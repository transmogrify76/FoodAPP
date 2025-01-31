import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const RestaurantOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [restaurantId, setRestaurantId] = useState<string>(''); 
  const [ownerId, setOwnerId] = useState<string>(''); 

  useEffect(() => {
    
    const storedRestaurantToken = localStorage.getItem('restaurant_token');
    if (storedRestaurantToken) {
      try {
        
        const decodedToken: any = jwtDecode(storedRestaurantToken);
        setOwnerId(decodedToken.owenerid); 
        fetchRestaurantId(decodedToken.owenerid); 
      } catch (error) {
        console.error('Error decoding token:', error);
        setMessage('Invalid token.');
      }
    } else {
      setMessage('Restaurant token not found in local storage.');
    }
  }, []);

  
  const fetchRestaurantId = async (ownerId: string) => {
    try {
      const formData = new FormData();
      formData.append('ownerid', ownerId); 

      const response = await fetch('http://localhost:5000/owenerresturentfetch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch restaurant ID');
        return;
      }

      const data = await response.json();
      const restaurantIdFromResponse = data.data[0]?.restaurantid; 
      if (restaurantIdFromResponse) {
        setRestaurantId(restaurantIdFromResponse); 
      } else {
        setMessage('No restaurant found for this owner.');
      }
    } catch (error) {
      console.error('Error fetching restaurant ID:', error);
      setMessage('Error fetching restaurant data.');
    }
  };

  useEffect(() => {
    if (!restaurantId) return; 
    
    const fetchOrders = async () => {
      try {
        const formData = new FormData();
        formData.append('restaurantid', restaurantId); 

        const response = await axios.post('http://localhost:5000/order/resorderhistory', formData);
        console.log('Orders fetched:', response.data)
        setOrders(response.data.order_list);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log('API Error:', error.response);
          setMessage(error.response?.data?.error || 'Error fetching orders!');
        } else {
          console.error('Unexpected Error:', error);
          setMessage('Unexpected error occurred!');
        }
      }
    };

    fetchOrders();
  }, [restaurantId]);

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      const formData = new FormData();
      formData.append('orderid', orderId);
      formData.append('updateorderstatus', action === 'accept' ? 'accepted' : 'rejected');

     
      const response = await axios.post('http://localhost:5000/ops/updateorder', formData);

      if (response.data.message === 'Data update success') {
        setMessage(`Order #${orderId} has been ${action}ed.`);
        setOrders(orders.map((order) =>
          order.uid === orderId ? { ...order, orderstatus: action === 'accept' ? 'accepted' : 'rejected' } : order
        )); 
      } else {
        setMessage('Failed to update order status.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Error updating order status.');
    }
  };

  const handleTempStatusChange = async (orderId: string, tempStatus: string) => {
    try {
      const formData = new FormData();
      formData.append('orderid', orderId);
      formData.append('tempstatus', tempStatus);
      formData.append('restaurantid', restaurantId);
      formData.append('userid', ownerId);

      
      const response = await axios.post('http://localhost:5000/tmporderstatus', formData);

      if (response.status === 200) {
        setMessage(`Order #${orderId} status updated to '${tempStatus}'.`);
        setOrders(orders.map((order) =>
          order.uid === orderId ? { ...order, status: tempStatus } : order
        ));
      } else {
        setMessage('Failed to update temporary order status.');
      }
    } catch (error) {
      console.error('Error updating temporary order status:', error);
      setMessage('Error updating temporary order status.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Restaurant Orders</h1>

        {message && <p className="text-red-500 text-center mb-4">{message}</p>}

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.uid} className="bg-white shadow-md rounded-lg p-4 border-l-4 border-red-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaShoppingCart className="text-red-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-700">{order.menuname}</h2>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600"><strong>Description:</strong> {order.menudescription}</p>
                  <p className="text-sm text-gray-600"><strong>Quantity:</strong> {order.quantity}</p>
                  <p className="text-sm text-gray-600"><strong>Total Price:</strong> ₹{order.totalprice}</p>
                  <p className="text-sm text-gray-600"><strong>Order Status:</strong> {order.orderstatus}</p>
                  <p className="text-sm text-gray-600"><strong>Customer:</strong> {order.username}</p>
                  <p className="text-sm text-gray-600"><strong>Contact:</strong> {order.user_phone_no}</p>
                  <p className="text-sm text-gray-600"><strong>Address:</strong> {order.useraddress}</p>
                  <p className="text-sm text-gray-600"><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>

                {/* Accept and Reject Buttons */}
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleOrderAction(order.uid, 'accept')}
                    className={`bg-green-500 text-white py-1 px-3 rounded-lg text-sm ${order.orderstatus !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={order.orderstatus !== 'pending'}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOrderAction(order.uid, 'reject')}
                    className={`bg-red-500 text-white py-1 px-3 rounded-lg text-sm ${order.orderstatus !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={order.orderstatus !== 'pending'}
                  >
                    Reject
                  </button>
                </div>

                {/* Temporary Status Change Buttons */}
                {order.orderstatus === 'accepted' && (
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => handleTempStatusChange(order.uid, 'startedpreparing')}
                      className="bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Started Preparing
                    </button>
                    <button
                      onClick={() => handleTempStatusChange(order.uid, 'inprogress')}
                      className="bg-yellow-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-yellow-600"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleTempStatusChange(order.uid, 'dispatch')}
                      className="bg-purple-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-purple-600"
                    >
                      Dispatch
                    </button>
                  </div>
                )}
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