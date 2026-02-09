import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft } from "react-icons/fa";

const DeleteRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // ✅ Step 1: Get owner ID from token
  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const ownerIdFromToken = decodedToken.owenerid || decodedToken.ownerid || "";
        setOwnerId(ownerIdFromToken);
        if (ownerIdFromToken) {
          fetchRestaurants(ownerIdFromToken);
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  // ✅ Step 2: Fetch restaurants owned by that owner
  const fetchRestaurants = async (ownerid: string) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("ownerid", ownerid);

    try {
      const response = await fetch("http://192.168.0.103:5020/owenerresturentfetch", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch restaurants");
        return;
      }

      setRestaurantList(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching restaurants.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 3: Delete selected restaurant
  const handleDelete = async () => {
    if (!selectedRestaurantId) {
      alert("Please select a restaurant to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    const formData = new FormData();
    formData.append("ownerid", ownerId);
    formData.append("restaurantid", selectedRestaurantId);

    try {
      const response = await fetch("http://192.168.0.103:5020/restaurant/delete_cascade", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete restaurant");
        return;
      }

      alert(data.message || "Restaurant deleted successfully");
      // Remove deleted restaurant from local list
      setRestaurantList((prev) => prev.filter((r) => r.restaurantid !== selectedRestaurantId));
      setSelectedRestaurantId("");
    } catch (err) {
      setError("Error deleting restaurant. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Delete Restaurant</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm shadow-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading restaurants...</p>
        ) : restaurantList.length === 0 ? (
          <p className="text-center text-gray-500">No restaurants found for this owner.</p>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Select a Restaurant to Delete</h2>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">Choose a restaurant</option>
              {restaurantList.map((restaurant) => (
                <option key={restaurant.restaurantid} value={restaurant.restaurantid}>
                  {restaurant.restaurantname}
                </option>
              ))}
            </select>

            <button
              onClick={handleDelete}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Restaurant"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteRestaurant;
