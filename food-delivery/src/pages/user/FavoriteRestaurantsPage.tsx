import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

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
        'http://localhost:5000/ops/fetchfavoritebyuserid',
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
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.uid}
                className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-xl rounded-lg p-6 transition-all"
              >
                <h3 className="text-lg font-bold text-red-500">Restaurant ID: {favorite.restaurantid}</h3>
                <p className="text-gray-600 mt-2">Menu Item ID: {favorite.menuid}</p>
                <p className="text-gray-500 mt-1">Favorite Status: {favorite.is_favorite ? 'Marked as Favorite' : 'Not a Favorite'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white shadow-lg flex justify-between items-center">
        <button
          onClick={() => navigate('/home')}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gradient-to-l transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FavoriteRestaurantsPage;
