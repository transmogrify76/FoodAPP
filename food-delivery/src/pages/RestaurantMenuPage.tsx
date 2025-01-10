import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const RestaurantMenu: React.FC = () => {
  const location = useLocation();
  const { menu, restaurantid } = location.state || { menu: [], restaurantid: null };

  const [userid, setUserId] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Extract userid from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.userid) {
          setUserId(decodedToken.userid);
        } else {
          console.error('User ID is missing in the token.');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('Token is missing. User might not be logged in.');
    }
  }, []);

  // Handle adding to cart
  const handleAddToCart = async (menuid: string, quantity: number = 1) => {
    if (!userid) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    if (!restaurantid) {
      alert('Restaurant information is missing. Please reload the menu.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/cart/assigntocart', 
        {
          menuid,
          quantity,
          userid,
          restaurantid,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setCartMessage('Product added to cart successful.');
        setTimeout(() => setCartMessage(''), 3000); 
      } else {
        setError('Failed to add product to cart.');
        setTimeout(() => setError(''), 3000); 
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setError('An error occurred while adding the product to the cart.');
      setTimeout(() => setError(''), 3000); 
    }
  };

  if (!menu || menu.length === 0) {
    return <p>No menu available.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Menu</h1>
      
      {cartMessage && <p className="text-green-500 text-center mb-4">{cartMessage}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((item: any) => (
          <div key={item.menuid} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold text-red-600">{item.menuname}</h3>
            <p className="text-gray-600">{item.menudescription}</p>
            <p className="text-gray-500">₹{item.menuprice}</p>
            {item.images && item.images.length > 0 && (
              <img
                src={`data:image/png;base64,${item.images[0].image_data}`}
                alt={item.menuname}
                className="mt-2 w-full h-40 object-cover rounded-lg"
              />
            )}
            <button
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => handleAddToCart(item.menuid, 1)}
            >
              Add to Cart
            </button>
            <button
              className="mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              onClick={() => alert('Order Now functionality to be implemented!')}
            >
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
