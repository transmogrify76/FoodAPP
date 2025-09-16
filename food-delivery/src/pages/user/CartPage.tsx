import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import {
  FaShoppingBag,
  FaTruck,
  FaMapMarkerAlt,
  FaCrosshairs,
  FaEdit,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaLeaf,
  FaFire,
  FaHome,
  FaUserAlt,
  FaHistory,
  FaShoppingCart,
  FaReceipt,
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

// handy logs
socket.on("connect_error", (err) => console.warn("connect_error", err.message));
socket.on("reconnect_attempt", (n) => console.log("reconnect attempt", n));

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
  cart_items: CartItem[];
  cart_total_amount: string;
  cart_total_gst_amount: string;
  usercartid: string;
  userid: string;
}

const CartPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [deliveryOption, setDeliveryOption] = useState<"takeaway" | "delivery">(
    "takeaway"
  );
  const [deliveryLocation, setDeliveryLocation] = useState<{
    address: string;
    coordinates?: { lat: number; lng: number };
  }>({ address: "" });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Calculate prices based on cart data
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => {
      const itemPrice = parseFloat(
        item.menu_details.menudiscountprice || item.menu_details.menuprice
      );
      return sum + itemPrice * parseInt(item.quantity);
    }, 0);
    
    const gst = cart.reduce((sum, item) => {
      return sum + (parseFloat(item.gst_amount || "0") * parseInt(item.quantity));
    }, 0);
    
    const total = subtotal + gst;
    
    setSubtotal(subtotal);
    setTotalGst(gst);
    setTotalPrice(total);
  }, [cart]);

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

  // New function to fetch cart items
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

      if (response.data && response.data.cart_items) {
        setCart(response.data.cart_items);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchCartItems when component mounts
  useEffect(() => {
    if (state?.cart && state.cart.length > 0) {
      // Convert the state cart items to match the new interface if needed
      const formattedCart = state.cart.map((item: any) => ({
        ...item,
        quantity: item.quantity.toString(),
        total_price: (
          (item.menudiscountprice || parseFloat(item.menuprice)) *
          item.quantity
        ).toString(),
      }));
      setCart(formattedCart);
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
            alert(
              "Unable to retrieve your location. Please enable location services."
            );
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
      const endpoint =
        action === "inc"
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
        if (action === "dec" && response.data.new_quantity === 0) {
          // Remove item if quantity becomes 0
          setCart((prev) => prev.filter((i) => i.menuid !== item.menuid));
        } else {
          // Update only the specific item's quantity and total price
          setCart((prev) =>
            prev.map((i) =>
              i.menuid === item.menuid
                ? {
                    ...i,
                    quantity: response.data.new_quantity.toString(),
                    total_price: (
                      parseFloat(
                        i.menu_details.menudiscountprice ||
                          i.menu_details.menuprice
                      ) * response.data.new_quantity
                    ).toString(),
                  }
                : i
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated with backend's generic "message" reply
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

      // 🔁 listen ONCE for the backend's "message" response
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
          },
        });
      };

      socket.once("message", onReply);

      socket.emit("createorder", {
        usercartid,
        userid: userId, // Added userid to the payload
        temporarylocation:
          deliveryOption === "delivery"
            ? deliveryLocation.address ||
              (deliveryLocation.coordinates
                ? `${deliveryLocation.coordinates.lat},${deliveryLocation.coordinates.lng}`
                : "delivery")
            : "takeaway",
      });

      // Timeout for safety
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
            <h1 className="text-lg font-bold">Your Cart</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="p-4 bg-white border-b border-gray-100">
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
            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{item.menu_details.menuname}</h3>
                      {item.menu_details.vegornonveg === 'veg' ? (
                        <FaLeaf className="text-green-600 text-xs" />
                      ) : (
                        <FaFire className="text-red-600 text-xs" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.menu_details.menudescription}</p>
                   
                    <div className="mt-2">
                      {item.menu_details.menudiscountprice ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-gray-900">₹{item.menu_details.menudiscountprice}</span>
                          <span className="text-xs text-gray-500 line-through">₹{item.menu_details.menuprice}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">₹{item.menu_details.menuprice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center bg-orange-50 rounded-lg border border-orange-100">
                    <button
                      onClick={() => handleQuantityChange(item, 'dec')}
                      disabled={loading}
                      className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-50"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-2 font-medium text-sm text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, 'inc')}
                      disabled={loading}
                      className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-50"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                
                {/* GST information for each item */}
                {item.gst_percentage && (
                  <div className="mt-2 text-xs text-gray-500">
                    {/* Includes {item.gst_percentage}% GST: ₹{(parseFloat(item.gst_amount || "0") * parseInt(item.quantity)).toFixed(2)} */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button
          onClick={() => navigate('/home')}
          className="text-gray-500 flex flex-col items-center"
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
          onClick={() => navigate('/cart')}
          className="text-orange-500 flex flex-col items-center"
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart ({cart.reduce((total, item) => total + parseInt(item.quantity), 0)})</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>  
      </div>

      {/* Price Breakdown and Checkout */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
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
          
          {/* Price Breakdown Details */}
          {showPriceBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>GST</span>
                <span>₹{totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Delivery Fee</span>
                <span>{deliveryOption === 'delivery' ? 'To be calculated' : 'Free'}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-3 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Proceed to Pay'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;