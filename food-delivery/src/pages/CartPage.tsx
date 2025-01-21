import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Define the type for the cart item
interface CartItem {
  menuname: string;
  menudescription: string;
  menuprice: number;
  quantity: number; // Include the quantity field
  menuid: string; // Adding menuid for API calls
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  const [cart, setCart] = useState<CartItem[]>(state?.cart || []);

  // Function to update the cart item quantity (increment)
  const handleIncreaseQuantity = async (item: CartItem) => {
    try {
      const response = await axios.post('http://localhost:5000/cart/incquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: 'user123',  // Assuming you have the user ID from context or authentication
        restaurantid: 'restaurant123', // Similarly, assuming restaurant ID is available
      }));

      if (response.status === 200) {
        setCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem.menuid === item.menuid
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
      alert('Failed to increase quantity.');
    }
  };

  // Function to update the cart item quantity (decrement)
  const handleDecreaseQuantity = async (item: CartItem) => {
    try {
      const response = await axios.post('http://localhost:5000/cart/decquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: 'user123',  // Assuming user ID is available
      }));

      if (response.status === 200) {
        // Decrement the quantity only if greater than 1, otherwise remove from cart
        if (item.quantity > 1) {
          setCart(prevCart =>
            prevCart.map(cartItem =>
              cartItem.menuid === item.menuid
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
          );
        } else {
          setCart(prevCart => prevCart.filter(cartItem => cartItem.menuid !== item.menuid));
        }
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      alert('Failed to decrease quantity.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 w-full p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6 pt-24 pb-16"> {/* Added padding-top and bottom */}
        {cart.length === 0 ? (
          <p className="text-center text-lg">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-500">{item.menuname}</h3>
                <p className="text-gray-600 mt-2">{item.menudescription}</p>
                <p className="text-gray-500 mt-1">Price: ${item.menuprice}</p>
                <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
                
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleIncreaseQuantity(item)}
                    className="bg-gradient-to-r from-green-500 to-lime-500 text-white py-1 px-3 rounded-lg hover:bg-gradient-to-l transition-all"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDecreaseQuantity(item)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-1 px-3 rounded-lg hover:bg-gradient-to-l transition-all"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Cart Items:</h2>
          <ul>
            {cart.map((cartItem, index) => (
              <li key={index} className="flex justify-between mb-2">
                <span>{cartItem.menuname}</span>
                <span>Quantity: {cartItem.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fixed "Complete Purchase" button */}
      <div className="fixed bottom-0 left-0 w-full p-2 bg-white shadow-lg z-10">
        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gradient-to-l transition-all">
          Complete Purchase
        </button>
      </div>
    </div>
  );
};

export default CartPage;
