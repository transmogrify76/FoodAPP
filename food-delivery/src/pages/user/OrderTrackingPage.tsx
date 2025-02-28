import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { IoRestaurant, IoLocation, IoCalendar, IoPricetag } from 'react-icons/io5';
import axios from 'axios';

interface Menu {
  foodtype: string;
  menudescription: string;
  menuname: string;
  menuprice: string;
  menutype: string;
}

interface Restaurant {
  address: string;
  cuisin_type: string;
  location: string;
  resturantname: string;
}

interface Order {
  items: any;
  uid: string;
  productid: string;
  quantity: number;
  userid: string;
  restaurantid: string;
  totalprice: number;
  created_at: string;
  orderstatus: string;
  menu: Menu | null;
  restaurant: Restaurant | null;
  preptime?: string | null;
  tempstatus?: string;
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
            'http://127.0.0.1:5000/order/orderhistory',
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
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-xl font-bold">Order Tracking</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-20">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Order List</h3>
          <ul>
            {orders.map((order) => (
              <li
                key={order.uid}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-full md:w-3/4">
                  <h4 className="font-semibold text-lg">
                    {order.restaurant?.resturantname || 'Unknown Restaurant'}
                  </h4>
                  <p className="text-gray-600">
                    Location: {order.restaurant?.location || 'N/A'}
                  </p>
                  <div className="mt-2">
                    {order.items && order.items.map((item: { menu: { menuname: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; quantity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; item_total: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
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
    </div>
  );
};

export default OrderTrackingPage;
