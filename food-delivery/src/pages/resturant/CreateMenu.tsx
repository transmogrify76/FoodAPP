import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
    gst: "", // ✅ Added GST field here
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
      const response = await fetch("https://backend.foodapp.transev.site/owenerresturentfetch", {
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
    Object.entries(menuData).forEach(([key, value]) => {
      if (key === "images") {
        (value as File[]).forEach((image) => {
          formData.append("images", image);
        });
      } else {
        formData.append(key, value as string);
      }
    });
    formData.append("restaurantid", selectedRestaurantId);

    try {
      const response = await fetch("https://backend.foodapp.transev.site/resops/createmenu", {
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
        gst: "", // ✅ reset GST
        images: [],
      });
    } catch (error) {
      setError("Error creating menu");
    } finally {
      setCreateMenuLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Create Menu</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-700">Loading...</p>
        )}

        {/* RESTAURANT SELECT */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Select Restaurant</h2>
          {restaurantList.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 text-sm">No restaurants found.</p>
          )}
        </div>

        {/* MENU FORM */}
        {selectedRestaurantId && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-xl shadow-md space-y-4"
          >
            {[ 
              { label: "Menu Name", name: "menuname", type: "text" },
              { label: "Description", name: "menudescription", type: "textarea" },
              { label: "Price", name: "menuprice", type: "text" },
              { label: "Menu Type", name: "menutype", type: "text" },
              { label: "Food Type", name: "foodtype", type: "text" },
              { label: "Menu Item Type", name: "menuitemtype", type: "text" },
              { label: "For how many people?", name: "servingtype", type: "text" },
              { label: "Discount Percentage", name: "menudiscountpercent", type: "text" },
              { label: "Food Weight (for rice items)", name: "foodweight", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={(menuData as any)[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={(menuData as any)[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            ))}

            {/* Veg or Non-Veg */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veg or Non-Veg
              </label>
              <select
                name="vegornonveg"
                value={menuData.vegornonveg}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select</option>
                <option value="veg">Veg</option>
                <option value="nonveg">Non-Veg</option>
              </select>
            </div>

            {/* ✅ GST Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST
              </label>
              <select
                name="gst"
                value={menuData.gst}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select GST %</option>
                <option value="5%">5%</option>
                <option value="12%">12%</option>
                <option value="18%">18%</option>
                <option value="28%">28%</option>
                <option value="40%">40%</option>
              </select>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (Minimum 3)
              </label>
              <input
                type="file"
                name="images"
                multiple
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
              disabled={createMenuLoading}
            >
              {createMenuLoading ? "Creating..." : "Create Menu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateMenu;
