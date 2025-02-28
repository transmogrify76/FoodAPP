import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination } from 'swiper/modules';
import { FaShoppingCart, FaLeaf, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decodedToken: any = token ? jwtDecode(token) : null;
  const userid = decodedToken?.userid || '';
  const usercartid = decodedToken?.usercartid || '';

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/resown/getallmenus');
        console.log('API Response:', response.data);
        setMenuItems(response.data.menus);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = async (item: any) => {
    setLoadingItemId(item.menuid);
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/cart/assigntocart',
        new URLSearchParams({
          menuid: item.menuid,
          quantity: '1',
          userid: userid,
          restaurantid: item.restaurantid, 
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
      const response = await axios.post(
        'http://127.0.0.1:5000/cart/incquantity',
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
      const response = await axios.post(
        'http://127.0.0.1:5000/cart/decquantity',
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
          alert('Item quantity decreased!');
        } else {
          setCart((prevCart) =>
            prevCart.filter((cartItem) => cartItem.menuid !== item.menuid)
          );
          alert('Product removed from cart successfully');
        }
      }
    } catch (error) {
      console.error('Error decreasing item quantity', error);
      alert('Failed to decrease item quantity.');
    } finally {
      setLoadingItemId(null);
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <h1 className="text-xl font-bold">All Dishes</h1>
      </div>

      <div className="p-4 pb-24 flex-1">
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item) => {
            const cartItem = cart.find((cartItem) => cartItem.menuid === item.menuid);
            const isItemInCart = !!cartItem;
            const stockStatus =
              item.currentstatus === "instock"
                ? `In Stock${item.numberoffillups ? ` (${item.numberoffillups})` : ""}`
                : "Out of Stock";

            return (
              <div
                key={item.menuid}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{item.menuname}</h3>
                    {item.vegornonveg === 'veg' ? (
                      <FaLeaf className="text-green-500 min-w-[16px]" />
                    ) : (
                      <FaFire className="text-red-600 min-w-[16px]" />
                    )}
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {item.foodtype}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">{stockStatus}</p>

                <div className="mt-2">
                  {item.images?.length > 0 ? (
                    <Swiper
                      slidesPerView={1}
                      spaceBetween={10}
                      pagination={{ clickable: true }}
                      modules={[Pagination]}
                      className="h-48 rounded-lg overflow-hidden"
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
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No image available</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{item.menudescription}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.servingtype === "1" 
                      ? "Serves 1 person" 
                      : `Serves ${item.servingtype} people`}
                  </p>
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

                <div className="flex justify-between items-center mt-4">
                  <div className="flex-1">
                    {!isItemInCart ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-red-500 text-white font-semibold py-2.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                        disabled={loadingItemId === item.menuid || item.currentstatus === 'outofstock'}
                      >
                        {loadingItemId === item.menuid ? (
                          'Adding...'
                        ) : item.currentstatus === 'outofstock' ? (
                          'Out of Stock'
                        ) : (
                          <>
                            Add to Cart
                            <FaShoppingCart className="inline ml-2 text-sm" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1.5">
                        <button
                          onClick={() => handleDecrementQuantity(item)}
                          className="w-8 h-8 bg-red-500 text-white rounded-lg active:scale-95"
                          disabled={loadingItemId === item.menuid}
                        >
                          -
                        </button>
                        <span className="mx-3 font-bold">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleIncrementQuantity(item)}
                          className="w-8 h-8 bg-green-500 text-white rounded-lg active:scale-95"
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-up-lg">
        <button
          onClick={() => navigate('/cart', { state: { cart } })}
          className="w-full bg-red-500 text-white font-semibold py-3.5 rounded-lg active:scale-98 transition-transform"
        >
          Checkout Now
        </button>
      </div>
    </div>
  );
};

export default MenuPage;
