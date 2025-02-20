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
      if (!token) {
        throw new Error("User is not authenticated");
      }

      const decodedToken: { owenerid: string } = jwtDecode(token);
      const ownerid = decodedToken.owenerid;

      if (!ownerid) {
        throw new Error("Owner ID not found in token");
      }

      const formData = new FormData();
      formData.append("ownerid", ownerid);

      const response = await fetch(
        "http://localhost:5000/owenerresturentfetch",
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
    if (restaurant && restaurant.restaurantid) {
      navigate(`/create-menu?restaurantid=${restaurant.restaurantid}`); 
    } else {
      alert("Restaurant ID not found!");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Restaurant Details</h1>
        <div className="w-8"></div> {/* Placeholder for alignment */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-lg text-red-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-lg text-red-500">Error: {error}</div>
        ) : (
          restaurant && (
            <div className="space-y-4">
              {restaurant.thumbnail ? (
                <img
                  src={`data:image/png;base64,${restaurant.thumbnail}`}
                  alt={`${restaurant.restaurantname} Thumbnail`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Thumbnail</span>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800">
                  {restaurant.restaurantname}
                </h2>
                <p className="text-gray-600">{restaurant.location}</p>
                <p className="text-gray-600">
                  Cuisine: {restaurant.cuisine_type}
                </p>
                <p className="text-sm text-gray-500">
                  Created on: {new Date(restaurant.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={handleAddMenu}
                className="w-full bg-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center"
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