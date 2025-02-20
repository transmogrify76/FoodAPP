import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface OrderItem {
  item_total: number;
  menu: {
    foodtype: string;
    menudescription: string;
    menuname: string;
    menuprice: string;
    menutype: string;
  };
  menuid: string;
  quantity: number;
}

interface Order {
  uid: string;
  created_at: string;
  items: OrderItem[];
  orderstatus: string;
  preptime: string | null;
  restaurant: {
    address: string;
    cuisin_type: string;
    location: string;
    resturantname: string;
  };
  restaurantid: string;
  tempstatus: string;
  totalprice: number;
  userid: string;
}

interface DecodedToken {
  userid: string;
}

const OrderTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
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
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setOrders(response.data.order_list);
        } catch (error) {
          console.error('Error fetching order history:', error);
        }
      };

      fetchOrders();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-700';
      case 'accepted':
        return 'bg-green-200 text-green-700';
      case 'inprogress':
        return 'bg-blue-200 text-blue-700';
      case 'dispatched':
        return 'bg-purple-200 text-purple-700';
      case 'delivered':
        return 'bg-green-200 text-green-700';
      case 'rejected':
        return 'bg-red-200 text-red-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order Tracking</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Order History</h3>
        <ul>
          {orders.map((order) => (
            <li
              key={order.uid}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 bg-gray-100 rounded-md shadow"
            >
              <div className="w-full md:w-3/4">
                <h4 className="font-semibold text-lg">
                  {order.restaurant?.resturantname || 'Unknown Restaurant'}
                </h4>
                <p className="text-gray-600">
                  Location: {order.restaurant?.location || 'N/A'}
                </p>
                <div className="mt-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="border-b border-gray-300 pb-1 mb-1">
                      <p className="text-gray-700">
                        <strong>Menu:</strong> {item.menu.menuname}
                      </p>
                      <p className="text-gray-600">
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                      <p className="text-gray-600">
                        <strong>Item Total:</strong> ₹{item.item_total}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-2">
                  <strong>Total Price:</strong> ₹{order.totalprice}
                </p>
                {order.preptime && (
                  <p className="text-gray-600">
                    <strong>Prep Time:</strong> {order.preptime}
                  </p>
                )}
                <p className="text-gray-600">
                  <strong>Order Placed:</strong> {formatDate(order.created_at)}
                </p>
              </div>
              <span
                className={`text-sm font-bold p-2 rounded mt-2 md:mt-0 ${getStatusColor(
                  order.tempstatus || order.orderstatus
                )}`}
              >
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
