import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft, FaPlus, FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface RestaurantDetailsProps {
  restaurantid: string;
  ownerid: string;
  restaurantname: string;
  location: string;
  cuisine_type: string;
  images: string[];
  thumbnail: string | null;
  created_at: string;
  restaurantphone?: string;
  gst?: string;
  resprocchrg?: string;
}

const RestaurantDetails: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantDetailsProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [ownerid, setOwnerId] = useState<string>("");

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("restaurant_token");
      if (!token) throw new Error("User is not authenticated");

      const decodedToken: { owenerid: string } = jwtDecode(token);
      const owenerid = decodedToken.owenerid;
      if (!owenerid) throw new Error("Owner ID not found in token");
      setOwnerId(owenerid);

      const formData = new FormData();
      formData.append("ownerid", owenerid);

      const response = await fetch(
        "http://192.168.0.103:5020/owenerresturentfetch",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch restaurant details");
      }

      const data = await response.json();
      setRestaurants(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, []);

  const handleAddMenu = (restaurantid: string) => {
    navigate(`/create-menu?restaurantid=${restaurantid}`);
  };

  const handleEditClick = (restaurant: RestaurantDetailsProps) => {
    setEditingId(restaurant.restaurantid);
    setEditData({
      resturantname: restaurant.restaurantname,
      location: restaurant.location,
      cuisintype: restaurant.cuisine_type,
      restaurantphone: restaurant.restaurantphone || "",
      gst: restaurant.gst || "False",
      resprocchrg: restaurant.resprocchrg || "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveChanges = async (restaurantid: string) => {
    try {
      const data = new FormData();
      data.append("owenerid", ownerid);
      data.append("resturantid", restaurantid);
      data.append("resturantname", editData.resturantname);
      data.append("location", editData.location);
      data.append("cuisintype", editData.cuisintype);
      data.append("restaurantphone", editData.restaurantphone);
      data.append("gst", editData.gst);
      data.append("resprocchrg", editData.resprocchrg);

      const response = await fetch(
        "http://192.168.0.103:5020/resown/updateresturant",
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update restaurant details");
      }

      alert("Restaurant details updated successfully!");
      setEditingId(null);
      fetchRestaurantDetails();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("An error occurred while updating the restaurant details.");
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Restaurant Details</h1>
        <div className="w-8"></div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-700 font-medium">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 font-medium">Error: {error}</div>
        ) : restaurants.length > 0 ? (
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant.restaurantid} className="space-y-4">
                {/* Thumbnail */}
                {restaurant.thumbnail ? (
                  <img
                    src={`data:image/png;base64,${restaurant.thumbnail}`}
                    alt={`${restaurant.restaurantname} Thumbnail`}
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-xl shadow-md flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Thumbnail</span>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl shadow-md">
                  {editingId === restaurant.restaurantid ? (
                    <>
                      <InputField
                        label="Restaurant Name"
                        name="resturantname"
                        value={editData.resturantname}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Location"
                        name="location"
                        value={editData.location}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Cuisine Type"
                        name="cuisintype"
                        value={editData.cuisintype}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Restaurant Phone"
                        name="restaurantphone"
                        value={editData.restaurantphone}
                        onChange={handleInputChange}
                      />
                      <SelectField
                        label="GST Applied?"
                        name="gst"
                        value={editData.gst}
                        onChange={handleInputChange}
                        options={[
                          { value: "True", label: "True" },
                          { value: "False", label: "False" },
                        ]}
                      />
                      <InputField
                        label="Processing Charge"
                        name="resprocchrg"
                        value={editData.resprocchrg}
                        onChange={handleInputChange}
                      />

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handleSaveChanges(restaurant.restaurantid)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg shadow hover:bg-green-600 transition flex items-center justify-center"
                        >
                          <FaSave className="mr-2" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-400 text-white py-2 rounded-lg shadow hover:bg-gray-500 transition flex items-center justify-center"
                        >
                          <FaTimes className="mr-2" /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-800">
                        {restaurant.restaurantname}
                      </h2>
                      <p className="text-gray-600">{restaurant.location}</p>
                      <p className="text-gray-600">
                        Cuisine: {restaurant.cuisine_type}
                      </p>
                      {restaurant.restaurantphone && (
                        <p className="text-gray-600">
                          📞 {restaurant.restaurantphone}
                        </p>
                      )}
                      <p className="text-gray-600">
                        GST: {restaurant.gst || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        Processing Charge: {restaurant.resprocchrg || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on:{" "}
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </p>

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handleAddMenu(restaurant.restaurantid)}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                          <FaPlus className="mr-2" />
                          Add Menu
                        </button>
                        <button
                          onClick={() => handleEditClick(restaurant)}
                          className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold shadow-md flex items-center justify-center hover:bg-blue-600 transition-all"
                        >
                          <FaEdit className="mr-2" />
                          Edit Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No restaurants found.</div>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
}) => (
  <div className="mb-2">
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  options: { value: string; label: string }[];
}) => (
  <div className="mb-2">
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default RestaurantDetails;
