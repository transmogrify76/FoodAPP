import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaLeaf, FaFire, FaChevronLeft } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

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
  const usercartid = decodedToken?.usercartid || '';
  const restaurantid = state?.restaurantId || '';

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

  const handleAddToCart = async (item: any) => {
    setLoadingItemId(item.menuid);
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/cart/assigntocart',
        new URLSearchParams({
          menuid: item.menuid,
          quantity: '1',
          userid: userid,
          restaurantid: restaurantid,
          usercartid: usercartid,
        })
      );

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
      }
    } catch (error) {
      console.error('Error adding item to cart', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrementQuantity = async (item: any) => {
    setLoadingItemId(item.menuid);
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/cart/incquantity',
        new URLSearchParams({
          menuid: item.menuid,
          usercartid: usercartid,
        })
      );

      if (response.status === 200) {
        const newQuantity = response.data.new_quantity;
        setCart((prevCart) =>
          prevCart.map((cartItem) =>
            cartItem.menuid === item.menuid ? { ...cartItem, quantity: newQuantity } : cartItem
          )
        );
      }
    } catch (error) {
      console.error('Error increasing item quantity', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDecrementQuantity = async (item: any) => {
    setLoadingItemId(item.menuid);
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/cart/decquantity',
        new URLSearchParams({
          menuid: item.menuid,
          usercartid: usercartid,
        })
      );

      if (response.status === 200) {
        if (response.data.new_quantity !== undefined) {
          const newQuantity = response.data.new_quantity;
          setCart((prevCart) =>
            prevCart.map((cartItem) =>
              cartItem.menuid === item.menuid ? { ...cartItem, quantity: newQuantity } : cartItem
            )
          );
        } else {
          setCart((prevCart) => prevCart.filter((cartItem) => cartItem.menuid !== item.menuid));
        }
      }
    } catch (error) {
      console.error('Error decreasing item quantity', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleToggleFavorite = async (item: any) => {
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/ops/makemenufav',
        new URLSearchParams({
          menuid: item.menuid,
          userid: userid,
          restaurantid: restaurantid,
        })
      );

      if (response.status === 200) {
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [item.menuid]: !prevFavorites[item.menuid],
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite', error);
    }
  };

  const handleCheckout = () => {
    // Save cart to localStorage and navigate to cart page
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart', { 
      state: { 
        restaurantId: restaurantid,
        fromMenuPage: true 
      } 
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.menudiscountprice || item.menuprice) * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3">
            <FaChevronLeft className="text-lg" />
          </button>
          <h1 className="text-lg font-bold">Menu</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pt-2">
          <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{error}</p>
        </div>
      )}

      <div className="p-4 space-y-4">
        {menu.map((item) => {
          const cartItem = cart.find((cartItem) => cartItem.menuid === item.menuid);
          const isItemInCart = !!cartItem;
          const stockStatus =
            item.currentstatus === "instock"
              ? `In Stock${item.numberoffillups ? ` (${item.numberoffillups})` : ""}`
              : "Out of Stock";
              
          return (
            <div
              key={item.menuid}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="relative">
                {item.images?.length > 0 ? (
                  <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    pagination={{ clickable: true }}
                    modules={[Pagination]}
                    className="h-48"
                  >
                    {item.images.map((image: any, index: number) => (
                      <SwiperSlide key={index}>
                        <img
                          src={`data:image/jpeg;base64,${image.image_data}`}
                          alt={`${item.menuname} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No image available</p>
                  </div>
                )}
                <button
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
                  onClick={() => handleToggleFavorite(item)}
                >
                  <FaHeart className={`text-lg ${favorites[item.menuid] ? 'text-red-500' : 'text-gray-300'}`} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">{item.menuname}</h3>
                      {item.vegornonveg === 'veg' ? (
                        <FaLeaf className="text-green-500" />
                      ) : (
                        <FaFire className="text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stockStatus}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {item.foodtype}
                  </span>
                </div>

                <div className="mt-2">
                  {item.menudiscountpercent ? (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-lg font-bold text-green-600">
                        ₹{item.menudiscountprice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">₹{item.menuprice}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {item.menudiscountpercent}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-700">₹{item.menuprice}</span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-600">{item.menudescription}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.servingtype === "1" 
                      ? "Serves 1 person" 
                      : `Serves ${item.servingtype} people`}
                  </p>
                </div>

                <div className="mt-4">
                  {!isItemInCart ? (
                    <button
                      className={`w-full py-2.5 rounded-lg font-medium text-white ${
                        item.currentstatus === 'outofstock'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98]'
                      } transition-all`}
                      onClick={() => handleAddToCart(item)}
                      disabled={loadingItemId === item.menuid || item.currentstatus === 'outofstock'}
                    >
                      {loadingItemId === item.menuid ? (
                        'Adding...'
                      ) : item.currentstatus === 'outofstock' ? (
                        'Out of Stock'
                      ) : (
                        <>
                          Add to Cart
                          <FaShoppingCart className="inline ml-2" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-orange-100 rounded-lg p-1">
                      <button
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          loadingItemId === item.menuid
                            ? 'bg-gray-300'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                        onClick={() => handleDecrementQuantity(item)}
                        disabled={loadingItemId === item.menuid}
                      >
                        -
                      </button>
                      <span className="mx-2 font-bold">{cartItem.quantity}</span>
                      <button
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          loadingItemId === item.menuid
                            ? 'bg-gray-300'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                        onClick={() => handleIncrementQuantity(item)}
                        disabled={loadingItemId === item.menuid}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative">
                <FaShoppingCart className="text-orange-500 text-xl" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">₹{cartTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">plus taxes</p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              Checkout <IoIosArrowForward className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;