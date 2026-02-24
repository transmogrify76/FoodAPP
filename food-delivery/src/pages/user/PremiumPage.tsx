import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaArrowLeft, FaCheckCircle, FaWallet } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

interface Plan {
  plan_id: string;
  name: string;
  price: number;
  duration_days: number;
  active: boolean;
}

interface PremiumStatus {
  is_premium: boolean;
  plan_type?: string;
  name?: string;
  expires_on?: string;
  days_left?: number;
  amount_paid?: number;
  activated_at?: string;
}

// Helper to decode JWT token and extract payload
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
};

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Helper to get user ID from token in localStorage
  const getUserId = (): string | null => {
    // Possible keys where token might be stored
    const tokenKeys = ['token', 'accessToken', 'jwt', 'authToken', 'id_token'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        const payload = decodeToken(token);
        if (payload) {
          // Try common user id fields in JWT payload, including 'userid'
          const userId = payload.userid || payload.sub || payload.id || payload.user_id || payload.userId || payload.uid;
          if (userId) return userId;
        }
      }
    }

    // Fallback: try direct user id keys (if stored separately)
    const directKeys = ['userid', 'userId', 'user_id', 'id', 'uid'];
    for (const key of directKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        // Try parsing as JSON (e.g., { id: '...' })
        try {
          const parsed = JSON.parse(value);
          if (parsed && (parsed.id || parsed.userId || parsed.userid)) {
            return parsed.id || parsed.userId || parsed.userid;
          }
        } catch {
          return value; // plain string
        }
      }
    }
    return null;
  };

  const userId = getUserId();

  useEffect(() => {
    if (!userId) {
      setError('User not logged in. Please log in again.');
      setLoading(false);
      console.error('No user ID found. Current localStorage:', { ...localStorage });
      return;
    }
    fetchPremiumStatus();
  }, [userId]);

  const fetchPremiumStatus = async () => {
    try {
      setLoading(true);
      const statusRes = await fetch('http://192.168.0.103:5020/premium/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId }),
      });
      if (!statusRes.ok) throw new Error('Failed to fetch premium status');
      const statusData = await statusRes.json();
      
      if (statusData.is_premium) {
        setPremiumStatus({
          is_premium: true,
          plan_type: statusData.plan_type,
          name: statusData.name,
          expires_on: statusData.expires_on,
          days_left: statusData.days_left,
          amount_paid: statusData.amount_paid,
          activated_at: statusData.activated_at,
        });
        setLoading(false);
      } else {
        setPremiumStatus({ is_premium: false });
        const plansRes = await fetch('http://192.168.0.103:5020/premium/plans');
        if (!plansRes.ok) throw new Error('Failed to fetch plans');
        const plansData = await plansRes.json();
        if (plansData.status && plansData.plans) {
          setPlans(plansData.plans);
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }
    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      const payRes = await fetch('http://192.168.0.103:5020/wallet/premium/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: userId,
          plan_type: selectedPlan,
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || payData.status !== 'success') {
        throw new Error(payData.message || 'Payment failed');
      }
      setSuccess('Premium activated successfully!');
      await fetchPremiumStatus();
      setSelectedPlan(null);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading premium info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-xl mr-4">
            <FaArrowLeft />
          </button>
          <div className="flex items-center">
            <FaCrown className="text-2xl mr-2" />
            <h1 className="text-lg font-bold">Premium Membership</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Debug toggle (only visible when there's an error) */}
        {error && error.includes('not logged in') && (
          <div className="mb-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-blue-600 underline"
            >
              {showDebug ? 'Hide debug info' : 'Show debug info'}
            </button>
            {showDebug && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono">
                <p className="font-bold mb-1">localStorage contents:</p>
                <pre>{JSON.stringify({ ...localStorage }, null, 2)}</pre>
                <p className="mt-2 text-gray-600">
                  If you see a token here, the decoder will extract user ID from it.
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AiOutlineClose className="mr-2" />
            {error}
            {error.includes('not logged in') && (
              <button
                onClick={() => navigate('/login')}
                className="ml-auto bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs"
              >
                Go to Login
              </button>
            )}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
            <FaCheckCircle className="mr-2" />
            {success}
          </div>
        )}

        {!error && premiumStatus?.is_premium ? (
          // Active Premium View
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <FaCrown className="text-yellow-500 text-3xl mr-3" />
              <h2 className="text-xl font-bold text-gray-800">You are a Premium Member!</h2>
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold">Plan:</span> {premiumStatus.name || premiumStatus.plan_type}
              </p>
              {premiumStatus.amount_paid && (
                <p className="text-gray-700">
                  <span className="font-semibold">Paid:</span> ₹{premiumStatus.amount_paid}
                </p>
              )}
              {premiumStatus.activated_at && (
                <p className="text-gray-700">
                  <span className="font-semibold">Activated on:</span> {formatDate(premiumStatus.activated_at)}
                </p>
              )}
              {premiumStatus.expires_on && (
                <p className="text-gray-700">
                  <span className="font-semibold">Expires on:</span> {formatDate(premiumStatus.expires_on)}
                </p>
              )}
              {premiumStatus.days_left !== undefined && (
                <p className="text-gray-700">
                  <span className="font-semibold">Days left:</span> {premiumStatus.days_left}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Go to Home
            </button>
          </div>
        ) : !error && (
          // Non-premium: Show plans
          <>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center mb-2">
                <FaCrown className="text-3xl mr-2" />
                <h2 className="text-2xl font-bold">Go Premium</h2>
              </div>
              <p className="text-sm opacity-90">
                Unlock free delivery, exclusive offers, and more!
              </p>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-4">Choose a plan</h3>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className={`bg-white rounded-xl shadow-sm p-5 border-2 transition ${
                    selectedPlan === plan.plan_id
                      ? 'border-orange-500'
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedPlan(plan.plan_id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {plan.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {plan.duration_days} days validity
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-orange-500">
                      ₹{plan.price}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <FaWallet className="mr-1 text-orange-400" />
                    Pay from wallet
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={!selectedPlan || purchasing}
              className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition ${
                !selectedPlan || purchasing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {purchasing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Activate Premium'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By activating, you agree to our terms and conditions.
            </p>
          </>
        )}
      </div>

      <div className="h-10"></div>
    </div>
  );
};

export default PremiumPage;