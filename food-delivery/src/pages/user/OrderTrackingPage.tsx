import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingBag, FaHistory, FaHome, FaUserAlt, FaShoppingCart, FaSearch, FaChevronRight, FaMapMarkerAlt, FaClock, FaMoneyBillAlt } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
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

interface OrderItem {
  menu: Menu | null;
  quantity: number;
  item_total: number;
}

interface Order {
  items: OrderItem[];
  uid: string;
  productid: string;
  quantity: number;
  userid: string;
  restaurantid: string;
  totalprice: number;
  created_at: string;
  orderstatus: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded.userid);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Failed to authenticate. Please login again.');
      }
    } else {
      setError('No authentication token found. Please login.');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post(
            'https://backend.foodapp.transev.site/order/orderhistory',
            { userid: userId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setOrders(response.data.order_list || []);
        } catch (error) {
          console.error('Error fetching order history:', error);
          setError('Failed to load order history. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
          <div className="flex justify-between items-center">
            <button onClick={toggleSidebar} className="text-xl">
              <FaSearch />
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

          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.uid}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {order.restaurant?.resturantname || 'Unknown Restaurant'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaMapMarkerAlt className="mr-1 text-orange-400" />
                          <span>{order.restaurant?.location || 'N/A'}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                        order.tempstatus || order.orderstatus
                      )}`}>
                        {order.tempstatus || order.orderstatus}
                      </span>
                    </div>
                    
                    <div className="mb-3 border-b border-gray-100 pb-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{item.quantity}x</span>
                            <span>{item.menu?.menuname || 'Unknown Item'}</span>
                          </div>
                          <span>₹{item.item_total}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center text-gray-500">
                        <FaClock className="mr-1 text-orange-400" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      {order.preptime && (
                        <div className="text-gray-500">
                          <span>Prep time: {order.preptime}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Cuisine: {order.restaurant?.cuisin_type || 'N/A'}
                      </div>
                      <div className="flex items-center font-semibold text-orange-500">
                        <FaMoneyBillAlt className="mr-1" />
                        <span>₹{order.totalprice}</span>
                      </div>
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
          <FaSearch className="text-lg" />
          <span className="text-xs mt-1">Search</span>
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