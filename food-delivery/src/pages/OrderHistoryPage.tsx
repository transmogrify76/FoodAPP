import React from 'react';

const OrderHistoryPage: React.FC = () => {
  // Mock order history data
  const orders = [
    { id: 1, items: ['Pizza', 'Sushi'], date: '2024-12-15', total: 29.99 },
    { id: 2, items: ['Tacos', 'Cheeseburger'], date: '2024-12-10', total: 22.99 },
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
              <span className="text-xl text-red-600">{order.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
