import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const FavoriteRestaurantsPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem('token'); 
    if (token) {
      try {
        const decoded: any = jwtDecode(token); 
        return decoded.userid; 
      } catch (error) {
        console.error('Failed to decode token', error);
        return null;
      }
    }
    return null;
  };

  const fetchFavorites = async () => {
    const userid = getUserIdFromToken(); 

    if (!userid) {
      setError('User is not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/ops/fetchuserfavres',
        {
          userid: userid, 
        }
      );

      if (response.status === 200) {
        setFavorites(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites', error);
      setError('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">

      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <h1 className="text-2xl font-bold">My Favorite Restaurants</h1>
      </div>

      {loading ? (
        <p className="text-center text-lg font-semibold mt-4">Loading favorites...</p>
      ) : error ? (
        <p className="text-red-500 text-center font-semibold mt-4">{error}</p>
      ) : (
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.uid}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
              >
                <h3 className="text-lg font-bold text-red-500">
                  Restaurant ID: {favorite.restaurantid}
                </h3>
                <p className="text-gray-600 mt-2">Menu Item ID: {favorite.menuid}</p>
                <p className="text-gray-500 mt-1">
                  Favorite Status: {favorite.is_favorite ? 'Marked as Favorite' : 'Not a Favorite'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-up-lg flex justify-center items-center">
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg active:scale-98 transition-transform"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FavoriteRestaurantsPage;
