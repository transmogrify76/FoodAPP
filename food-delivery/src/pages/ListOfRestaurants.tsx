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
  const navigate = useNavigate(); // Use the useNavigate hook

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('restaurant_token');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const ownerId = payload.owenerid;

      if (!ownerId) {
        throw new Error('Owner ID not found in token');
      }

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
    localStorage.setItem('restaurantId', restaurantId);  // Store restaurantId in localStorage
    navigate('/create-menu'); // Navigate to the Create Menu page
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Restaurants by Owner</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {restaurants.length === 0 ? (
            <p className="text-gray-600 text-center">No restaurants found for this owner.</p>
          ) : (
            <ul>
              {restaurants.map((restaurant) => (
                <li key={restaurant.restaurantid} className="mb-6">
                  <div className="flex items-center">
                    {restaurant.thumbnail ? (
                      <img
                        src={`data:image/png;base64,${restaurant.thumbnail}`}
                        alt={`${restaurant.restaurantname} Thumbnail`}
                        className="w-24 h-24 object-cover rounded-lg shadow-md mr-4"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg shadow-md mr-4 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Thumbnail</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">{restaurant.restaurantname}</h2>
                      <p className="text-gray-600">{restaurant.location}</p>
                      <p className="text-gray-600">Cuisine: {restaurant.cuisine_type}</p>
                      <p className="text-sm text-gray-500">
                        Created on: {new Date(restaurant.created_at).toLocaleDateString()}
                      </p>
                      {/* Add Menu Button */}
                      <button
                        onClick={() => handleAddMenu(restaurant.restaurantid)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                      >
                        Add Menu
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    {restaurant.images.map((image, index) => (
                      <img
                        key={index}
                        src={`data:image/png;base64,${image}`}
                        alt={`Image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md shadow-sm"
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ListOfRestaurants;
