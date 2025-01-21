import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

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
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Function to calculate the total price of the cart
  const calculateTotalPrice = () => {
    let total = 0;
    cart.forEach(item => {
      total += item.menuprice * item.quantity;
    });
    setTotalPrice(total);
  };

  // Function to decode the user ID from the JWT token stored in localStorage
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode (token);
      return decoded?.userid; // Assuming the user ID is stored as 'userid' in the token
    }
    return null; // If no token is found, return null
  };

  // Function to handle order creation API call
  const createOrder = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('User is not logged in.');
        return;
      }

      // Prepare the data for creating the order
      const orderData = {
        productid: cart.map(item => item.menuid).join(','), // Combine all product IDs
        quantity: cart.map(item => item.quantity).join(','), // Combine all quantities
        userid: userId,  // Use the decoded user ID
        restaurantid: 'restaurant123',  // Assuming restaurant ID is available
        totalprice: totalPrice.toString(),
      };

      const response = await axios.post('http://localhost:5000/order/createorder', new URLSearchParams(orderData));

      if (response.status === 200) {
        // If order created successfully, proceed with Razorpay payment
        initiatePayment(userId);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order.');
    }
  };

  // Function to handle Razorpay payment API call
  const initiatePayment = async (userId: string) => {
    try {
      const paymentData = {
        userid: userId,  // Pass the decoded user ID
        restaurantid: 'restaurant123',  // Assuming restaurant ID is available
        menuid: cart.map(item => item.menuid).join(','),  // Combine all product IDs
        totalprice: totalPrice.toString(),
      };

      const response = await axios.post('http://localhost:5000/createpayment/razorpay', new URLSearchParams(paymentData));

      if (response.status === 200) {
        const paymentDetails = response.data;
        // You can use Razorpay's SDK to redirect to the Razorpay payment page
        const options = {
          key: 'rzp_test_ySKlMUoDlIHU1z', // Replace with your Razorpay key
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          order_id: paymentDetails.id,
          name: 'Restaurant Name',
          description: 'Complete your payment',
          image: 'https://your-logo-url.com',
          handler: function (response: any) {
            alert('Payment successful!');
            // You can also handle the success and call an API to confirm the payment
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
            contact: '1234567890',
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment.');
    }
  };

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
        calculateTotalPrice();
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
        calculateTotalPrice();
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      alert('Failed to decrease quantity.');
    }
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [cart]);

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 w-full p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6 pt-24 pb-16">
        {cart.length === 0 ? (
          <p className="text-center text-lg">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-500">{item.menuname}</h3>
                <p className="text-gray-600 mt-2">{item.menudescription}</p>
                <p className="text-gray-500 mt-1">Price: {item.menuprice}</p>
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

          <div className="mt-4 text-xl font-bold">
            <p>Total Price: {totalPrice}/-</p>
          </div>
          
          <button
            onClick={createOrder}
            className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
