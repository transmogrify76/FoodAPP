import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface CartItem {
  menuname: string;
  menudescription: string;
  menuprice: number;
  quantity: number;
  menuid: string;
  restaurantid: string; 
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  // Expecting the location state to include both the cart items and a cartid
  const [cart, setCart] = useState<CartItem[]>(state?.cart || []);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Retrieve cartid from location state
  const cartId: string | undefined = state?.cartid;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const calculateTotalPrice = () => {
    let total = 0;
    cart.forEach(item => {
      total += item.menuprice * item.quantity;
    });
    setTotalPrice(total);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded?.userid; 
    }
    return null; 
  };

  const createOrder = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('User is not logged in.');
        return;
      }
      if (!cartId) {
        alert('Cart ID not found.');
        return;
      }

      // Capture necessary details for payment before calling the order API
      const restaurantid = cart[0]?.restaurantid || '';
      const menuid = cart.map(item => item.menuid).join(',');
      const totalPriceForPayment = totalPrice.toString();

      // Send only the cartid as required by the new API endpoint
      const orderData = new URLSearchParams();
      orderData.append('cartid', cartId);

      const response = await axios.post('http://localhost:5000/order/createorder', orderData);

      if (response.status === 200) {
        // Order created successfully; now proceed with payment
        initiatePayment(userId, restaurantid, menuid, totalPriceForPayment);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order.');
    }
  };

  // Modified to accept payment details as parameters rather than reading from cart state
  const initiatePayment = async (
    userId: string,
    restaurantid: string,
    menuid: string,
    totalPrice: string
  ) => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      alert('Razorpay is not loaded.');
      return;
    }

    try {
      const paymentData = new URLSearchParams();
      paymentData.append('userid', userId);
      paymentData.append('restaurantid', restaurantid);
      paymentData.append('menuid', menuid);
      paymentData.append('totalprice', totalPrice);

      const response = await axios.post('http://localhost:5000/createpayment/razorpay', paymentData);

      if (response.status === 200) {
        const paymentDetails = response.data;
        const options = {
          key: 'rzp_test_nzmqxQYhvCH9rD',  
          amount: paymentDetails.amount,  
          currency: paymentDetails.currency,
          order_id: paymentDetails.id,
          name: 'Restaurant Name',  
          description: 'Complete your payment',
          image: 'https://your-logo-url.com', 
          handler: function (response: any) {
            alert('Payment successful!');
            // Optionally, update the UI to reflect the cleared cart
            setCart([]);
          },
          prefill: {
            name: 'User Name',  
            email: 'user@example.com',
            contact: '1234567890',
          },
          theme: {
            color: '#F37254', 
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

  const handleIncreaseQuantity = async (item: CartItem) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('User is not logged in.');
        return;
      }
      const restaurantId = item.restaurantid;
      const response = await axios.post('http://localhost:5000/cart/incquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: userId,
        restaurantid: restaurantId,
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

  const handleDecreaseQuantity = async (item: CartItem) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('User is not logged in.');
        return;
      }
      const response = await axios.post('http://localhost:5000/cart/decquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: userId,
        restaurantid: item.restaurantid,
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
      </div>

      {/* Total Price & Checkout */}
      <div className="flex justify-between p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white fixed bottom-0 left-0 w-full">
        <h2 className="font-semibold">Total: ₹{totalPrice}</h2>
        <button
          onClick={createOrder}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-6 rounded-full shadow-lg hover:bg-gradient-to-l transition-all"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
