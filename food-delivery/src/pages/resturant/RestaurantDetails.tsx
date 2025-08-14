import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

interface RestaurantDetailsProps {
  restaurantid: string;
  ownerid: string;
  restaurantname: string;
  location: string;
  cuisine_type: string;
  images: string[];
  thumbnail: string | null;
  created_at: string;
}

const RestaurantDetails: React.FC = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetailsProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("restaurant_token");
      if (!token) throw new Error("User is not authenticated");

      const decodedToken: { owenerid: string } = jwtDecode(token);
      const ownerid = decodedToken.owenerid;
      if (!ownerid) throw new Error("Owner ID not found in token");

      const formData = new FormData();
      formData.append("ownerid", ownerid);

      const response = await fetch(
        "https://backend.foodapp.transev.site/owenerresturentfetch",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch restaurant details");
      }

      const data = await response.json();
      setRestaurant(data.data[0]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, []);

  const handleAddMenu = () => {
    if (restaurant?.restaurantid) {
      navigate(`/create-menu?restaurantid=${restaurant.restaurantid}`);
    } else {
      alert("Restaurant ID not found!");
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
        ) : (
          restaurant && (
            <div className="space-y-4">
              {/* Thumbnail */}
              {restaurant.thumbnail ? (
                <img
                  src={`data:image/png;base64,${restaurant.thumbnail}`}
                  alt={`${restaurant.restaurantname} Thumbnail`}
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-xl shadow-md flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Thumbnail </span>
                </div>
              )}
            
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800">
                  {restaurant.restaurantname}
                </h2>
                <p className="text-gray-600">{restaurant.location}</p>
                <p className="text-gray-600">Cuisine: {restaurant.cuisine_type}</p>
                <p className="text-sm text-gray-500">
                  Created on: {new Date(restaurant.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={handleAddMenu}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <FaPlus className="mr-2" />
                Add Menu
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
