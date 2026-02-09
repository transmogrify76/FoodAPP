import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import { 
  FaShoppingBag, FaTruck, FaMapMarkerAlt, FaCrosshairs, FaEdit, 
  FaPlus, FaMinus, FaArrowLeft, FaLeaf, FaFire, FaHome, 
  FaUserAlt, FaHistory, FaShoppingCart, FaReceipt, FaClock,
  FaPercentage, FaCreditCard, FaShieldAlt, FaTag,
  FaCheckCircle, FaExclamationTriangle, FaListAlt
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

// ✅ API Base URL
const API_BASE_URL = "http://192.168.0.103:5020";

// ✅ Initialize socket connection
const socket = io(API_BASE_URL, {
  transports: ["polling", "websocket"],
  upgrade: true,
  rememberUpgrade: true,
  path: "/socket.io",
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: false,
});

interface MenuDetails {
  created_at: string;
  final_price: string;
  foodtype: string;
  foodweight?: string;
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

interface PriceBreakdown {
  currency: string;
  discounts: Array<{
    amount: number;
    label: string;
    percentage: number;
    type: string;
  }>;
  subtotal: number;
  total_discount: number;
  total_payable: number;
}

interface CartResponse {
  cart_items: CartItem[];
  price_breakdown: PriceBreakdown;
  usercartid: string;
  userid: string;
}

// ✅ CORRECT Offer Response Interfaces
interface NewCustomerOfferResponse {
  discount_amount?: number;
  discount_percent?: number;
  offer_code?: string;
  message: string;
  status: "success";
  min_order_amount?: number;
  max_discount?: number;
  valid_until?: string;
  eligible?: true;
}

interface ExistingCustomerOfferResponse {
  currency: string;
  discount_percent: 0;
  eligible: false;
  message: string;
}

type FirstOrderOfferResponse = NewCustomerOfferResponse | ExistingCustomerOfferResponse;

interface OrderResponse {
  message: string;
  restaurant_id?: string;
  order_uids?: string[];
  base_price?: number;
  discount_percent?: number;
  final_amount?: number;
  error?: string;
  status?: string;
  order_number?: string;
  order_details?: any;
}

// ✅ Razorpay Order Interface
interface RazorpayOrderResponse {
  amount: number;
  currency: string;
  key: string;
  order_id: string;
  status: string;
}

// ✅ Razorpay Payment Options Interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
}

// ✅ Declare Razorpay in window object
declare global {
  interface Window {
    Razorpay: any;
  }
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
  const [offerData, setOfferData] = useState<FirstOrderOfferResponse | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    orderUids?: string[];
    orderDetails?: OrderResponse;
  }>({
    loading: false,
    success: false,
    error: null
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const cart = cartData?.cart_items || [];
  const priceBreakdown = cartData?.price_breakdown;
  const cartTotal = priceBreakdown?.total_payable || 0;
  const subtotal = priceBreakdown?.subtotal || 0;
  const totalDiscount = priceBreakdown?.total_discount || 0;

  // ✅ WebSocket Setup
  useEffect(() => {
    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setSocketConnected(true);
    };

    const onDisconnect = (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setSocketConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.warn("⚠️ Socket connect error:", err.message);
    };

    const onReconnectAttempt = (attemptNumber: number) => {
      console.log("🔄 Reconnect attempt:", attemptNumber);
    };

    // Attach listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("message");
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded?.userid;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  const getusercartidFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded?.usercartid;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
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
        `${API_BASE_URL}/cart/getcartbyuserid`,
        formData
      );
      setCartData(response.data);
      
      // Log for debugging
      console.log("📦 Cart data fetched:", {
        discounts: response.data.price_breakdown?.discounts,
        eligible: isOfferEligible(),
        offerData: offerData
      });
      
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch first order offer
  const fetchFirstOrderOffer = async () => {
    const userid = getUserIdFromToken();
    if (!userid) return;

    try {
      setOfferLoading(true);
      const response = await axios.post<FirstOrderOfferResponse>(
        `${API_BASE_URL}/offers/firstorder`,
        { userid }
      );
      
      const responseData = response.data;
      console.log("📊 Offer API Response:", responseData);
      
      // Always reset applied offer when fetching new data
      setAppliedOffer(false);
      
      // Set the offer data
      setOfferData(responseData);
      
      // Log for debugging
      if (responseData.eligible === false) {
        console.log("❌ User is NOT eligible for first order discount");
      } else if (responseData.eligible === true || responseData.status === "success") {
        console.log("✅ User IS eligible for first order discount");
      }
      
    } catch (error: any) {
      console.error("Error fetching offer:", error);
      setOfferData(null);
      setAppliedOffer(false);
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    if (state?.cart && state.cart.length > 0) {
      fetchCartItems();
    } else {
      fetchCartItems();
    }
    
    fetchFirstOrderOffer();
  }, []);

  // ✅ IMPROVED: Check if user is eligible
  const isOfferEligible = (): boolean => {
    if (!offerData) return false;
    
    console.log("🔍 Checking eligibility for offer:", offerData);
    
    // Check if it's a successful new customer offer
    if ('status' in offerData && offerData.status === "success") {
      const newCustomerOffer = offerData as NewCustomerOfferResponse;
      
      // Must have some discount
      const hasDiscount = (newCustomerOffer.discount_percent !== undefined && 
                         newCustomerOffer.discount_percent > 0) ||
                        (newCustomerOffer.discount_amount !== undefined && 
                         newCustomerOffer.discount_amount > 0);
      
      // Check minimum order amount if specified
      if (newCustomerOffer.min_order_amount && cartData) {
        const cartSubtotal = priceBreakdown?.subtotal || 0;
        if (cartSubtotal < newCustomerOffer.min_order_amount) {
          console.log(`❌ Cart subtotal ${cartSubtotal} < min order ${newCustomerOffer.min_order_amount}`);
          return false;
        }
      }
      
      console.log(`✅ Offer eligibility check: ${hasDiscount ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
      return hasDiscount;
    }
    
    // Check if eligible is explicitly true
    if ('eligible' in offerData && offerData.eligible === true) {
      return true;
    }
    
    // For existing customers (eligible: false, discount_percent: 0)
    console.log("❌ User is not eligible (existing customer or no discount)");
    return false;
  };

  const getItemDiscountAmount = (item: CartItem) => {
    const originalPrice = parseFloat(item.menu_details.menuprice);
    const discountPrice = parseFloat(item.menu_details.menudiscountprice);
    const quantity = parseInt(item.quantity);
    
    if (originalPrice > discountPrice) {
      return (originalPrice - discountPrice) * quantity;
    }
    return 0;
  };

  const totalItemDiscount = cart.reduce((sum, item) => sum + getItemDiscountAmount(item), 0);

  const handleApplyOffer = () => {
    if (isOfferEligible()) {
      setAppliedOffer(true);
      alert("First order discount applied successfully!");
    } else {
      alert("You are not eligible for the first order discount.");
      setAppliedOffer(false);
    }
  };

  const handleRemoveOffer = () => {
    setAppliedOffer(false);
  };

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
        ? `${API_BASE_URL}/cart/incquantity`
        : `${API_BASE_URL}/cart/decquantity`;

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

  // ✅ Create Razorpay Order
  // Update the createRazorpayOrder function
const createRazorpayOrder = async (amount: number): Promise<RazorpayOrderResponse> => {
  const userid = getUserIdFromToken();
  if (!userid) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("🔄 Creating Razorpay order for amount:", amount);
    
    // Use the same API_BASE_URL
    const response = await axios.post<RazorpayOrderResponse>(
      `${API_BASE_URL}/wallet/recharge/create-order`,
      {
        userid: userid,
        amount: Math.round(amount * 100).toString() 
      }
    );

    if (response.data.status !== "success") {
      throw new Error("Failed to create Razorpay order");
    }

    console.log("✅ Razorpay order created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Razorpay order creation failed:", error);
    throw new Error(error.response?.data?.message || "Payment initialization failed");
  }
};
  // ✅ Load Razorpay Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("✅ Razorpay script loaded");
        resolve(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // ✅ Initialize Razorpay Payment
  const initializeRazorpayPayment = async (razorpayOrder: RazorpayOrderResponse) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Failed to load payment gateway");
    }

    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Foodie Heaven",
        description: "Order Payment",
        order_id: razorpayOrder.order_id,
        handler: async (response: any) => {
          console.log("✅ Payment successful:", response);
         
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999"
        },
        notes: {
          order_type: "Food Order",
          cart_id: cartData?.usercartid || ""
        },
        theme: {
          color: "#F37254"
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', (response: any) => {
        console.error("❌ Payment failed:", response.error);
        reject(new Error(`Payment failed: ${response.error.description || "Unknown error"}`));
      });

      razorpayInstance.open();
    });
  };

  // ✅ COMPLETE ORDER CREATION WITH RAZORPAY PAYMENT
  const handleCheckout = async () => {
    if (deliveryOption === "delivery" && !deliveryLocation.address) {
      alert("Please select a delivery location");
      return;
    }

    const userId = getUserIdFromToken();
    const usercartid = getusercartidFromToken();
    
    if (!userId || !usercartid) {
      alert("User not authenticated. Please login again.");
      return;
    }

    // Double check eligibility before proceeding
    if (appliedOffer && !isOfferEligible()) {
      alert("You are not eligible for the first order discount. The discount has been removed.");
      setAppliedOffer(false);
      return;
    }

    // Start payment processing
    setPaymentProcessing(true);
    setOrderStatus({
      loading: true,
      success: false,
      error: null
    });

    try {
      // 1. Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(cartTotal);
      
      // 2. Initialize Razorpay payment
      const paymentResult = await initializeRazorpayPayment(razorpayOrder);
      console.log("✅ Payment completed:", paymentResult);

      // 3. Create order via socket after successful payment
      if (!socketConnected) {
        alert("Cannot connect to server. Please check your connection and try again.");
        return;
      }

      const orderResult = await createOrderViaSocket();
      
     
      setOrderStatus({
        loading: false,
        success: true,
        error: null,
        orderUids: orderResult.orderUids,
        orderDetails: orderResult.orderDetails
      });

      
      fetchCartItems();
      
    } catch (error: any) {
      console.error("❌ Checkout failed:", error);
      
      setOrderStatus({
        loading: false,
        success: false,
        error: error.message || "Payment failed. Please try again."
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const createOrderViaSocket = (): Promise<{ orderUids?: string[], orderDetails: OrderResponse }> => {
    return new Promise((resolve, reject) => {
      const userId = getUserIdFromToken();
      const usercartid = getusercartidFromToken();
      
      if (!userId || !usercartid) {
        reject(new Error("User not authenticated"));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error("Order creation timed out. Please try again."));
      }, 30000);

      const onOrderResponse = (response: OrderResponse) => {
        clearTimeout(timeoutId);
        socket.off("message", onOrderResponse);
        
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.message?.toLowerCase().includes("success")) {
          resolve({
            orderUids: response.order_uids,
            orderDetails: response
          });
        } else {
          resolve({
            orderUids: response.order_uids,
            orderDetails: response
          });
        }
      };

      socket.on("message", onOrderResponse);

      const orderPayload: any = {
        usercartid,
        userid: userId,
        temporarylocation: deliveryOption === "delivery" 
          ? deliveryLocation.address || (deliveryLocation.coordinates 
              ? `${deliveryLocation.coordinates.lat},${deliveryLocation.coordinates.lng}` 
              : "delivery")
          : "takeaway",
      };

      if (appliedOffer && isOfferEligible() && offerData && 'offer_code' in offerData && offerData.offer_code) {
        console.log("✅ Sending offer code:", offerData.offer_code);
        orderPayload.offer_code = offerData.offer_code;
      } else {
        console.log("❌ Not sending offer code - Not eligible or no offer code");
      }

      console.log("📤 Emitting createorder with payload:", orderPayload);
      socket.emit("createorder", orderPayload);
    });
  };

  const getDeliveryTime = () => {
    return deliveryOption === "delivery" ? "25-35 mins" : "15-20 mins";
  };

  const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);

  const OfferSection = () => {
    if (offerLoading) {
      return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Checking available offers...</span>
          </div>
        </div>
      );
    }

    if (!offerData || !isOfferEligible()) {

      if (offerData && offerData.eligible === false) {
        return (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center gap-2">
              <FaTag className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">First Order Offer</p>
                <p className="text-xs text-gray-600">{offerData.message}</p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    }

    const eligibleOffer = offerData as NewCustomerOfferResponse;

    if (appliedOffer) {
      return (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaTag className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {eligibleOffer.offer_code || "First Order Offer"} Applied
                </p>
                <p className="text-xs text-green-600">
                  {eligibleOffer.discount_amount 
                    ? `₹${eligibleOffer.discount_amount} off`
                    : `${eligibleOffer.discount_percent}% off`}
                </p>
              </div>
            </div>
            <button 
              onClick={handleRemoveOffer}
              className="text-red-600 text-sm font-medium hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaTag className="text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Welcome Offer Available!
              </p>
              <p className="text-xs text-orange-600">
                {eligibleOffer.discount_amount 
                  ? `Get ₹${eligibleOffer.discount_amount} off on your first order`
                  : `Get ${eligibleOffer.discount_percent}% off on your first order${eligibleOffer.max_discount ? ` (up to ₹${eligibleOffer.max_discount})` : ''}`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleApplyOffer}
            className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // ✅ Render order status modal
  const renderOrderStatusModal = () => {
    if (!orderStatus.loading && !orderStatus.success && !orderStatus.error) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          {orderStatus.loading && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Your Order</h3>
              <p className="text-gray-600">Please wait while we process your order...</p>
            </div>
          )}

          {orderStatus.success && orderStatus.orderDetails && (
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Created Successfully!</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-green-700 mb-2">
                  <strong>Status:</strong> {orderStatus.orderDetails.message}
                </p>
                
                {orderStatus.orderUids && orderStatus.orderUids.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Order IDs:</p>
                    {orderStatus.orderUids.map((uid, index) => (
                      <p key={index} className="text-sm text-gray-600 font-mono">
                        {uid.substring(0, 8)}...
                      </p>
                    ))}
                  </div>
                )}
                
                {orderStatus.orderDetails.final_amount && (
                  <p className="text-sm text-gray-700">
                    <strong>Final Amount:</strong> ₹{orderStatus.orderDetails.final_amount.toFixed(2)}
                  </p>
                )}
                
                {orderStatus.orderDetails.discount_percent && orderStatus.orderDetails.discount_percent > 0 && (
                  <p className="text-sm text-green-600">
                    <strong>Discount Applied:</strong> {orderStatus.orderDetails.discount_percent}%
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate("/history")}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <FaListAlt />
                  View Order History
                </button>
                
                <button 
                  onClick={() => navigate("/home")}
                  className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <FaShoppingBag />
                  Continue Shopping
                </button>
                
                <button 
                  onClick={() => {
                    setOrderStatus({ loading: false, success: false, error: null });
                    fetchCartItems(); // Refresh cart
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {orderStatus.error && (
            <div className="text-center">
              <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Failed</h3>
              <p className="text-gray-600 mb-4">{orderStatus.error}</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setOrderStatus({ loading: false, success: false, error: null })}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate("/home")}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-32">
      {/* Order Status Modal */}
      {renderOrderStatusModal()}

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
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs opacity-75">
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
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

      {/* ✅ CORRECT Offer Section */}
      <div className="px-4 pt-4">
        <OfferSection />
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
              {totalItemDiscount > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <FaPercentage className="text-xs" />
                  <span>Save ₹{totalItemDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.menu_details.images && item.menu_details.images.length > 0 ? (
                        <img 
                          src={`${API_BASE_URL}/${item.menu_details.images[0]}`}
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
                          Save ₹{getItemDiscountAmount(item).toFixed(2)}
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
      {cart.length > 0 && cartData && (
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
              <p className="font-bold text-gray-900">₹{cartTotal.toFixed(2)}</p>
            </div>
          </div>

          {showPriceBreakdown && priceBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {totalItemDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Item Discount</span>
                  <span>-₹{totalItemDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* ✅ FIXED: Filter out first order discount if user is not eligible */}
              {priceBreakdown.discounts && priceBreakdown.discounts.length > 0 && (
                priceBreakdown.discounts
                  .filter(discount => {
                    // Filter out first order discount if user is not eligible
                    if (discount.label.toLowerCase().includes('first order') || 
                        discount.label.toLowerCase().includes('first order')) {
                      return isOfferEligible();
                    }
                    return true;
                  })
                  .map((discount, index) => (
                    <div key={index} className="flex justify-between text-xs text-green-600">
                      <span>{discount.label} ({discount.percentage}%)</span>
                      <span>-₹{discount.amount.toFixed(2)}</span>
                    </div>
                  ))
              )}

              {/* ✅ Only show "will be applied" message if:
                  1. Offer is applied by user
                  2. User is eligible for the offer
                  3. The discount is not already in the price breakdown */}
              {appliedOffer && isOfferEligible() && offerData && 'discount_percent' in offerData && 
               !priceBreakdown.discounts?.some(d => 
                 d.label.toLowerCase().includes('first order') || 
                 d.label.toLowerCase().includes('first order')
               ) && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>
                    First Order Discount 
                    {'discount_amount' in offerData && offerData.discount_amount 
                      ? ` (₹${offerData.discount_amount} off)`
                      : ` (${offerData.discount_percent}% off)`}
                  </span>
                  <span>Will be applied at checkout</span>
                </div>
              )}

              {deliveryOption === 'delivery' && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={loading || paymentProcessing || !socketConnected}
            className="w-full mt-3 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {paymentProcessing || orderStatus.loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {paymentProcessing ? 'Processing Payment...' : 'Creating Order...'}
              </>
            ) : (
              <>
                <FaCreditCard />
                {!socketConnected ? 'Connecting...' : `Pay Now - ₹${cartTotal.toFixed(2)}`}
              </>
            )}
          </button>

          {/* Connection status message */}
          {!socketConnected && (
            <p className="text-xs text-red-600 text-center mt-2">
              Waiting for server connection. Please check your internet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;