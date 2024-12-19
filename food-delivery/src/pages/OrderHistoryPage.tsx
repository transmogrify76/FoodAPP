import React from 'react';

const OrderHistoryPage: React.FC = () => {
  // Mock order history data with Indian dishes and prices
  const orders = [
    { id: 1, items: ['Butter Chicken', 'Naan'], date: '2024-12-15', total: 24.99 },
    { id: 2, items: ['Biryani', 'Raita'], date: '2024-12-10', total: 18.99 },
    { id: 3, items: ['Paneer Tikka', 'Masala Dosa'], date: '2024-12-05', total: 21.99 },
    { id: 4, items: ['Tandoori Chicken', 'Samosa'], date: '2024-11-30', total: 16.99 },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Order History</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold">{order.date}</h3>
                <p className="text-gray-600">{order.items.join(', ')}</p>
              </div>
              <span className="text-xl text-red-600">₹{order.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
