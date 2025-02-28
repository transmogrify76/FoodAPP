import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft } from "react-icons/fa";

const GetMenuByOwnerId: React.FC = () => {
  const navigate = useNavigate();
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
      const response = await fetch("http://127.0.0.1:5000/owenerresturentfetch", {
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
      const response = await fetch("http://127.0.0.1:5000/menu/getmenubyresturantid", {
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
      const menusWithStatus = (data.menus || []).map((menu: any) => ({
        ...menu,
        currentstatus: menu.currentstatus || "instock",
      }));
      setMenuList(menusWithStatus);
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
      const response = await fetch("http://127.0.0.1:5000/resops/deletemenu", {
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
      setMenuList(menuList.filter((menu) => menu.menuid !== menuid));
    } catch (err) {
      setError("Something went wrong while deleting the menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const markOutOfStock = async (menuid: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData();
    formData.append("menuid", menuid);
    formData.append("currentstatus", "outofstock");

    formData.append("numberoffillups", "");
    try {
      const response = await fetch("http://127.0.0.1:5000/ops/fastfilling", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update stock status");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setSuccessMessage(data.message || "Menu marked as out of stock successfully");

      setMenuList((prev) =>
        prev.map((menu) =>
          menu.menuid === menuid ? { ...menu, currentstatus: "outofstock" } : menu
        )
      );
    } catch (err) {
      setError("Something went wrong while updating stock status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const markInStock = async (menuid: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData();
    formData.append("menuid", menuid);
    formData.append("currentstatus", "instock");

    const numberoffillups = window.prompt("Enter number of fill-ups (stock count):", "0") || "0";
    formData.append("numberoffillups", numberoffillups);
    try {
      const response = await fetch("http://127.0.0.1:5000/ops/fastfilling", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update stock status");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setSuccessMessage(data.message || "Menu marked as in stock successfully");
      // Update currentstatus in state.
      setMenuList((prev) =>
        prev.map((menu) =>
          menu.menuid === menuid ? { ...menu, currentstatus: "instock" } : menu
        )
      );
    } catch (err) {
      setError("Something went wrong while updating stock status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">

      <div className="bg-red-600 text-white p-4 flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="text-white">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Get Menus by Owner ID</h1>
        <div className="w-6"></div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-3 max-w-xl mx-auto">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-3 max-w-xl mx-auto">
          {successMessage}
        </div>
      )}
      {loading && <p className="text-center text-gray-700 mb-3">Loading...</p>}

      <div className="bg-white p-4 rounded shadow max-w-xl mx-auto mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Restaurants</h2>
        {restaurantList.length > 0 ? (
          <div className="mb-3">
            <label className="block font-medium text-gray-700 mb-2">Select Restaurant</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
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
          className="w-full py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
          disabled={!selectedRestaurantId || loading}
        >
          {loading ? "Fetching..." : "Fetch Menus"}
        </button>
      </div>

      {menuList.length > 0 && (
        <div className="bg-white p-4 rounded shadow max-w-xl mx-auto mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Menu List</h2>
          <div className="space-y-3">
            {menuList.map((menu) => {
              const currentStatus = menu.currentstatus || "instock";
              return (
                <div
                  key={menu.menuid}
                  className="p-3 border rounded flex flex-col sm:flex-row justify-between items-start"
                >
                  <div className="mb-3 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">{menu.menuname}</h3>
                    <p className="text-gray-700">Description: {menu.menudescription}</p>
                    <p className="text-gray-700">Price: {menu.menuprice}</p>
                    <p className="text-gray-700">Type: {menu.menutype}</p>
                    <p className="text-gray-700">Food Type: {menu.foodtype}</p>
                    <p className="text-gray-700">Created At: {menu.created_at}</p>
                    <p className="text-gray-700">
                      Current Stock: <span className="font-semibold">{currentStatus}</span>
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 w-full sm:w-auto">
                    <button
                      onClick={() => deleteMenu(menu.menuid)}
                      className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                      <button
                        onClick={() => markInStock(menu.menuid)}
                        className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                        disabled={currentStatus === "instock"}
                      >
                        Set In Stock
                      </button>
                      <button
                        onClick={() => markOutOfStock(menu.menuid)}
                        className="w-full sm:w-auto px-3 py-2 bg-gray-800 text-white font-semibold rounded hover:bg-gray-900 transition-colors"
                        disabled={currentStatus === "outofstock"}
                      >
                        Set Out of Stock
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetMenuByOwnerId;
