import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  FaWallet, FaArrowLeft, FaPlus, FaCheck,
  FaHistory, FaHome, FaUserAlt, FaShoppingCart,
  FaRupeeSign, FaCreditCard, FaShieldAlt,
  FaClock, FaExchangeAlt, FaReceipt, FaListAlt,
  FaArrowUp, FaArrowDown, FaSyncAlt
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

// ✅ API Base URL
const API_BASE_URL = "http://192.168.0.103:5020";

interface Transaction {
  amount: number;
  created_at: string;
  ref_id: string;
  type: "CREDIT" | "DEBIT";
  status?: string;
}

interface WalletBalanceResponse {
  balance: number;
  status: string;
  transactions: Transaction[];
  userid: string;
  walletid: string;
}

interface CreateRazorpayOrderResponse {
  amount: number;
  currency: string;
  message: string;
  razorpay_order_id: string;
  status: string;
  userid: string;
  walletid: string;
}

interface VerifyPaymentResponse {
  balance: number;
  message: string;
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
  userid: string;
  walletid: string;
}

// Declare Razorpay in window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletId, setWalletId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [rechargeLoading, setRechargeLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    message?: string;
  }>({
    loading: false,
    success: false,
    error: null
  });

  const predefinedAmounts = [100, 200, 500, 1000, 2000, 5000];

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

  // ✅ Fetch Wallet Balance with Transactions
  const fetchWalletBalance = async () => {
    const userid = getUserIdFromToken();
    if (!userid) {
      console.error("User not authenticated");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching wallet balance for user:", userid);
      
      const response = await axios.post<WalletBalanceResponse>(
        `${API_BASE_URL}/wallet/balance`,
        { userid }
      );

      console.log("📊 Wallet balance response:", response.data);

      if (response.data.status === "success") {
        setBalance(response.data.balance);
        setTransactions(response.data.transactions || []);
        setWalletId(response.data.walletid || "");
      } else {
        console.error("Failed to fetch wallet balance:", response.data);
      }
    } catch (error: any) {
      console.error("❌ Error fetching wallet balance:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create Razorpay Order
  const createRazorpayOrder = async (amount: number): Promise<CreateRazorpayOrderResponse> => {
    const userid = getUserIdFromToken();
    if (!userid) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("🔄 Creating Razorpay order for amount:", amount);
      
      const response = await axios.post<CreateRazorpayOrderResponse>(
        `${API_BASE_URL}/wallet/recharge/wallet-order`,
        {
          userid: userid,
          amount: amount
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Razorpay order response:", response.data);
      
      if (response.data.status !== "pending_payment") {
        throw new Error(response.data.message || "Failed to create Razorpay order");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Razorpay order creation failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw new Error(error.response?.data?.message || "Payment initialization failed. Please try again.");
    }
  };

  // ✅ Verify Payment
  const verifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<VerifyPaymentResponse> => {
    const userid = getUserIdFromToken();
    if (!userid) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("🔄 Verifying payment...");
      
      const response = await axios.post<VerifyPaymentResponse>(
        `${API_BASE_URL}/wallet/recharge/verify`,
        {
          userid: userid,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Payment verification response:", response.data);
      
      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Payment verification failed");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Payment verification failed:", error);
      throw new Error(error.response?.data?.message || "Payment verification failed");
    }
  };

  // ✅ Load Razorpay Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log("✅ Razorpay already loaded");
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
  const initializeRazorpayPayment = async (orderData: CreateRazorpayOrderResponse) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Failed to load payment gateway");
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: "rzp_test_nzmqxQYhvCH9rD", // Razorpay test key - Replace with your actual key
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency || "INR",
        name: "Foodie Heaven Wallet",
        description: `Wallet Recharge - ₹${orderData.amount}`,
        order_id: orderData.razorpay_order_id,
        handler: async (response: any) => {
          console.log("✅ Payment successful:", response);
          
          try {
            // Verify payment
            const verifyResult = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            resolve({
              ...response,
              verified: true,
              verifyResult
            });
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999"
        },
        notes: {
          purpose: "Wallet Recharge",
          amount: orderData.amount.toString(),
          userid: orderData.userid,
          walletid: orderData.walletid
        },
        theme: {
          color: "#F37254"
        },
        modal: {
          ondismiss: () => {
            console.log("❌ Payment modal dismissed by user");
            reject(new Error("Payment cancelled by user"));
          }
        }
      };

      console.log("🎯 Opening Razorpay modal with options:", options);

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', (response: any) => {
        console.error("❌ Payment failed:", response.error);
        reject(new Error(`Payment failed: ${response.error.description || response.error.reason || "Unknown error"}`));
      });

      razorpayInstance.open();
    });
  };

  // ✅ Handle Wallet Recharge with Razorpay
  const handleRecharge = async (amount: number | string) => {
    const rechargeAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!rechargeAmount || rechargeAmount < 1) {
      alert("Please enter a valid amount");
      return;
    }

    if (rechargeAmount > 100000) {
      alert("Maximum recharge amount is ₹100,000");
      return;
    }

    setRechargeLoading(true);
    setPaymentStatus({
      loading: true,
      success: false,
      error: null,
      message: "Initializing payment..."
    });

    try {
      console.log(`💰 Starting recharge for ₹${rechargeAmount}`);
      
      // 1. Create Razorpay order
      const orderResponse = await createRazorpayOrder(rechargeAmount);
      
      console.log("✅ Razorpay order created:", orderResponse);
      
      // 2. Initialize Razorpay payment
      setPaymentStatus({
        loading: true,
        success: false,
        error: null,
        message: "Opening payment gateway..."
      });
      
      const paymentResult = await initializeRazorpayPayment(orderResponse);
      
      console.log("✅ Payment completed:", paymentResult);
      
      // 3. Refresh wallet data
      await fetchWalletBalance();
      
      // 4. Show success message
      setPaymentStatus({
        loading: false,
        success: true,
        error: null,
        message: `₹${rechargeAmount} added to your wallet successfully!`
      });
      
      // 5. Reset form
      setRechargeAmount("");
      setCustomAmount("");
      setShowCustomInput(false);
      
    } catch (error: any) {
      console.error("❌ Recharge failed:", error);
      setPaymentStatus({
        loading: false,
        success: false,
        error: error.message || "Payment failed. Please try again."
      });
    } finally {
      setRechargeLoading(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setRechargeAmount(amount.toString());
    setCustomAmount("");
    setShowCustomInput(false);
  };

  const handleCustomAmount = () => {
    setShowCustomInput(true);
    setRechargeAmount("");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' • ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Date format error";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Refresh wallet data
  const handleRefresh = () => {
    fetchWalletBalance();
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // ✅ Render payment status modal
  const renderPaymentStatusModal = () => {
    if (!paymentStatus.loading && !paymentStatus.success && !paymentStatus.error) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
          {paymentStatus.loading && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h3>
              <p className="text-gray-600">{paymentStatus.message}</p>
            </div>
          )}

          {paymentStatus.success && (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">{paymentStatus.message}</p>
              <button 
                onClick={() => setPaymentStatus({ loading: false, success: false, error: null })}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {paymentStatus.error && (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExchangeAlt className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">{paymentStatus.error}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPaymentStatus({ loading: false, success: false, error: null })}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setPaymentStatus({ loading: false, success: false, error: null });
                    if (rechargeAmount) {
                      handleRecharge(rechargeAmount);
                    }
                  }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Payment Status Modal */}
      {renderPaymentStatusModal()}

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
              <button onClick={() => navigate('/home')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700 transition-colors">
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/history')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700 transition-colors">
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/cart')} className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700 transition-colors">
                <FaShoppingCart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Cart</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/wallet')} className="flex items-center w-full p-3 rounded-lg bg-orange-100 text-orange-700">
                <FaWallet className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Wallet</span>
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
            <FaWallet className="mr-2" />
            <h1 className="text-lg font-bold">My Wallet</h1>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="text-lg"
          >
            <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-orange-100 text-sm opacity-90">Available Balance</p>
                <div className="flex items-baseline mt-2">
                  <FaRupeeSign className="text-2xl mr-1 opacity-90" />
                  <h2 className="text-5xl font-bold">
                    {loading ? (
                      <span className="inline-block w-32 h-12 bg-orange-400 rounded animate-pulse"></span>
                    ) : (
                      formatCurrency(balance)
                    )}
                  </h2>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <FaWallet className="text-2xl" />
              </div>
            </div>
            
            {walletId && (
              <div className="mt-4 pt-4 border-t border-orange-400 border-opacity-30">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">Wallet ID:</span>
                  <code className="bg-white bg-opacity-10 px-2 py-1 rounded text-xs font-mono">
                    {walletId.substring(0, 8)}...
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recharge Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaPlus className="text-orange-500" />
              Add Money to Wallet
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FaShieldAlt className="text-green-500" />
              <span>100% Secure</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Add money to your wallet for faster checkout and easy payments
          </p>

          {/* Predefined Amounts */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                  rechargeAmount === amount.toString()
                    ? 'border-orange-500 bg-orange-50 text-orange-700 scale-105 shadow-sm'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                }`}
              >
                <span className="font-bold text-lg">₹{amount}</span>
                <span className="text-xs text-gray-500 mt-1">Quick Add</span>
              </button>
            ))}
            
            {/* Custom Amount Button */}
            <button
              onClick={handleCustomAmount}
              className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                showCustomInput
                  ? 'border-orange-500 bg-orange-50 text-orange-700 scale-105 shadow-sm'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
              }`}
            >
              <span className="font-bold text-lg">Custom</span>
              <span className="text-xs text-gray-500 mt-1">Any Amount</span>
            </button>
          </div>

          {/* Custom Amount Input */}
          {showCustomInput && (
            <div className="mb-4 animate-fadeIn">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount (₹)
              </label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (parseFloat(value) >= 1 && parseFloat(value) <= 100000)) {
                      setCustomAmount(value);
                      setRechargeAmount(value);
                    }
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 text-gray-800 bg-white text-lg font-medium"
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimum: ₹1
                </p>
                <p className="text-xs text-gray-500">
                  Maximum: ₹100,000
                </p>
              </div>
            </div>
          )}

          {/* Selected Amount Display */}
          {(rechargeAmount || customAmount) && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Selected Amount:</span>
                <span className="font-bold text-lg text-orange-600">
                  ₹{parseFloat(rechargeAmount || customAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Recharge Button */}
          <button
            onClick={() => handleRecharge(rechargeAmount || customAmount)}
            disabled={(!rechargeAmount && !customAmount) || rechargeLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
          >
            {rechargeLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <FaCreditCard className="text-lg" />
                Add ₹{(parseFloat(rechargeAmount || customAmount) || 0).toLocaleString('en-IN')} to Wallet
              </>
            )}
          </button>

          {/* Payment Gateway Info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">RP</span>
                </div>
                <span className="text-sm text-gray-600">Powered by Razorpay</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-500" />
                <span className="text-xs text-gray-500">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaHistory className="text-orange-500" />
              Transaction History
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-3">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaReceipt className="text-gray-400 text-xl" />
              </div>
              <h4 className="text-gray-700 font-medium mb-1">No transactions yet</h4>
              <p className="text-gray-500 text-sm">Add money to your wallet to see transactions here</p>
              <button 
                onClick={() => setShowCustomInput(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Money Now
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      transaction.type === "CREDIT" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {transaction.type === "CREDIT" ? (
                        <FaArrowUp className="text-base" />
                      ) : (
                        <FaArrowDown className="text-base" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {transaction.type === "CREDIT" ? "Wallet Recharge" : "Payment"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <FaClock className="text-xs" />
                        <span>{formatDate(transaction.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[200px]">
                        Ref: {transaction.ref_id}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.type === "CREDIT" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    <p className="font-bold text-lg">
                      {transaction.type === "CREDIT" ? "+" : "-"}₹
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      transaction.type === "CREDIT" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transaction Summary */}
          {transactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Credits</p>
                  <p className="font-bold text-green-600 text-lg">
                    ₹{formatCurrency(
                      transactions
                        .filter(t => t.type === "CREDIT")
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Debits</p>
                  <p className="font-bold text-red-600 text-lg">
                    ₹{formatCurrency(
                      transactions
                        .filter(t => t.type === "DEBIT")
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Benefits */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Use Wallet?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaClock className="text-blue-500" />
                </div>
                <h4 className="font-medium text-gray-900">Faster Checkout</h4>
              </div>
              <p className="text-sm text-gray-600">Skip entering payment details every time you order</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaReceipt className="text-green-500" />
                </div>
                <h4 className="font-medium text-gray-900">Track Spending</h4>
              </div>
              <p className="text-sm text-gray-600">Monitor all your food expenses in one place</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaShieldAlt className="text-purple-500" />
                </div>
                <h4 className="font-medium text-gray-900">Secure Payments</h4>
              </div>
              <p className="text-sm text-gray-600">Your money is safe with bank-level security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button onClick={() => navigate('/home')} className="text-gray-500 flex flex-col items-center">
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate('/history')} className="text-gray-500 flex flex-col items-center">
          <FaListAlt className="text-lg" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        <button onClick={() => navigate('/cart')} className="text-gray-500 flex flex-col items-center">
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button onClick={() => navigate('/wallet')} className="text-orange-500 flex flex-col items-center">
          <FaWallet className="text-lg" />
          <span className="text-xs mt-1">Wallet</span>
        </button>
        <button onClick={() => navigate('/profile')} className="text-gray-500 flex flex-col items-center">
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default WalletPage;