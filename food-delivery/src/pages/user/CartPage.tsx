import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import {
  FaShoppingBag, FaTruck, FaMapMarkerAlt, FaCrosshairs, FaEdit,
  FaPlus, FaMinus, FaArrowLeft, FaLeaf, FaFire, FaHome,
  FaUserAlt, FaHistory, FaShoppingCart, FaReceipt, FaClock,
  FaPercentage, FaShieldAlt, FaTag,
  FaCheckCircle, FaExclamationTriangle, FaListAlt, FaWallet
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

const API_BASE_URL = "http://192.168.0.103:5020";

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

interface OrderCreateRequest {
  userid: string;
  usercartid: string;
  items: Array<{ menuid: string; quantity: number }>;
  restaurantid: string;
  paymentmethod: "wallet";
  orderinstruction?: string;
}

interface OrderCreateResponse {
  data: {
    created_at: string;
    final_price: number;
    items: string[];
    master_order_id: string;
    restaurantid: string;
    status: string;
    updated_at: string;
    userid: string;
  };
  message: string;
  status: string;
}

interface WalletPayRequest {
  userid: string;
  master_order_id: string;
  paymentmethod: "wallet";
}

interface WalletPayResponse {
  data: {
    orders_paid_count: number;
    status: string;
    transaction: {
      amount: number;
      created_at: string;
      ref_id: string;
      status: string;
      type: string;
      uid: string;
      userid: string;
      walletid: string;
    };
    wallet: {
      balance: number;
      created_at: string;
      transactions: any[];
      updated_at: string;
      userid: string;
      walletid: string;
    };
  };
  message: string;
  status: string;
  userid: string;
}

interface WalletBalanceResponse {
  balance: number;
  status: string;
  transactions: any[];
  userid: string;
  walletid: string;
}

interface OrderStatusResponse {
  order: {
    _id: string;
    base_price: number;
    created_at: string;
    final_price: number;
    master_order_id: string;
    menuid: string;
    paid_at: string;
    payment_method: string;
    payment_mode: string;
    payment_status: string;
    quantity: number;
    restaurantid: string;
    status: string;
    temporarylocation: string;
    uid: string;
    updated_at: string;
    userid: string;
    wallet_txn_id: string;
  };
  status: string;
}

interface MenuItemImageProps {
  imagePath: string;
  alt: string;
  className?: string;
}

const MenuItemImage: React.FC<MenuItemImageProps> = ({ imagePath, alt, className = "" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      if (!imagePath) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const response = await axios.post(
          `${API_BASE_URL}/menu/media/serve`,
          { path: imagePath },
          {
            responseType: "blob",
            headers: { "Content-Type": "application/json" }
          }
        );

        if (response.status === 200) {
          const blob = response.data;
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("❌ Failed to load menu image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imagePath]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
        <FaShoppingBag className="text-gray-400" />
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={`w-full h-full object-cover ${className}`} />;
};

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
  const [socketConnected, setSocketConnected] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    orderId?: string;
    orderDetails?: OrderCreateResponse["data"];
  }>({
    loading: false,
    success: false,
    error: null,
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const cart = cartData?.cart_items || [];
  const priceBreakdown = cartData?.price_breakdown;
  const cartTotal = priceBreakdown?.total_payable || 0;
  const subtotal = priceBreakdown?.subtotal || 0;
  const totalDiscount = priceBreakdown?.total_discount || 0;

  // ---------- Socket connection ----------
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

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  // ---------- Token helpers ----------
  const getUserIdFromToken = (): string | null => {
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

  const getusercartidFromToken = (): string | null => {
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

  // ---------- Data fetching ----------
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
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async (): Promise<number | null> => {
    const userid = getUserIdFromToken();
    if (!userid) return null;

    try {
      setWalletLoading(true);
      const response = await axios.post<WalletBalanceResponse>(
        `${API_BASE_URL}/wallet/balance`,
        { userid }
      );
      if (response.data.status === "success") {
        setWalletBalance(response.data.balance);
        return response.data.balance;
      }
      return null;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return null;
    } finally {
      setWalletLoading(false);
    }
  };

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
      setOfferData(responseData);
    } catch (error: any) {
      console.error("Error fetching offer:", error);
      setOfferData(null);
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchFirstOrderOffer();
    fetchWalletBalance();
  }, []);

  // ---------- Helper functions ----------
  const isOfferEligible = (): boolean => {
    if (!offerData) return false;
    if ("status" in offerData && offerData.status === "success") {
      const newCustomerOffer = offerData as NewCustomerOfferResponse;
      const hasDiscount =
        (newCustomerOffer.discount_percent !== undefined && newCustomerOffer.discount_percent > 0) ||
        (newCustomerOffer.discount_amount !== undefined && newCustomerOffer.discount_amount > 0);
      if (newCustomerOffer.min_order_amount && cartData) {
        const cartSubtotal = priceBreakdown?.subtotal || 0;
        if (cartSubtotal < newCustomerOffer.min_order_amount) return false;
      }
      return hasDiscount;
    }
    if ("eligible" in offerData && offerData.eligible === true) return true;
    return false;
  };

  // Used for per‑item savings display (optional)
  const getItemDiscountAmount = (item: CartItem) => {
    if (!item.menu_details) return 0;
    const originalPrice = parseFloat(item.menu_details.menuprice || '0');
    const discountPrice = parseFloat(item.menu_details.menudiscountprice || '0');
    const quantity = parseInt(item.quantity || '0');
    if (originalPrice > discountPrice) {
      return (originalPrice - discountPrice) * quantity;
    }
    return 0;
  };

  // ---------- Handlers ----------
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        fetchWalletBalance();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (): Promise<OrderCreateResponse["data"]> => {
    const userid = getUserIdFromToken();
    const usercartid = getusercartidFromToken();
    if (!userid || !usercartid) throw new Error("User not authenticated");

    if (cart.length === 0) throw new Error("Cart is empty");

    const restaurantid = cart[0].restaurantid;
    const hasMultipleRestaurants = cart.some(item => item.restaurantid !== restaurantid);
    if (hasMultipleRestaurants) {
      throw new Error("Cannot place order from multiple restaurants at once");
    }

    const items = cart.map(item => ({
      menuid: item.menuid,
      quantity: parseInt(item.quantity)
    }));

    const payload: OrderCreateRequest = {
      userid,
      usercartid,
      items,
      restaurantid,
      paymentmethod: "wallet",
      orderinstruction: deliveryOption === "delivery" ? `Deliver to: ${deliveryLocation.address}` : "Takeaway"
    };

    console.log("📤 Creating order with payload:", payload);

    const response = await axios.post<OrderCreateResponse>(
      `${API_BASE_URL}/order/create`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Order creation failed");
    }

    console.log("✅ Order created:", response.data.data);
    return response.data.data;
  };

  const payViaWallet = async (masterOrderId: string): Promise<WalletPayResponse["data"]> => {
    const userid = getUserIdFromToken();
    if (!userid) throw new Error("User not authenticated");

    const payload: WalletPayRequest = {
      userid,
      master_order_id: masterOrderId,
      paymentmethod: "wallet"
    };

    console.log("💰 Paying via wallet with payload:", payload);

    const response = await axios.post<WalletPayResponse>(
      `${API_BASE_URL}/wallet/pay`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Wallet payment failed");
    }

    console.log("✅ Wallet payment successful:", response.data.data);
    return response.data.data;
  };

  const checkOrderStatus = async (masterOrderId: string): Promise<OrderStatusResponse["order"]> => {
    const response = await axios.post<OrderStatusResponse>(
      `${API_BASE_URL}/order/status/check`,
      { master_order_id: masterOrderId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data.order;
  };

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

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    let currentBalance = walletBalance;
    if (currentBalance === null) {
      currentBalance = await fetchWalletBalance();
    }
    if (currentBalance === null) {
      alert("Unable to fetch wallet balance. Please try again.");
      return;
    }

    if (currentBalance < cartTotal) {
      alert(`Insufficient wallet balance. Please recharge your wallet.`);
      navigate("/wallet");
      return;
    }

    setOrderStatus({ loading: true, success: false, error: null });

    try {
      const orderData = await createOrder();
      const masterOrderId = orderData.master_order_id;
      const paymentData = await payViaWallet(masterOrderId);
      // Optional: check order status (may fail, but order is already paid)
      await checkOrderStatus(masterOrderId).catch(err => {
        console.warn("Status check failed, but order is already paid:", err);
      });

      setWalletBalance(paymentData.wallet.balance);
      setOrderStatus({
        loading: false,
        success: true,
        error: null,
        orderId: masterOrderId,
        orderDetails: orderData
      });

      fetchCartItems(); // refresh cart after successful payment
    } catch (error: any) {
      console.error("❌ Checkout failed:", error);
      setOrderStatus({
        loading: false,
        success: false,
        error: error.message || "Checkout failed. Please try again."
      });
    }
  };

  const getDeliveryTime = () => {
    return deliveryOption === "delivery" ? "25-35 mins" : "15-20 mins";
  };

  const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);

  // ---------- Offer Section (now inside component to access priceBreakdown) ----------
  const OfferSection = () => {
    // Look for a first‑order discount in the price breakdown
    const firstOrderDiscount = priceBreakdown?.discounts?.find(d =>
      d.label.toLowerCase().includes('first order')
    );

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

    // If a first‑order discount is present in the breakdown, show it as applied
    if (firstOrderDiscount) {
      return (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
          <div className="flex items-center gap-2">
            <FaTag className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                First Order Offer Applied
              </p>
              <p className="text-xs text-green-600">
                {firstOrderDiscount.percentage
                  ? `${firstOrderDiscount.percentage}% off`
                  : `₹${firstOrderDiscount.amount.toFixed(2)} off`}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // No first‑order discount in breakdown → use offer API data
    if (!offerData) return null;

    // Not eligible
    if ('eligible' in offerData && offerData.eligible === false) {
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

    // Eligible but discount not yet applied? (should not happen if backend applies automatically)
    const eligibleOffer = offerData as NewCustomerOfferResponse;
    return (
      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
        <div className="flex items-center gap-2">
          <FaTag className="text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-800">
              {eligibleOffer.offer_code || "First Order Offer"} Available
            </p>
            <p className="text-xs text-orange-600">
              {eligibleOffer.discount_amount
                ? `Get ₹${eligibleOffer.discount_amount} off`
                : `Get ${eligibleOffer.discount_percent}% off`}
              {eligibleOffer.max_discount && ` (up to ₹${eligibleOffer.max_discount})`}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Your Order</h3>
              <p className="text-gray-600">Please wait while we place your order...</p>
            </div>
          )}

          {orderStatus.success && orderStatus.orderDetails && (
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Placed Successfully!</h3>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-green-700 mb-2">
                  <strong>Status:</strong> {orderStatus.orderDetails.status}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Order ID:</strong> {orderStatus.orderId?.substring(0, 8)}...
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total Amount:</strong> ₹{orderStatus.orderDetails.final_price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Paid via Wallet • Thank you for ordering!
                </p>
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
                  onClick={() => {
                    setOrderStatus({ loading: false, success: false, error: null });
                    navigate("/home");
                  }}
                  className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <FaShoppingBag />
                  Continue Shopping
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

  // ---------- Main render ----------
  return (
    <div className="min-h-screen bg-orange-50 pb-80">
      {renderOrderStatusModal()}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                onClick={() => navigate("/home")}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/history")}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
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
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="Logo"
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">Your Cart</h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs opacity-75">
              {socketConnected ? "Connected" : "Disconnected"}
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
            onClick={() => setDeliveryOption("takeaway")}
            className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${
              deliveryOption === "takeaway"
                ? "bg-orange-100 border border-orange-300 text-orange-700"
                : "bg-gray-50 border border-gray-200 text-gray-700"
            }`}
          >
            <FaShoppingBag className="text-xl" />
            <span className="text-sm font-medium">Takeaway</span>
          </button>
          <button
            onClick={() => setDeliveryOption("delivery")}
            className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${
              deliveryOption === "delivery"
                ? "bg-orange-100 border border-orange-300 text-orange-700"
                : "bg-gray-50 border border-gray-200 text-gray-700"
            }`}
          >
            <FaTruck className="text-xl" />
            <span className="text-sm font-medium">Delivery</span>
          </button>
        </div>

        {deliveryOption === "delivery" && (
          <div className="space-y-3">
            {!deliveryLocation.address ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLocationSelection("current")}
                  className="p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-orange-50 border border-gray-200"
                >
                  <FaCrosshairs className="text-orange-600 text-lg" />
                  <span className="text-xs text-gray-700">Current Location</span>
                </button>
                <button
                  onClick={() => handleLocationSelection("manual")}
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
                    setDeliveryLocation({ address: "" });
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

      {/* Wallet Balance */}
      {walletBalance !== null && (
        <div className="px-4 pt-2">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaWallet className="text-orange-500" />
              <span className="text-sm text-gray-700">Wallet Balance</span>
            </div>
            <span className="font-semibold text-gray-900">₹{walletBalance.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Offer Section */}
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
              onClick={() => navigate("/home")}
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
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.menu_details?.images && item.menu_details.images.length > 0 ? (
                        <MenuItemImage
                          imagePath={item.menu_details.images[0]}
                          alt={item.menu_details?.menuname || 'Item'}
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
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.menu_details?.menuname || 'Item not available'}
                        </h3>
                        {item.menu_details?.vegornonveg === "veg" ? (
                          <FaLeaf className="text-green-600 text-xs flex-shrink-0" />
                        ) : (
                          <FaFire className="text-red-600 text-xs flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {item.menu_details?.menudescription || 'No description'}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-900">
                          ₹{item.menu_details?.menudiscountprice || '0'}
                        </span>
                        {item.menu_details?.menudiscountpercent !== "0" && item.menu_details?.menuprice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{item.menu_details.menuprice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center bg-orange-50 rounded-lg border border-orange-100">
                        <button
                          onClick={() => handleQuantityChange(item, "dec")}
                          disabled={loading || parseInt(item.quantity) <= 1}
                          className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-30"
                        >
                          <FaMinus />
                        </button>
                        <span className="px-2 font-medium text-sm text-gray-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, "inc")}
                          disabled={loading}
                          className="px-3 py-1 text-gray-700 hover:text-orange-600 disabled:opacity-50"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    {item.menu_details?.menudiscountpercent !== "0" && item.menu_details && (
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-green-600 font-medium">
                          Save ₹{getItemDiscountAmount(item).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          ₹{(parseFloat(item.menu_details?.menudiscountprice || '0') * parseInt(item.quantity)).toFixed(2)}
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
        <button onClick={() => navigate("/home")} className="text-gray-500 flex flex-col items-center">
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate("/history")} className="text-gray-500 flex flex-col items-center">
          <FaListAlt className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button onClick={() => navigate("/cart")} className="text-orange-500 flex flex-col items-center">
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart ({totalItems})</span>
        </button>
        <button onClick={() => navigate("/wallet")} className="text-gray-500 flex flex-col items-center">
          <FaWallet className="text-lg" />
          <span className="text-xs mt-1">Wallet</span>
        </button>
        <button onClick={() => navigate("/profile")} className="text-gray-500 flex flex-col items-center">
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>

      {/* Checkout Footer */}
      {cart.length > 0 && cartData && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-3">
            <FaShieldAlt className="text-green-500" />
            <span>Secure checkout • Pay with Wallet</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
              className="flex items-center text-sm text-orange-600 font-medium"
            >
              <FaReceipt className="mr-1" />
              {showPriceBreakdown ? "Hide" : "Show"} Price Breakdown
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

              {priceBreakdown.discounts && priceBreakdown.discounts.length > 0 && (
                <>
                  {priceBreakdown.discounts.map((discount, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-green-600">
                      <span>{discount.label}</span>
                      <span>-₹{discount.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
                  {/* Optional total discount line */}
                  <div className="flex justify-between text-xs text-green-600 font-medium">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                </>
              )}

              {deliveryOption === "delivery" && (
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

          {walletBalance !== null && walletBalance < cartTotal && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <FaExclamationTriangle />
              <span>Insufficient balance. Please recharge your wallet.</span>
              <button
                onClick={() => navigate("/wallet")}
                className="ml-auto text-red-600 font-medium hover:underline"
              >
                Recharge
              </button>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={
              loading ||
              orderStatus.loading ||
              !socketConnected ||
              (walletBalance !== null && walletBalance < cartTotal)
            }
            className="w-full mt-3 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {orderStatus.loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Placing Order...
              </>
            ) : (
              <>
                <FaWallet />
                {!socketConnected
                  ? "Connecting..."
                  : walletBalance !== null && walletBalance < cartTotal
                    ? "Insufficient Balance"
                    : `Pay ₹${cartTotal.toFixed(2)} via Wallet`}
              </>
            )}
          </button>

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