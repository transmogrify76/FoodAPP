import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Define types
interface DecodedToken {
  raiderid: string;
  [key: string]: any;
}

interface MenuDetail {
  item_total: number;
  menudiscountprice: number;
  menuid: string;
  menuname: string;
  quantity: number;
}

interface Order {
  orderid: string;
  address: string;
  created_at: string;
  menu_details: MenuDetail[];
  orderstatus: string;
  phone_number: string;
  raideracceptstatus: string;
  raiderarrivaltime: string;
  raideremail: string;
  raiderfullname: string;
  raiderid: string;
  totalprice: number;
  useremail: string;
  userfullname: string;
  userid: string;
}

interface OrdersState {
  newOrders: Order[];
  ongoingOrders: Order[];
  completedOrders: Order[];
}

const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState<'newOrders' | 'ongoingOrders' | 'completedOrders'>('newOrders');
  const [orders, setOrders] = useState<OrdersState>({
    newOrders: [],
    ongoingOrders: [],
    completedOrders: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from backend
  const fetchOrders = async () => {
    const raiderToken = localStorage.getItem('raider_token');
    if (!raiderToken) {
      console.error('No raider token found');
      return;
    }

    const decodedToken: DecodedToken = jwtDecode(raiderToken);
    const raiderid = decodedToken.raiderid;

    try {
      const response = await fetch('http://127.0.0.1:5000/ops/getorderbyraiderid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `raiderid=${raiderid}`,
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      
      setOrders({
        newOrders: data.orders.filter((order: Order) => order.raideracceptstatus === ''),
        ongoingOrders: data.orders.filter((order: Order) => order.raideracceptstatus === 'accepted'),
        completedOrders: data.orders.filter((order: Order) => order.raideracceptstatus === 'delivered')
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders. Please try again.');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderid: string, raideracceptstatus: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/order/updateraiderorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `raiderorderid=${orderid}&raideracceptstatus=${raideracceptstatus}`,
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      const updatedOrder = await response.json();

      // Optimistic UI update
      setOrders(prev => ({
        newOrders: prev.newOrders.filter(order => order.orderid !== orderid),
        ongoingOrders: 
          raideracceptstatus === 'accepted' 
            ? [...prev.ongoingOrders, updatedOrder] 
            : prev.ongoingOrders.filter(order => order.orderid !== orderid),
        completedOrders: 
          raideracceptstatus === 'delivered' 
            ? [...prev.completedOrders, updatedOrder] 
            : prev.completedOrders
      }));

      // Refresh data from server
      fetchOrders();

    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {['newOrders', 'ongoingOrders', 'completedOrders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'newOrders' | 'ongoingOrders' | 'completedOrders')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {tab === 'newOrders' ? 'New' : tab === 'ongoingOrders' ? 'Ongoing' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* New Orders Section */}
          {activeTab === 'newOrders' && orders.newOrders.map(order => (
            <div key={order.orderid} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.userfullname}</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                  <p className="text-sm text-gray-600">Phone: {order.phone_number}</p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-800">Order Details:</p>
                    <ul className="list-disc list-inside">
                      {order.menu_details.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.menuname} (Qty: {item.quantity}) - ₹{item.item_total}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Total: ₹{order.totalprice}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.orderid, 'accepted')}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    <FaCheckCircle className="text-xl" />
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.orderid, 'rejected')}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Ongoing Orders Section */}
          {activeTab === 'ongoingOrders' && orders.ongoingOrders.map(order => (
            <div key={order.orderid} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.userfullname}</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                  <p className="text-sm text-gray-600">Phone: {order.phone_number}</p>
                  <p className="text-sm text-gray-600">Arrival Time: {order.raiderarrivaltime}</p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-800">Order Details:</p>
                    <ul className="list-disc list-inside">
                      {order.menu_details.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.menuname} (Qty: {item.quantity}) - ₹{item.item_total}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Total: ₹{order.totalprice}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.orderid, 'delivered')}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Completed Orders Section */}
          {activeTab === 'completedOrders' && orders.completedOrders.map(order => (
            <div key={order.orderid} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{order.userfullname}</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                  <p className="text-sm text-gray-600">Phone: {order.phone_number}</p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-800">Order Details:</p>
                    <ul className="list-disc list-inside">
                      {order.menu_details.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.menuname} (Qty: {item.quantity}) - ₹{item.item_total}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Total: ₹{order.totalprice}</p>
                </div>
                <span className="text-green-600 font-bold">Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;