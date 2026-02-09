import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

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
      const response = await fetch("http://192.168.0.103:5020/owenerresturentfetch", {
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
      const response = await fetch("http://192.168.0.103:5020/menu/getmenubyresturantid", {
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
      const response = await fetch("http://192.168.0.103:5020/resops/deletemenu",  {
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
      const response = await fetch("http://192.168.0.103:5020/ops/fastfilling", {
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
      const response = await fetch("http://192.168.0.103:5020/ops/fastfilling", {
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
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Manage Menus</h1>
        <div className="w-6"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 shadow-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 shadow-md">
            {successMessage}
          </div>
        )}
        {loading && (
          <div className="text-center text-gray-700 font-medium mb-4">Loading...</div>
        )}

        {/* RESTAURANT SELECTOR */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Select Restaurant</h2>
          {restaurantList.length > 0 ? (
            <select
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">-- Choose a restaurant --</option>
              {restaurantList.map((restaurant) => (
                <option key={restaurant.restaurantid} value={restaurant.restaurantid}>
                  {restaurant.restaurantname}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600">No restaurants found.</p>
          )}
          <button
            onClick={fetchMenus}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
            disabled={!selectedRestaurantId || loading}
          >
            {loading ? "Fetching..." : "Fetch Menus"}
          </button>
        </div>

        {/* MENU LIST */}
        {menuList.length > 0 && (
          <div className="space-y-4">
            {menuList.map((menu) => {
              const currentStatus = menu.currentstatus || "instock";
              return (
                <div
                  key={menu.menuid}
                  className="bg-white p-4 rounded-xl shadow-md space-y-2"
                >
                  <h3 className="text-lg font-bold text-gray-800">{menu.menuname}</h3>
                  <p className="text-gray-600">{menu.menudescription}</p>
                  <p className="text-gray-700 font-medium">₹ {menu.menuprice}</p>
                  <p className="text-sm text-gray-500">Type: {menu.menutype} | Food: {menu.foodtype}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(menu.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-gray-700">
                    Stock:{" "}
                    <span
                      className={`${
                        currentStatus === "instock"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </p> 

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => deleteMenu(menu.menuid)}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                    <button
                      onClick={() => markInStock(menu.menuid)}
                      disabled={currentStatus === "instock"}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-white font-medium flex items-center justify-center transition-all ${
                        currentStatus === "instock"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      }`}
                    >
                      <FaCheckCircle className="mr-2" /> In Stock
                    </button>
                    <button
                      onClick={() => markOutOfStock(menu.menuid)}
                      disabled={currentStatus === "outofstock"}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-white font-medium flex items-center justify-center transition-all ${
                        currentStatus === "outofstock"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
                      }`}
                    >
                      <FaTimesCircle className="mr-2" /> Out of Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetMenuByOwnerId;
