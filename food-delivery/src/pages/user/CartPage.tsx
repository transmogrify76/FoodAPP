import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import { 
  FaShoppingBag, FaTruck, FaMapMarkerAlt, FaCrosshairs, FaEdit, 
  FaPlus, FaMinus, FaArrowLeft, FaLeaf, FaFire, FaHome, 
  FaUserAlt, FaHistory, FaShoppingCart, FaReceipt, FaClock,
  FaPercentage, FaCreditCard, FaShieldAlt
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

// ✅ Initialize socket connection
const socket = io("https://backend.foodapp.transev.site", {
  transports: ["polling", "websocket"],
  upgrade: true,
  rememberUpgrade: true,
  path: "/socket.io",
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

interface MenuDetails {
  created_at: string;
  final_price: string;
  foodtype: string;
  foodweight: string;
  gst_rate: string;
  images: string[];
  menudescription: string;
  menudiscountpercent: string;
  menudiscountprice: string;
  menuitemtype: string;
  menuname: string;
  menuprice: string;
  menutype: string;
  restaurantid: string;
  servingtype: string;
  uid: string;
  vegornonveg: string;
}

interface CartItem {
  created_at: string;
  menu_details: MenuDetails;
  menuid: string;
  quantity: string;
  restaurantid: string;
  total_price: string;
  uid: string;
  usercartid: string;
  userid: string;
  gst_amount?: string;
  gst_percentage?: string;
  line_total_amount?: string;
}

interface CartResponse {
  cart_grand_total: string;
  cart_items: CartItem[];
  cart_processing_charges: string;
  cart_processing_gst: string;
  cart_total_amount: string;
  cart_total_gst_amount: string;
  platform_fee_amount: string;
  platform_fee_gst: string;
  platform_fee_percent: string;
  usercartid: string;
  userid: string;
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"takeaway" | "delivery">("takeaway");
  const [deliveryLocation, setDeliveryLocation] = useState<{ 
    address: string; 
    coordinates?: { lat: number; lng: number }; 
  }>({ address: "123 Food Street, Restaurant District, 560001" });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const cart = cartData?.cart_items || [];
  const totalPrice = parseFloat(cartData?.cart_grand_total || "0");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded?.userid;
    }
    return null;
  };

  const getusercartidFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded?.usercartid;
    }
    return null;
  };

  const fetchCartItems = async () => {
    const userid = getUserIdFromToken();
    const usercartid = getusercartidFromToken();
    if (!userid && !usercartid) return;

    try {
      setLoading(true);
      const formData = new FormData();
      if (userid) formData.append("userid", userid);
      if (usercartid) formData.append("usercartid", usercartid);

      const response = await axios.post<CartResponse>(
        "https://backend.foodapp.transev.site/cart/getcartbyuserid",
        formData
      );
      setCartData(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state?.cart && state.cart.length > 0) {
      fetchCartItems();
    } else {
      fetchCartItems();
    }
  }, []);

  const handleLocationSelection = async (type: "current" | "manual") => {
    if (type === "current") {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDeliveryLocation({
              address: "Current Location",
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            });
            setShowLocationInput(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location. Please enable location services.");
          }
        );
      } catch (error) {
        console.error("Geolocation error:", error);
      }
    } else {
      setShowLocationInput(true);
    }
  };

  const handleQuantityChange = async (item: CartItem, action: "inc" | "dec") => {
    const usercartid = getusercartidFromToken();
    if (!usercartid) return;

    try {
      setLoading(true);
      const endpoint = action === "inc" 
        ? "https://backend.foodapp.transev.site/cart/incquantity"
        : "https://backend.foodapp.transev.site/cart/decquantity";

      const response = await axios.post(
        endpoint,
        new URLSearchParams({
          usercartid,
          menuid: item.menuid,
        })
      );

      if (response.status === 200) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (deliveryOption === "delivery" && !deliveryLocation.address) {
      alert("Please select a delivery location");
      return;
    }

    const userId = getUserIdFromToken();
    const usercartid = getusercartidFromToken();
    if (!userId || !usercartid) return;

    try {
      setLoading(true);
      const onReply = (response: any) => {
        socket.off("message", onReply);
        setLoading(false);
        if (response?.error) {
          console.error("Order creation failed:", response.error);
          alert(response.error);
          return;
        }
        console.log("Order created successfully:", response);
        navigate("/payment", {
          state: {
            cart,
            totalPrice,
            deliveryOption,
            deliveryLocation,
            cartData
          },
        });
      };

      socket.once("message", onReply);
      socket.emit("createorder", {
        usercartid,
        userid: userId,
        temporarylocation: deliveryOption === "delivery" 
          ? deliveryLocation.address || (deliveryLocation.coordinates 
              ? `${deliveryLocation.coordinates.lat},${deliveryLocation.coordinates.lng}` 
              : "delivery")
          : "takeaway",
      });

      setTimeout(() => {
        const stillListening = socket.hasListeners?.("message");
        if (stillListening) {
          socket.off("message", onReply);
          setLoading(false);
          alert("Order creation timed out. Please try again.");
        }
      }, 15000);
    } catch (error) {
      console.error("Error creating order:", error);
      setLoading(false);
    }
  };

  const getDeliveryTime = () => {
    return deliveryOption === "delivery" ? "25-35 mins" : "15-20 mins";
  };

  const getDiscountAmount = (item: CartItem) => {
    const originalPrice = parseFloat(item.menu_details.menuprice);
    const discountPrice = parseFloat(item.menu_details.menudiscountprice);
    return (originalPrice - discountPrice) * parseInt(item.quantity);
  };

  const totalDiscount = cart.reduce((sum, item) => sum + getDiscountAmount(item), 0);
  const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);

  return (
    <div className="min-h-screen bg-orange-50 pb-32">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center p-4 bg-orange-500 text-white">
          <div className="flex items-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo" className="w-8 h-8 mr-2" />
            <h3 className="text-lg font-bold">Foodie Heaven</h3>
          </div>
          <button onClick={toggleSidebar} className="text-xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <button onClick={() => navigate('/home')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700">
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/profile')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700">
                <FaUserAlt className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/history')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700">
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}

      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-xl">
            <FaArrowLeft />
          </button>
          <div className="flex items-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo" className="w-6 h-6 mr-2" />
            <h1 className="text-lg font-bold">Your Cart</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="p-4 bg-white border-b border-orange-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FaClock className="text-orange-500" />
            <span>Est. Time: </span>
            <span className="font-semibold text-gray-900">{getDeliveryTime()}</span>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => setDeliveryOption('takeaway')}
            className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${
              deliveryOption === 'takeaway' 
                ? 'bg-orange-100 border border-orange-300 text-orange-700' 
                : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}
          >
            <FaShoppingBag className="text-xl" />
            <span className="text-sm font-medium">Takeaway</span>
          </button>
          <button 
            onClick={() => setDeliveryOption('delivery')}
            className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${
              deliveryOption === 'delivery' 
                ? 'bg-orange-100 border border-orange-300 text-orange-700' 
                : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}
          >
            <FaTruck className="text-xl" />
            <span className="text-sm font-medium">Delivery</span>
          </button>
        </div>

        {deliveryOption === 'delivery' && (
          <div className="space-y-3">
            {!deliveryLocation.address ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleLocationSelection('current')}
                  className="p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-orange-50 border border-gray-200"
                >
                  <FaCrosshairs className="text-orange-600 text-lg" />
                  <span className="text-xs text-gray-700">Current Location</span>
                </button>
                <button 
                  onClick={() => handleLocationSelection('manual')}
                  className="p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-orange-50 border border-gray-200"
                >
                  <FaMapMarkerAlt className="text-orange-600 text-lg" />
                  <span className="text-xs text-gray-700">Enter Address</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-orange-50 rounded-lg flex items-center justify-between border border-orange-100">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-orange-600" />
                  <span className="text-sm text-gray-800">{deliveryLocation.address}</span>
                </div>
                <button 
                  onClick={() => {
                    setDeliveryLocation({ address: '' });
                    setShowLocationInput(false);
                  }}
                  className="text-orange-600 hover:text-orange-700 p-1"
                >
                  <FaEdit className="text-sm" />
                </button>
              </div>
            )}

            {showLocationInput && (
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Enter delivery address"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 text-gray-800 bg-white"
                  value={deliveryLocation.address}
                  onChange={(e) => setDeliveryLocation({ ...deliveryLocation, address: e.target.value })}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FaShoppingBag className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Your cart is empty</h3>
            <p className="text-gray-600 mt-1">Add some delicious items to get started</p>
            <button 
              onClick={() => navigate('/home')}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Items ({totalItems})</h2>
              {totalDiscount > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <FaPercentage className="text-xs" />
                  <span>Save ₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-3">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.menu_details.images && item.menu_details.images.length > 0 ? (
                        <img 
                          src={`https://backend.foodapp.transev.site/${item.menu_details.images[0]}`}
                          alt={item.menu_details.menuname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <FaShoppingBag className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{item.menu_details.menuname}</h3>
                        {item.menu_details.vegornonveg === 'veg' ? (
                          <FaLeaf className="text-green-600 text-xs flex-shrink-0" />
                        ) : (
                          <FaFire className="text-red-600 text-xs flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">{item.menu_details.menudescription}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-900">₹{item.menu_details.menudiscountprice}</span>
                        {item.menu_details.menudiscountpercent !== "0" && (
                          <span className="text-xs text-gray-500 line-through">₹{item.menu_details.menuprice}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-orange-50 rounded-lg border border-orange-100">
                        <button 
                          onClick={() => handleQuantityChange(item, 'dec')}
                          disabled={loading || parseInt(item.quantity) <= 1}
                          className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-30"
                        >
                          <FaMinus />
                        </button>
                        <span className="px-2 font-medium text-sm text-gray-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item, 'inc')}
                          disabled={loading}
                          className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-50"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    {item.menu_details.menudiscountpercent !== "0" && (
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-green-600 font-medium">
                          Save ₹{getDiscountAmount(item).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          ₹{(parseFloat(item.menu_details.menudiscountprice) * parseInt(item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button onClick={() => navigate('/home')} className="text-gray-500 flex flex-col items-center">
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate('/history')} className="text-gray-500 flex flex-col items-center">
          <FaHistory className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button onClick={() => navigate('/cart')} className="text-orange-500 flex flex-col items-center">
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart ({totalItems})</span>
        </button>
        <button onClick={() => navigate('/profile')} className="text-gray-500 flex flex-col items-center">
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>

      {/* Checkout Section */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-3">
            <FaShieldAlt className="text-green-500" />
            <span>Secure checkout • 100% Safe</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
              className="flex items-center text-sm text-orange-600 font-medium"
            >
              <FaReceipt className="mr-1" />
              {showPriceBreakdown ? 'Hide' : 'Show'} Price Breakdown
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="font-bold text-gray-900">₹{totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {showPriceBreakdown && cartData && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Item Total ({totalItems} items)</span>
                <span>₹{parseFloat(cartData.cart_total_amount).toFixed(2)}</span>
              </div>
              
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount</span>
                  <span>-₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-600">
                <span>Processing Charges</span>
                <span>₹{parseFloat(cartData.cart_processing_charges).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Processing GST</span>
                <span>₹{parseFloat(cartData.cart_processing_gst).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Platform Fee ({cartData.platform_fee_percent}%)</span>
                <span>₹{parseFloat(cartData.platform_fee_amount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Platform Fee GST</span>
                <span>₹{parseFloat(cartData.platform_fee_gst).toFixed(2)}</span>
              </div>

              {deliveryOption === 'delivery' && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-3 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard />
                Proceed to Pay ₹{totalPrice.toFixed(2)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;