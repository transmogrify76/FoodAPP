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

        const response = await fetch('http://localhost:5000/order/orderhistory', {
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
    // Filter orders based on the selected status
    if (statusFilter === 'All') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.orderstatus === statusFilter);
      setFilteredOrders(filtered);
    }
  }, [statusFilter, orders]);

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center text-red-600 mb-8">Your Order History</h1>
      
      {/* Dropdown Filter for Status */}
      <div className="flex justify-center mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded border border-gray-300"
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
            className="bg-white rounded-lg shadow-lg overflow-hidden"
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
                  className={`text-sm font-semibold py-1 px-2 rounded-full ${
                    order.orderstatus === 'Completed'
                      ? 'bg-green-500 text-white'
                      : order.orderstatus === 'Pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {order.orderstatus}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <div className="text-gray-600">
                  <p className="font-medium">Product ID: {order.productid}</p>
                  <p>Quantity: {order.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">₹{Number(order.totalprice).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              {/* Menu Details */}
              {order.menu ? (
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-800">{order.menu.menuname}</h4>
                  <p className="text-sm text-gray-500">{order.menu.menudescription}</p>
                  <div className="flex items-center space-x-3">
                    <IoPricetag className="text-gray-500" />
                    <p className="font-medium text-gray-600">Price: ₹{order.menu.menuprice}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Menu details not available</p>
              )}

              {/* Restaurant Details */}
              {order.restaurant ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <IoRestaurant className="text-gray-500" />
                    <p className="font-medium text-gray-700">{order.restaurant.resturantname}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoLocation className="text-gray-500" />
                    <p className="text-sm text-gray-600">{order.restaurant.location}</p>
                  </div>
                  <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                </div>
              ) : (
                <p className="text-gray-500">Restaurant details not available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
