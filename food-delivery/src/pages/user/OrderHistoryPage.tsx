import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  FaShoppingBag,
  FaHistory,
  FaHome,
  FaUserAlt,
  FaShoppingCart,
  FaSearch,
  FaClock,
  FaMoneyBillAlt,
  FaUtensils,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

// ---------- Interfaces matching the actual API response ----------
interface Menu {
  _id: string;
  menudiscountpercent: number;
  menudiscountprice: number;
  menuid: string;
  menuitemtype: string;
  menuname: string;
  menuprice: number;
  menutype: string;
  restaurantid: string;
}

interface Restaurant {
  address: string | null;
  location: string | null;
  restaurant_name: string;
  restaurant_type: string | null;
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
  menu: Menu;
  restaurant: Restaurant;
}

// Grouped order (one logical order containing one or more items)
interface GroupedOrder {
  master_order_id: string;
  orderstatus: string;
  created_at: string;
  updated_at: string;
  restaurant: Restaurant;
  items: ApiOrderItem[];
  total_price: number;
}

interface DecodedToken {
  userid: string;
}

const OrderHistoryPage: React.FC = () => {
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to view your order history');
        }

        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userid;

        const formData = new FormData();
        formData.append('userid', userId);

        const response = await fetch(
          'http://192.168.0.103:5020/order/orderhistory',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }

        const data = await response.json();
        const rawOrders: ApiOrderItem[] = data.order_list || [];

        // Group orders by master_order_id
        const grouped = groupOrders(rawOrders);
        setGroupedOrders(grouped);
        setFilteredOrders(grouped);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      // All items in the group share these common fields (take from first item)
      const first = groupItems[0];
      const total = groupItems.reduce((sum, item) => sum + item.final_price, 0);

      result.push({
        master_order_id: masterId,
        orderstatus: first.orderstatus,
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

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredOrders(groupedOrders);
    } else {
      const filtered = groupedOrders.filter(
        (order) =>
          order.orderstatus.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
  }, [statusFilter, groupedOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'inprogress':
      case 'dispatched':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-4xl mx-auto mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Sidebar (unchanged) */}
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
              <FaSearch /> {/* Consider replacing with FaBars for clarity */}
            </button>
            <div className="flex items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="Logo"
                className="w-6 h-6 mr-2"
              />
              <h1 className="text-lg font-bold">Order History</h1>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Your Orders</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="All">All Orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="created">Created</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="dispatched">Dispatched</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <FaShoppingBag className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No orders found
              </h3>
              <p className="text-gray-500 mt-1">
                {statusFilter === 'All'
                  ? "You haven't placed any orders yet"
                  : `No ${statusFilter} orders found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
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
                      <div
                        className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                          order.orderstatus
                        )}`}
                      >
                        {order.orderstatus}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.uid}
                        className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.menu?.menuname || 'Item not available'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{item.menu?.menudiscountprice?.toFixed(2)} each
                          </p>
                          {item.menu?.menuprice &&
                            item.menu.menuprice !==
                              item.menu.menudiscountprice && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{item.menu.menuprice.toFixed(2)}
                              </p>
                            )}
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
                    ))}
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
                    {order.restaurant?.location && (
                      <div className="flex items-center mt-2 space-x-2 text-sm text-gray-500">
                        <FaMapMarkerAlt className="text-orange-400" />
                        <span>{order.restaurant.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
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
          onClick={() => navigate('/history')}
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

export default OrderHistoryPage;