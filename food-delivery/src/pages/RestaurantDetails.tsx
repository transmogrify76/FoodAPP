import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface RestaurantDetailsProps {
  resturantid: string;
  ownerid: string;
  resturantname: string;
  location: string;
  cuisin_type: string;
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
      const token = localStorage.getItem('restaurant_token');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const restaurantId = localStorage.getItem('restaurantId');
      if (!restaurantId) {
        throw new Error('Restaurant ID not found');
      }

      const formData = new FormData();
      formData.append('resturantid', restaurantId);

      const response = await fetch('http://localhost:5000/resown/getresturant', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch restaurant details');
      }

      const data = await response.json();
      setRestaurant(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, []);

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={() => navigate(-1)}
              className="text-3xl text-red-500 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
              Restaurant Details
            </h1>
          </div>

          {loading ? (
            <div className="text-center text-lg text-red-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-lg text-red-500">Error: {error}</div>
          ) : (
            restaurant && (
              <div className="space-y-6">
                {restaurant.thumbnail ? (
                  <img
                    src={`data:image/png;base64,${restaurant.thumbnail}`}
                    alt={`${restaurant.resturantname} Thumbnail`}
                    className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg shadow-md mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Thumbnail</span>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-red-500">{restaurant.resturantname}</h2>
                <p className="text-gray-600 text-lg">{restaurant.location}</p>
                <p className="text-gray-600 text-lg">Cuisine: {restaurant.cuisin_type}</p>
                <p className="text-sm text-gray-500">
                  Created on: {new Date(restaurant.created_at).toLocaleDateString()}
                </p>
              </div>
            )
          )}
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:bg-gradient-to-l transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
