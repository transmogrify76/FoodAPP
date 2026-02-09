import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft, FaEdit } from "react-icons/fa";

const EditMenu: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<string>("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [menuList, setMenuList] = useState<any[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");

  const [menuData, setMenuData] = useState<any>({
    menuname: "",
    menudescription: "",
    menuprice: "",
    menutype: "",
    foodtype: "",
    servingtype: "",
    menudiscountpercent: "",
    vegornonveg: "",
    gst_rate: "",
    images: [] as File[],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Decode token and get ownerId
  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const id = decoded.owenerid;
        setOwnerId(id);
        fetchRestaurants(id);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  // Fetch all restaurants
  const fetchRestaurants = async (ownerid: string) => {
    const formData = new FormData();
    formData.append("ownerid", ownerid);
    try {
      const res = await fetch("http://192.168.0.103:5020/owenerresturentfetch", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setRestaurantList(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch restaurants");
    }
  };

  // Fetch menus by restaurant id
  const fetchMenus = async (restaurantId: string) => {
    const formData = new FormData();
    formData.append("resturnatid", restaurantId);
    try {
      const res = await fetch("http://192.168.0.103:5020/menu/getmenubyresturantid", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.menus) {
        setMenuList(data.menus);
      } else {
        setMenuList([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch menus");
    }
  };

  // When a menu is selected
  const handleMenuSelect = (menuId: string) => {
    setSelectedMenuId(menuId);
    const selected = menuList.find((m) => m.menuid === menuId);
    if (selected) {
      setMenuData({
        menuname: selected.menuname || "",
        menudescription: selected.menudescription || "",
        menuprice: selected.menuprice || "",
        menutype: selected.menutype || "",
        foodtype: selected.foodtype || "",
        servingtype: selected.servingtype || "",
        menudiscountpercent: selected.menudiscountpercent || "",
        vegornonveg: selected.vegornonveg || "",
        gst_rate: selected.gst_rate || "",
        images: [],
      });
      const imageUrls = (selected.images || []).map(
        (img: any) => `http://192.168.0.103:5020/${img.image_path}`
      );
      setPreviewImages(imageUrls);
    }
  };

  // Handle input changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setMenuData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle new image upload
  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files) {
      setMenuData((prev: any) => ({ ...prev, images: Array.from(files) }));
    }
  };

  // Update menu
  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (!selectedMenuId || !selectedRestaurantId) {
      alert("Please select restaurant and menu both!");
      return;
    }

    const formData = new FormData();
    Object.entries(menuData).forEach(([key, value]) => {
      if (key === "images") {
        (value as File[]).forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value as string);
      }
    });
    formData.append("menuid", selectedMenuId);
    formData.append("restaurantid", selectedRestaurantId);

    try {
      const res = await fetch("http://192.168.0.103:5020/menuops/updatemenuops", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Menu updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update menu");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Edit Menu</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {error && <div className="bg-red-100 text-red-800 p-3 rounded-lg">{error}</div>}

        {/* Select Restaurant */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Restaurant
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={selectedRestaurantId}
            onChange={(e) => {
              setSelectedRestaurantId(e.target.value);
              fetchMenus(e.target.value);
              setMenuList([]);
              setSelectedMenuId("");
            }}
          >
            <option value="">Choose Restaurant</option>
            {restaurantList.map((r) => (
              <option key={r.restaurantid} value={r.restaurantid}>
                {r.restaurantname}
              </option>
            ))}
          </select>
        </div>

        {/* Select Menu */}
        {selectedRestaurantId && menuList.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Menu
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl"
              value={selectedMenuId}
              onChange={(e) => handleMenuSelect(e.target.value)}
            >
              <option value="">Choose Menu</option>
              {menuList.map((m) => (
                <option key={m.menuid} value={m.menuid}>
                  {m.menuname}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Edit Form */}
        {selectedMenuId && (
          <form
            onSubmit={handleUpdate}
            className="bg-white p-4 rounded-xl shadow-md space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Edit Menu Details</h2>

            {/* Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="menuname"
                value={menuData.menuname}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="menudescription"
                value={menuData.menudescription}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="text"
                name="menuprice"
                value={menuData.menuprice}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            {/* Show Old Images */}
            {previewImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Images</label>
                <div className="flex gap-3 overflow-x-auto">
                  {previewImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="menu"
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Images</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl flex justify-center items-center gap-2"
            >
              <FaEdit /> Update Menu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMenu;
