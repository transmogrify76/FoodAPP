import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaMapMarkerAlt, FaCrosshairs, FaMotorcycle, FaShoppingBag, FaEdit } from 'react-icons/fa';


interface CartItem {
  menuname: string;
  menudescription: string;
  menuprice: number;
  quantity: number;
  menusercartid: string;
  restaurantid: string;
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  const [cart, setCart] = useState<CartItem[]>(state?.cart || []);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [deliveryOption, setDeliveryOption] = useState<'takeaway' | 'delivery'>('takeaway');
  const [deliveryLocation, setDeliveryLocation] = useState<{ 
    address: string; 
    coordinates?: { lat: number; lng: number } 
  }>({ address: '' });
  const [showLocationInput, setShowLocationInput] = useState(false);

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

  const getusercartidFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded?.usercartid;
    }
    return null;
  };

  const handleLocationSelection = async (type: 'current' | 'manual') => {
    if (type === 'current') {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDeliveryLocation({
              address: 'Current Location',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
            setShowLocationInput(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location. Please enable location services.');
          }
        );
      } catch (error) {
        console.error('Geolocation error:', error);
      }
    } else {
      setShowLocationInput(true);
    }
  };

  const createOrder = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('User is not logged in.');
        return;
      }
      
      const usercartid = getusercartidFromToken();
      if (!usercartid) {
        alert('Cart ID not found.');
        return;
      }

      const restaurantid = cart[0]?.restaurantid || '';
      const menusercartid = cart.map(item => item.menusercartid).join(',');
      const totalPriceForPayment = totalPrice.toString();

      const orderData = new URLSearchParams();
      orderData.append('usercartid', usercartid);

      const response = await axios.post('http://localhost:5000/order/createorder', orderData);

      if (response.status === 200) {
        initiatePayment(userId, restaurantid, menusercartid, totalPriceForPayment);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order.');
    }
  };

  const initiatePayment = async (
    userId: string,
    restaurantid: string,
    menusercartid: string,
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
      paymentData.append('menusercartid', menusercartid);
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
            (async () => {
              try {
                const verifyResponse = await axios.post('http://localhost:5000/verifypayment', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  userid: userId,
                  restaurantid: restaurantid,
                  menuid: menusercartid,
                  price: totalPrice
                });
                console.log("Verification response:", verifyResponse.data);
              } catch (err) {
                console.error("Error verifying payment:", err);
              }
            })();
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
      const usercartid = getusercartidFromToken();
      if (!usercartid) {
        alert('User cart ID not found.');
        return;
      }
      const response = await axios.post(
        'http://localhost:5000/cart/incquantity',
        new URLSearchParams({
          usercartid: usercartid,
          menuid: item.menusercartid,
        })
      );

      if (response.status === 200) {
        const newQuantity = response.data.new_quantity;
        setCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem.menusercartid === item.menusercartid
              ? { ...cartItem, quantity: newQuantity }
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
      const usercartid = getusercartidFromToken();
      if (!usercartid) {
        alert('User cart ID not found.');
        return;
      }
      const response = await axios.post(
        'http://localhost:5000/cart/decquantity',
        new URLSearchParams({
          usercartid: usercartid,
          menuid: item.menusercartid,
        })
      );

      if (response.status === 200) {
        if (response.data.new_quantity !== undefined) {
          const newQuantity = response.data.new_quantity;
          setCart(prevCart =>
            prevCart.map(cartItem =>
              cartItem.menusercartid === item.menusercartid
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            )
          );
          alert('Item quantity decreased successfully!');
        } else {
          setCart(prevCart =>
            prevCart.filter(cartItem => cartItem.menusercartid !== item.menusercartid)
          );
          alert('Product removed from cart successfully');
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

      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-xl font-bold">Your Cart</h1>
      </div>


      <div className="p-4 pt-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setDeliveryOption('takeaway')}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              deliveryOption === 'takeaway' 
                ? 'bg-red-100 border-2 border-red-500 text-red-600'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-red-200'
            }`}
          >
            <FaShoppingBag className="text-lg" />
            <span className="font-medium">Takeaway</span>
          </button>
          
          <button
            onClick={() => setDeliveryOption('delivery')}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              deliveryOption === 'delivery' 
                ? 'bg-red-100 border-2 border-red-500 text-red-600'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-red-200'
            }`}
          >
            <FaMotorcycle className="text-lg" />
            <span className="font-medium">Delivery</span>
          </button>
        </div>

        {deliveryOption === 'delivery' && (
          <div className="space-y-3">
            {!deliveryLocation.address && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLocationSelection('current')}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <FaCrosshairs className="text-red-500" />
                  <span>Current Location</span>
                </button>
                <button
                  onClick={() => handleLocationSelection('manual')}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>Enter Address</span>
                </button>
              </div>
            )}

            {showLocationInput && (
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter delivery address"
                  className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-0"
                  value={deliveryLocation.address}
                  onChange={(e) => setDeliveryLocation({ ...deliveryLocation, address: e.target.value })}
                />
              </div>
            )}

            {deliveryLocation.address && (
              <div className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" />
                  <span className="text-gray-700">{deliveryLocation.address}</span>
                </div>
                <button
                  onClick={() => {
                    setDeliveryLocation({ address: '' });
                    setShowLocationInput(false);
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <FaEdit className="text-sm" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

 
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {cart.length === 0 ? (
          <p className="text-center text-lg text-gray-700">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                <h3 className="text-lg font-bold text-gray-800">{item.menuname}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.menudescription}</p>
                <p className="text-sm text-gray-500 mt-1">Price: ₹{item.menuprice}</p>
                <div className="mt-4 flex items-center justify-between bg-gray-100 rounded-lg p-1.5">
                  <button
                    onClick={() => handleDecreaseQuantity(item)}
                    className="w-8 h-8 bg-red-500 text-white rounded-lg active:scale-95"
                  >
                    -
                  </button>
                  <span className="mx-3 font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => handleIncreaseQuantity(item)}
                    className="w-8 h-8 bg-green-500 text-white rounded-lg active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-up-lg flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Total: ₹{totalPrice}</h2>
        <button
          onClick={createOrder}
          className="bg-red-500 text-white font-semibold py-3.5 px-6 rounded-lg active:scale-98 transition-transform"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;