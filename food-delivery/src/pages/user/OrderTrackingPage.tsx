import React, { useEffect, useState } from 'react';

interface Order {
  uid: string;
  product: string;
  status: string;
}

const OrderTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    { uid: '1', product: 'Pizza', status: 'Order Placed' },
    { uid: '2', product: 'Burger', status: 'Order Placed' },
    { uid: '3', product: 'Pasta', status: 'Order Placed' },
  ]);

  useEffect(() => {
    // Simulate status updates for each order
    const updateOrderStatus = () => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          let newStatus = order.status;
          if (order.status === 'Order Placed') newStatus = 'Order Confirmed';
          else if (order.status === 'Order Confirmed') newStatus = 'Order Shipped';
          else if (order.status === 'Order Shipped') newStatus = 'Out for Delivery';
          else if (order.status === 'Out for Delivery') newStatus = 'Delivered';
          return { ...order, status: newStatus };
        })
      );
    };

    // Simulate status update every 5 seconds
    const interval = setInterval(updateOrderStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order Tracking</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Order Status</h3>
        <ul>
          {orders.map((order) => (
            <li key={order.uid} className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-md shadow">
              <div>
                <h4 className="font-semibold text-lg">Order: {order.product}</h4>
                <p className="text-gray-600">Order ID: {order.uid}</p>
              </div>
              <span className={`text-sm font-bold p-2 rounded ${
                order.status === 'Delivered'
                  ? 'bg-green-200 text-green-700'
                  : 'bg-yellow-200 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
