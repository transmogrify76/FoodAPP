import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const AnalyticsByOwnerId: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setOwnerId(decodedToken.owenerid || "");
        fetchRestaurants(decodedToken.owenerid);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  const fetchRestaurants = async (owenerid: string) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("ownerid", owenerid);

    try {
      const response = await fetch(
        "http://192.168.0.103:5020/owenerresturentfetch",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch restaurants");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRestaurantList(data.data || []);
    } catch (err) {
      setError(
        "Something went wrong while fetching restaurants. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedRestaurantId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("restaurantid", selectedRestaurantId);

    try {
      const response = await fetch(
        "http://192.168.0.103:5020/ops/orderanalytics",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch analytics");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(
        "Something went wrong while fetching analytics. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">
          Analytics Dashboard
        </h1>
        <div className="w-8"></div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex-1 overflow-y-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4 max-w-xl mx-auto">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-lg mb-4 max-w-xl mx-auto">
            {successMessage}
          </div>
        )}
        {loading && (
          <p className="text-center text-gray-700 font-medium mb-4">
            Loading...
          </p>
        )}

        {/* Restaurant Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Restaurant
          </h2>
          {restaurantList.length > 0 ? (
            <div className="mb-4"> 
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400"
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
              >
                <option value="">-- Choose a restaurant --</option>
                {restaurantList.map((restaurant) => (
                  <option
                    key={restaurant.restaurantid}
                    value={restaurant.restaurantid}
                  >
                    {restaurant.restaurantname}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No restaurants found for this owner.
            </p>
          )}

          <button
            onClick={fetchAnalytics}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            disabled={!selectedRestaurantId || loading}
          >
            {loading ? "Fetching Analytics..." : "Fetch Analytics"}
          </button>
        </div>

        {/* Analytics Data */}
        {analyticsData && (
          <div className="bg-white p-6 rounded-2xl shadow-md mt-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Analytics Report
            </h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-orange-50 p-4 rounded-xl shadow-inner">  
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analyticsData.total_orders}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl shadow-inner">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{analyticsData.total_revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsByOwnerId;
