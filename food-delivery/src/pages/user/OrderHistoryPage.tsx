import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiLoader,
  FiShoppingBag,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';

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
}

interface DecodedToken {
  userid: string;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

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

        const response = await fetch('https://backend.foodapp.transev.site/order/orderhistory', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }

        const data = await response.json();
        setOrders(data.order_list || []);
        setFilteredOrders(data.order_list || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) => order.orderstatus.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
  }, [statusFilter, orders]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FiXCircle className="text-red-500" />;
      case 'pending':
        return <FiLoader className="text-yellow-500 animate-spin" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <FiXCircle className="text-red-500 text-4xl mx-auto mb-4" />
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Order History</h1>
      </div>

      {/* Filter */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Your Orders</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="All">All Orders</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <FiShoppingBag className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No orders found</h3>
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
                key={order.uid}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.orderstatus)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.orderstatus)}
                        <span>{order.orderstatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.menu?.menuname || 'Item not available'}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.menu?.menudescription || 'No description available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{Number(item.menu?.menuprice || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FaUtensils className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {order.restaurant?.resturantname || 'Restaurant not available'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <FiDollarSign className="text-gray-500" /> */}
                      <span className="font-bold text-gray-900">
                        ₹{Number(order.totalprice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {order.restaurant?.location && (
                    <div className="flex items-center mt-2 space-x-2 text-sm text-gray-500">
                      <FiMapPin className="flex-shrink-0" />
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
  );
};

export default OrderHistoryPage;