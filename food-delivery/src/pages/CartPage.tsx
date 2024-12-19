import React, { useState } from 'react';

const CartPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [cart, setCart] = useState<any[]>([
    { id: 1, name: 'Butter Chicken', price: 299.99 },
    { id: 2, name: 'Biryani', price: 199.99 },
    { id: 3, name: 'Paneer Tikka', price: 249.99 },
    { id: 4, name: 'Masala Dosa', price: 79.99 },
  ]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handlePayment = () => {
    // Payment logic (API Integration)
    console.log('Payment processed');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Your Cart</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Order Summary</h3>
        <ul className="space-y-2">
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>₹{item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between">
          <span className="font-bold text-lg">Total:</span>
          <span className="text-xl text-red-600">₹{total.toFixed(2)}</span>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your address"
            required
          />
        </div>
        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-all"
        >
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default CartPage;
