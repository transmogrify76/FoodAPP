import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  FaShoppingBag,
  FaHistory,
  FaHome,
  FaUserAlt,
  FaShoppingCart,
  FaArrowLeft,
  FaClock,
  FaMoneyBillAlt,
  FaUtensils,
  FaMapMarkerAlt,
  FaCreditCard
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ---------- Interfaces matching the actual API response ----------
interface Restaurant {
  address: string | null;
  location: string | null;
  restaurant_name: string;
  restaurant_type: string | null;
}

interface User {
  username: string;
  user_phone_no: string | null;
  useraddress: string | null;
}

// Raw order line item from the API
interface ApiOrderItem {
  uid: string;
  master_order_id: string;
  menuid: string;
  quantity: number;
  base_price: number;
  final_price: number;
  orderstatus: string;
  payment_mode: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  userid: string;
  restaurantid: string;
  menu: string | null;          // item name, can be null
  restaurant: Restaurant;
  user?: User;
}

// Grouped order (one logical order containing one or more items)
interface GroupedOrder {
  master_order_id: string;
  orderstatus: string;
  payment_mode: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  restaurant: Restaurant;
  items: ApiOrderItem[];
  total_price: number;
}

interface DecodedToken {
  userid: string;
}

const OrderTrackingPage: React.FC = () => {
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login.');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.userid;
      fetchOrders(userId);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Failed to authenticate. Please login again.');
    }
  }, []);

  const fetchOrders = async (userId: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('userid', userId);

      const response = await axios.post(
        'http://192.168.0.103:5020/order/orderhistory',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const rawOrders: ApiOrderItem[] = response.data.order_list || [];
      const grouped = groupOrders(rawOrders);
      setGroupedOrders(grouped);
      setError(null);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: group raw API items by master_order_id
  const groupOrders = (items: ApiOrderItem[]): GroupedOrder[] => {
    const groups = new Map<string, ApiOrderItem[]>();

    items.forEach((item) => {
      const key = item.master_order_id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    const result: GroupedOrder[] = [];
    groups.forEach((groupItems, masterId) => {
      const first = groupItems[0];
      const total = groupItems.reduce((sum, item) => sum + item.final_price, 0);

      result.push({
        master_order_id: masterId,
        orderstatus: first.orderstatus,
        payment_mode: first.payment_mode,
        payment_status: first.payment_status,
        created_at: first.created_at,
        updated_at: first.updated_at,
        restaurant: first.restaurant,
        items: groupItems,
        total_price: total,
      });
    });

    // Sort by newest first
    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const lower = status.toLowerCase();
    switch (lower) {
      case 'pending':
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h3 className="text-lg font-semibold text-red-500 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-orange-500 text-white">
          <div className="flex items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="Logo"
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-lg font-bold">Foodie Heaven</h3>
          </div>
          <button onClick={toggleSidebar} className="text-xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUserAlt className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/track-order')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaShoppingBag className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order Tracking</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Main Content */}
      <div className="pb-20">
        {/* Header - Back button added */}
        <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="text-xl">
              <FaArrowLeft />
            </button>
            <div className="flex items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="Logo"
                className="w-6 h-6 mr-2"
              />
              <h1 className="text-lg font-bold">Order Tracking</h1>
            </div>
            <div className="w-6"></div> {/* For balance */}
          </div>
        </div>

        {/* Order List */}
        <div className="p-4">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Your Orders</h2>

          {groupedOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {groupedOrders.map((order) => (
                <div
                  key={order.master_order_id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaClock className="text-orange-400" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                          order.orderstatus
                        )}`}
                      >
                        {order.orderstatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-4">
                    {order.items.map((item) => {
                      const unitPrice =
                        item.quantity > 0 ? item.final_price / item.quantity : 0;
                      return (
                        <div
                          key={item.uid}
                          className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.menu || 'Item not available'}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              ₹{unitPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{item.final_price.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FaUtensils className="text-orange-400" />
                        <span className="text-sm text-gray-700">
                          {order.restaurant?.restaurant_name ||
                            'Restaurant not available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaMoneyBillAlt className="text-orange-400" />
                        <span className="font-bold text-gray-900">
                          ₹{order.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <FaCreditCard className="text-orange-400" />
                        <span>
                          {order.payment_mode} • {order.payment_status}
                        </span>
                      </div>
                      {order.restaurant?.location && (
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-orange-400" />
                          <span>{order.restaurant.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button
          onClick={() => navigate('/home')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <FaArrowLeft className="text-lg" />
          <span className="text-xs mt-1">Back</span>
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button
          onClick={() => navigate('/track-order')}
          className="text-orange-500 flex flex-col items-center"
        >
          <FaHistory className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;