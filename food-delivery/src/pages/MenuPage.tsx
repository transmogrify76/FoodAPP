import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination } from 'swiper/modules';
import { FaShoppingCart, FaLeaf, FaFire, FaHome, FaUserAlt, FaHistory, FaArrowLeft } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decodedToken: any = token ? jwtDecode(token) : null;
  const userid = decodedToken?.userid || '';
  const usercartid = decodedToken?.usercartid || '';

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('https://backend.foodapp.transev.site/resown/getallmenus');
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
        'https://backend.foodapp.transev.site/cart/assigntocart',
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
          setCart((prevCart) =>
            prevCart.filter((cartItem) => cartItem.menuid !== item.menuid)
          );
        }
      }
    } catch (error) {
      console.error('Error decreasing item quantity', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-orange-500 text-white">
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-lg font-bold">Foodie Heaven</h3>
          </div>
          <button onClick={toggleSidebar} className="text-xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUserAlt className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-xl">
            <FaArrowLeft />
          </button>
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">All Dishes</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
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
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
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
                    <div className="h-32 bg-orange-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No image available</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{item.menudescription}</p>
                  {/* <p className="text-xs text-gray-500 mt-1">
                    {item.servingtype === "1" 
                      ? "Serves 1 person" 
                      : `Serves ${item.servingtype} people`}
                  </p> */}
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
                        className="w-full bg-orange-500 text-white font-semibold py-2.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
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
                      <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1.5">
                        <button
                          onClick={() => handleDecrementQuantity(item)}
                          className="w-8 h-8 bg-orange-500 text-white rounded-lg active:scale-95"
                          disabled={loadingItemId === item.menuid}
                        >
                          -
                        </button>
                        <span className="mx-3 font-bold">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleIncrementQuantity(item)}
                          className="w-8 h-8 bg-orange-600 text-white rounded-lg active:scale-95"
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button 
          onClick={() => navigate('/home')}
          className="text-orange-500 flex flex-col items-center"
        >
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaHistory className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button 
          onClick={() => navigate('/cart', { state: { cart } })}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart ({cart.reduce((total, item) => total + item.quantity, 0)})</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MenuPage;   
 