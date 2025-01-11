import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Restaurant Details</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        restaurant && (
          <div className="bg-white p-6 rounded-lg shadow-md">
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
            <h2 className="text-3xl font-bold mb-4">{restaurant.resturantname}</h2>
            <p className="text-gray-600 mb-2">Location: {restaurant.location}</p>
            <p className="text-gray-600 mb-2">Cuisine: {restaurant.cuisin_type}</p>
            <p className="text-sm text-gray-500 mb-4">
              Created on: {new Date(restaurant.created_at).toLocaleDateString()}
            </p>
            
                
              
            
          </div>
        )
      )}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default RestaurantDetails;
