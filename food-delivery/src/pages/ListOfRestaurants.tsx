import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Restaurant {
  restaurantid: string;
  ownerid: string;
  restaurantname: string;
  location: string;
  cuisine_type: string;
  images: string[];
  thumbnail: string | null;
  created_at: string;
}

const ListOfRestaurants: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('restaurant_token');
      if (!token) throw new Error('User is not authenticated');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const ownerId = payload.owenerid;

      if (!ownerId) throw new Error('Owner ID not found in token');

      const formData = new FormData();
      formData.append('ownerid', ownerId);

      const response = await fetch('http://localhost:5000/owenerresturentfetch', {
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
      setRestaurants(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAddMenu = (restaurantId: string) => {
    localStorage.setItem('restaurantId', restaurantId);
    navigate('/create-menu');
  };

  const handleViewRestaurant = (restaurantId: string) => {
    localStorage.setItem('restaurantId', restaurantId);
    navigate('/restaurant-details');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-red-600 mb-4 sm:mb-6">
        Restaurants by Owner
      </h1>
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <div className="space-y-4">
          {restaurants.length === 0 ? (
            <p className="text-gray-600 text-center">No restaurants found for this owner.</p>
          ) : (
            restaurants.map((restaurant) => (
              <div
                key={restaurant.restaurantid}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row items-center sm:items-stretch p-4"
              >
                {restaurant.thumbnail ? (
                  <img
                    src={`data:image/png;base64,${restaurant.thumbnail}`}
                    alt={`${restaurant.restaurantname} Thumbnail`}
                    className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400 text-sm">No Thumbnail</span>
                  </div>
                )}
                <div className="flex-1 mt-4 sm:mt-0 sm:ml-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {restaurant.restaurantname}
                  </h2>
                  <p className="text-sm text-gray-600">{restaurant.location}</p>
                  <p className="text-sm text-gray-600">Cuisine: {restaurant.cuisine_type}</p>
                  <p className="text-xs text-gray-500">
                    Created on: {new Date(restaurant.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddMenu(restaurant.restaurantid)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700"
                    >
                      Add Menu
                    </button>
                    <button
                      onClick={() => handleViewRestaurant(restaurant.restaurantid)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm shadow hover:bg-green-700"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ListOfRestaurants;
