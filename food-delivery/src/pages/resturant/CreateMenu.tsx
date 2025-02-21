import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { FaArrowLeft } from "react-icons/fa";

const CreateMenu: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [menuData, setMenuData] = useState({
    menuname: "",
    menudescription: "",
    menuprice: "",
    menutype: "",
    foodtype: "",
    menuitemtype: "",
    servingtype: "",
    menudiscountpercent: "",
    foodweight: "",
    vegornonveg: "",
    images: [] as File[],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createMenuLoading, setCreateMenuLoading] = useState<boolean>(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setMenuData((prevData) => ({ ...prevData, images: Array.from(files) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRestaurantId) {
      setError("Please select a restaurant");
      return;
    }

    setCreateMenuLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("menuname", menuData.menuname || "");
    formData.append("menudescription", menuData.menudescription || "");
    formData.append("menuprice", menuData.menuprice || "");
    formData.append("menutype", menuData.menutype || "");
    formData.append("foodtype", menuData.foodtype || "");
    formData.append("menuitemtype", menuData.menuitemtype || "");
    formData.append("servingtype", menuData.servingtype || "");
    formData.append("menudiscountpercent", menuData.menudiscountpercent || "");
    formData.append("foodweight", menuData.foodweight || "");
    formData.append("vegornonveg", menuData.vegornonveg || "");
    formData.append("restaurantid", selectedRestaurantId);

    menuData.images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("http://localhost:5000/resops/createmenu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create menu");
        return;
      }

      const data = await response.json();
      alert(data.message || "Menu created successfully");
      setMenuData({
        menuname: "",
        menudescription: "",
        menuprice: "",
        menutype: "",
        foodtype: "",
        menuitemtype: "",
        servingtype: "",
        menudiscountpercent: "",
        foodweight: "",
        vegornonveg: "",
        images: [],
      });
    } catch (error) {
      setError("Error creating menu");
    } finally {
      setCreateMenuLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-white">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Create Menu</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 max-w-xl mx-auto">
            {error}
          </div>
        )}

        {loading && <p className="text-center text-gray-700 mb-4">Loading...</p>}

        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurants</h2>
          {restaurantList.length > 0 ? (
            <div className="mb-4">
              <label className="block font-semibold text-gray-700 mb-2">Select Restaurant</label>
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
            onClick={handleSubmit}
            className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            disabled={!selectedRestaurantId || createMenuLoading}
          >
            {createMenuLoading ? "Creating..." : "Create Menu"}
          </button>
        </div>

        {selectedRestaurantId && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Menu Name</label>
                <input
                  type="text"
                  name="menuname"
                  value={menuData.menuname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="menudescription"
                  value={menuData.menudescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Price</label>
                <input
                  type="text"
                  name="menuprice"
                  value={menuData.menuprice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Menu Type</label>
                <input
                  type="text"
                  name="menutype"
                  value={menuData.menutype}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Food Type</label>
                <input
                  type="text"
                  name="foodtype"
                  value={menuData.foodtype}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Menu Item Type</label>
                <input
                  type="text"
                  name="menuitemtype"
                  value={menuData.menuitemtype}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">For how many people?</label>
                <input
                  type="text"
                  name="servingtype"
                  value={menuData.servingtype}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Discount Percentage</label>
                <input
                  type="text"
                  name="menudiscountpercent"
                  value={menuData.menudiscountpercent}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Food Weight (for rice items)</label>
                <input
                  type="text"
                  name="foodweight"
                  value={menuData.foodweight}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Veg or Non-Veg</label>
                <select
                  name="vegornonveg"
                  value={menuData.vegornonveg}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select</option>
                  <option value="veg">Veg</option>
                  <option value="nonveg">Non-Veg</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Images (Minimum 3)</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                disabled={createMenuLoading}
              >
                {createMenuLoading ? "Creating..." : "Create Menu"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMenu;
