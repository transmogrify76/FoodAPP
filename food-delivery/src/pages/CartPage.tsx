import React from 'react';
import { useLocation } from 'react-router-dom';

// Define the type for the cart item
interface CartItem {
  menuname: string;
  menudescription: string;
  menuprice: number;
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  // Explicitly type the cart array
  const cart: CartItem[] = state?.cart || [];

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      <div className="p-6">
        {cart.length === 0 ? (
          <p className="text-center text-lg">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-500">{item.menuname}</h3>
                <p className="text-gray-600 mt-2">{item.menudescription}</p>
                <p className="text-gray-500 mt-1">Price: ${item.menuprice}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white shadow-lg">
        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gradient-to-l transition-all">
          Complete Purchase
        </button>
      </div>
    </div>
  );
};

export default CartPage;
