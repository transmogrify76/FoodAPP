import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AnalyticsByOwnerId: React.FC = () => {
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<any>(null); // Analytics data state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch owner's ID from localStorage and restaurants list
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

  // Fetch restaurants based on owner ID
  const fetchRestaurants = async (owenerid: string) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("ownerid", owenerid);

    try {
      const response = await fetch("http://localhost:5000/owenerresturentfetch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch restaurants");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRestaurantList(data.data || []);
    } catch (err) {
      setError("Something went wrong while fetching restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data for the selected restaurant
  const fetchAnalytics = async () => {
    if (!selectedRestaurantId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("restaurantid", selectedRestaurantId);

    try {
      const response = await fetch("http://localhost:5000/ops/orderanalytics", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch analytics");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalyticsData(data); // Map the entire response to the analytics state
    } catch (err) {
      setError("Something went wrong while fetching analytics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
        Analytics by Owner ID
      </h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      {loading && <p className="text-center text-gray-700">Loading...</p>}

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurants</h2>
        {restaurantList.length > 0 ? (
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Select Restaurant</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">Select a restaurant</option>
              {restaurantList.map((restaurant) => (
                <option key={restaurant.restaurantid} value={restaurant.restaurantid}>
                  {restaurant.restaurantname}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-center text-gray-700">No restaurants found.</p>
        )}

        <button
          onClick={fetchAnalytics}
          className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          disabled={!selectedRestaurantId || loading}
        >
          {loading ? "Fetching Analytics..." : "Fetch Analytics"}
        </button>
      </div>

      {analyticsData && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
          <div className="space-y-4">
            {/* Displaying analytics data */}
            <p className="text-gray-700"><strong>Total Orders:</strong> {analyticsData.total_orders}</p>
            <p className="text-gray-700"><strong>Total Revenue:</strong> ₹{analyticsData.total_revenue.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsByOwnerId;
