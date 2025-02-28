import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { IoRestaurant, IoLocation, IoCalendar, IoPricetag } from 'react-icons/io5';

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
          throw new Error('User is not authenticated');
        }

        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userid;

        const formData = new FormData();
        formData.append('userid', userId);

        const response = await fetch('http://127.0.0.1:5000/order/orderhistory', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }

        const data = await response.json();
        setOrders(data.order_list);
        setFilteredOrders(data.order_list); 
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-xl font-bold">Order History</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-20">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Your  History</h1>
        
        <div className="flex justify-center mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Orders</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.uid}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <IoCalendar className="text-gray-500" />
                    <span className="text-lg font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold py-1 px-3 rounded-full ${
                      order.orderstatus.toLowerCase() === 'completed'
                        ? 'bg-green-500 text-white'
                        : order.orderstatus.toLowerCase() === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {order.orderstatus}
                  </span>
                </div>

                <div className="mt-3 flex justify-between">
                  <div className="text-black-900 bold-xl">
                    <p className="font-medium">Item : {order.items[0].menu.menuname}</p>
                    <p>Quantity: {order.items[0].quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold">
                      ₹{Number(order.totalprice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t p-4">
                {order.menu ? (
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-800">
                      {order.menu.menuname}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {order.menu.menudescription}
                    </p>
                    <div className="flex items-center space-x-3">
                      <IoPricetag className="text-gray-500" />
                      <p className="font-medium text-gray-600">
                        Price: ₹{order.menu.menuprice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Menu details not available</p>
                )}

                {order.restaurant ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <IoRestaurant className="text-gray-500" />
                      <p className="font-medium text-gray-700">
                        {order.restaurant.resturantname}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoLocation className="text-gray-500" />
                      <p className="text-sm text-gray-600">
                        {order.restaurant.location}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.restaurant.address}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Restaurant details not available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
