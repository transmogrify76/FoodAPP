import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const RestaurantMenuPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  const token = localStorage.getItem('token');
  const decodedToken: any = token ? jwtDecode(token) : null;
  const userid = decodedToken?.userid || '';
  const restaurantid = state?.restaurantId || '';

  const handleAddToCart = async (item: any) => {
    setLoadingItemId(item.menuid); 
    try {
      const response = await axios.post('http://localhost:5000/cart/assigntocart', new URLSearchParams({
        menuid: item.menuid,
        quantity: '1',
        userid: userid,
        restaurantid: restaurantid,
      }));

      if (response.status === 200) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((cartItem) => cartItem.menuid === item.menuid);

          if (existingItem) {
            return prevCart.map((cartItem) =>
              cartItem.menuid === item.menuid
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            );
          } else {
            return [...prevCart, { ...item, quantity: 1 }];
          }
        });

        alert('Item added to cart!');
      }
    } catch (error) {
      console.error('Error adding item to cart', error);
      alert('Failed to add item to cart.');
    } finally {
      setLoadingItemId(null); 
    }
  };

  const handleIncrementQuantity = async (item: any) => {
    setLoadingItemId(item.menuid); 
    try {
      const response = await axios.post('http://localhost:5000/cart/incquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: userid,
        restaurantid: restaurantid,
      }));

      if (response.status === 200) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((cartItem) => cartItem.menuid === item.menuid);

          if (existingItem) {
            return prevCart.map((cartItem) =>
              cartItem.menuid === item.menuid
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            );
          } else {
            return [...prevCart, { ...item, quantity: 1 }];
          }
        });

        alert('Item quantity increased!');
      }
    } catch (error) {
      console.error('Error increasing item quantity', error);
      alert('Failed to increase item quantity.');
    } finally {
      setLoadingItemId(null); 
    }
  };

  const handleDecrementQuantity = async (item: any) => {
    setLoadingItemId(item.menuid); 
    try {
      const response = await axios.post('http://localhost:5000/cart/decquantity', new URLSearchParams({
        menuid: item.menuid,
        userid: userid,
      }));

      if (response.status === 200) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((cartItem) => cartItem.menuid === item.menuid);

          if (existingItem) {
            if (existingItem.quantity > 1) {
              return prevCart.map((cartItem) =>
                cartItem.menuid === item.menuid
                  ? { ...cartItem, quantity: cartItem.quantity - 1 }
                  : cartItem
              );
            } else {
              return prevCart.filter((cartItem) => cartItem.menuid !== item.menuid);
            }
          }
          return prevCart;
        });

        alert('Item quantity decreased!');
      }
    } catch (error) {
      console.error('Error decreasing item quantity', error);
      alert('Failed to decrease item quantity.');
    } finally {
      setLoadingItemId(null); 
    }
  };

  const handleToggleFavorite = async (item: any) => {
    try {
      const response = await axios.post('http://localhost:5000/ops/makemenufav', new URLSearchParams({
        menuid: item.menuid,
        userid: userid,
        restaurantid: restaurantid,
      }));

      if (response.status === 200) {
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [item.menuid]: !prevFavorites[item.menuid],
        }));
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling favorite', error);
      alert('Failed to toggle favorite.');
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (state && state.menu) {
      setMenu(state.menu);
      const initialFavorites = state.menu.reduce((acc: any, item: any) => {
        acc[item.menuid] = false; 
        return acc;
      }, {});
      setFavorites(initialFavorites);
    } else {
      setError('Failed to load menu.');
    }
  }, [state]);

  const handleCheckout = () => {
    navigate('/cart', { state: { cart } });
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <h1 className="text-2xl font-bold">Restaurant Menu</h1>
      </div>

      {error && <p className="text-red-500 text-center font-semibold mt-4">{error}</p>}

      <div className="p-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {menu.map((item) => {
            const cartItem = cart.find((cartItem) => cartItem.menuid === item.menuid);
            const isItemInCart = !!cartItem;

            return (
              <div
                key={item.menuid}
                className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-xl rounded-lg p-6 transition-all"
              >
                <h3 className="text-lg font-bold text-red-500">{item.menuname}</h3>
                <p className="text-gray-600 mt-2">{item.menudescription}</p>
                <p className="text-gray-500 mt-1">Price: {item.menuprice}</p>
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
                <div className="flex justify-between items-center mt-6">
                  {!isItemInCart ? (
                    <button
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:bg-gradient-to-l transition-all"
                      onClick={() => handleAddToCart(item)}
                      disabled={loadingItemId === item.menuid}
                    >
                      {loadingItemId === item.menuid ? 'Adding...' : 'Add to Cart'} <FaShoppingCart className="inline ml-2" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-all"
                        onClick={() => handleDecrementQuantity(item)}
                        disabled={loadingItemId === item.menuid}
                      >
                        -
                      </button>
                      <span className="text-lg font-bold">{cartItem.quantity}</span>
                      <button
                        className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-all"
                        onClick={() => handleIncrementQuantity(item)}
                        disabled={loadingItemId === item.menuid}
                      >
                        +
                      </button>
                    </div>
                  )}
                  <button
                    className="ml-4 p-3 bg-white text-red-500 rounded-full shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleToggleFavorite(item)}
                  >
                    <FaHeart className={favorites[item.menuid] ? 'text-red-500' : 'text-gray-300'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 w-full p-3 bg-white shadow-lg flex justify-between items-center px-6">
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