import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';

const RestaurantMenuPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Assuming you have a userId and restaurantId available
  const userid = 'user123'; // This should come from your authentication state
  const restaurantid = 'restaurant123'; // You should get this from your app context or API

  // Handle adding item to cart
  const handleAddToCart = async (item: any) => {
    setLoading(true);
    try {
      // Call the backend API to add item to the cart
      const response = await axios.post('http://localhost:5000/cart/assigntocart', new URLSearchParams({
        menuid: item.menuid,
        quantity: '1', // Assuming you are adding one item at a time
        userid: userid,
        restaurantid: restaurantid,
      }));

      // If the request is successful, update the frontend cart state
      if (response.status === 200) {
        setCart((prevCart) => [...prevCart, item]);
        alert('Item added to cart!');
      }
    } catch (error) {
      console.error('Error adding item to cart', error);
      alert('Failed to add item to cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state && state.menu) {
      setMenu(state.menu);
    } else {
      setError('Failed to load menu.');
    }
  }, [state]);

  const handleCheckout = () => {
    // Navigate to cart page for checkout
    navigate('/cart', { state: { cart } });
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <h1 className="text-2xl font-bold">Restaurant Menu</h1>
        <button
          onClick={() => navigate('/')}
          className="text-white text-lg font-medium hover:underline"
        >
          Back to Home
        </button>
      </div>

      {error && <p className="text-red-500 text-center font-semibold mt-4">{error}</p>}

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menu.map((item) => (
            <div
              key={item.menuid}
              className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-xl rounded-lg p-6 transition-all"
            >
              <h3 className="text-lg font-bold text-red-500">{item.menuname}</h3>
              <p className="text-gray-600 mt-2">{item.menudescription}</p>
              <p className="text-gray-500 mt-1">Price: ${item.menuprice}</p>
              <div className="mt-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={`data:image/jpeg;base64,${item.images[0].image_data}`}
                    alt={item.menuname}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <button
                className="mt-4 w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:bg-gradient-to-l transition-all"
                onClick={() => handleAddToCart(item)}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add to Cart'} <FaShoppingCart className="inline ml-2" />
              </button>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 w-full p-4 bg-white shadow-lg flex justify-between items-center">
          <button
            onClick={handleCheckout}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gradient-to-l transition-all"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
