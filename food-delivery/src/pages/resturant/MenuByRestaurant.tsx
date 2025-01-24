import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const GetMenuByOwnerId: React.FC = () => {
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [menuList, setMenuList] = useState<any[]>([]);
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

  const fetchMenus = async () => {
    if (!selectedRestaurantId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resturnatid", selectedRestaurantId);

    try {
      const response = await fetch("http://localhost:5000/menu/getmenubyresturantid", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch menus");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setMenuList(data.menus || []);
    } catch (err) {
      setError("Something went wrong while fetching menus. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (menuid: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("menuid", menuid);

    try {
      const response = await fetch("http://localhost:5000/resops/deletemenu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete menu");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSuccessMessage(data.message || "Menu deleted successfully");
      setMenuList(menuList.filter((menu) => menu.menuid !== menuid)); // Update state after deletion
    } catch (err) {
      setError("Something went wrong while deleting the menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
        Get Menus by Owner ID
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
          onClick={fetchMenus}
          className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          disabled={!selectedRestaurantId || loading}
        >
          {loading ? "Fetching..." : "Fetch Menus"}
        </button>
      </div>

      {menuList.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu List</h2>
          <div className="space-y-4">
            {menuList.map((menu) => (
              <div key={menu.menuid} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{menu.menuname}</h3>
                  <p className="text-gray-700">Description: {menu.menudescription}</p>
                  <p className="text-gray-700">Price: {menu.menuprice}</p>
                  <p className="text-gray-700">Type: {menu.menutype}</p>
                  <p className="text-gray-700">Food Type: {menu.foodtype}</p>
                  <p className="text-gray-700">Created At: {menu.created_at}</p>
                </div>
                <button
                  onClick={() => deleteMenu(menu.menuid)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetMenuByOwnerId;
