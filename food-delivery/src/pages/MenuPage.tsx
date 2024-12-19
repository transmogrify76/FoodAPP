import React, { useState } from 'react';

const MenuPage: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);

  // Mock data for Indian menu items
  const menuItems = [
    { id: 1, name: 'Butter Chicken', price: 15.99 },
    { id: 2, name: 'Paneer Tikka', price: 12.99 },
    { id: 3, name: 'Biryani', price: 13.99 },
    { id: 4, name: 'Aloo Gobi', price: 9.99 },
    { id: 5, name: 'Masala Dosa', price: 8.99 },
    { id: 6, name: 'Chole Bhature', price: 10.99 },
    { id: 7, name: 'Tandoori Chicken', price: 14.99 },
    { id: 8, name: 'Samosa', price: 4.99 },
  ];

  const addToCart = (item: any) => {
    setCart([...cart, item]);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6"> Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold text-red-600">{item.name}</h3>
            <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
            <button
              onClick={() => addToCart(item)}
              className="mt-4 w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
