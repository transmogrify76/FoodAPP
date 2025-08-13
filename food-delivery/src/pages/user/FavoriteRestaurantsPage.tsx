import React, { useState, useEffect } from 'react';
import { 
  FaHeart, 
  FaHome, 
  FaHistory, 
  FaShoppingBag, 
  FaUserAlt,
  FaShoppingCart,
  FaSearch,
  FaChevronRight,
  FaMapMarkerAlt,
  FaUtensils,
  FaStar
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const FavoriteRestaurantsPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      setError('Please login to view favorites');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend.foodapp.transev.site/ops/fetchuserfavres',
        { userid: userid }
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-orange-500 text-white">
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-lg font-bold">Foodie Heaven</h3>
          </div>
          <button onClick={toggleSidebar} className="text-xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHome className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUserAlt className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHistory className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order History</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/track-order')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaShoppingBag className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Order Tracking</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/favorites')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaHeart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Favorites</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Main Content */}
      <div className="pb-20">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
          <div className="flex justify-between items-center">
            <button onClick={toggleSidebar} className="text-xl">
              <FaSearch />
            </button>
            <div className="flex items-center">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
                alt="Logo" 
                className="w-6 h-6 mr-2"
              />
              <h1 className="text-lg font-bold">Favorite Restaurants</h1>
            </div>
            <div className="w-6"></div> 
          </div>
        </div>
 
        <div className="p-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your favorites...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-red-500 text-4xl mx-auto mb-4">!</div>
              <h3 className="text-lg font-medium text-gray-700">Error</h3>
              <p className="text-gray-500 mt-1">{error}</p>
              <button
                onClick={fetchFavorites}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <FaHeart className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No favorites yet</h3>
              <p className="text-gray-500 mt-1">Your favorite restaurants will appear here</p>
              <button
                onClick={() => navigate('/home')}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Your Favorites</h2>
              <div className="grid grid-cols-1 gap-4">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.uid}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Restaurant ID: {favorite.restaurantid}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Menu Item ID: {favorite.menuid}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <FaHeart className="text-red-500 mr-1" />
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Favorite
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/restaurant/${favorite.restaurantid}`)}
                          className="text-orange-500 text-sm font-medium flex items-center"
                        >
                          View Restaurant <FaChevronRight className="ml-1 text-xs" />
                        </button>
                        <div className="flex items-center text-yellow-500"> 
                          <FaStar className="mr-1" />
                          <span className="text-gray-700 text-sm">4.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
        <button 
          onClick={() => navigate('/home')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <FaSearch className="text-lg" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button 
          onClick={() => navigate('/cart')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaShoppingCart className="text-lg" />
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button 
          onClick={() => navigate('/favorites')}
          className="text-orange-500 flex flex-col items-center"
        >
          <FaHeart className="text-lg" />
          <span className="text-xs mt-1">Favorites</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="text-gray-500 flex flex-col items-center"
        >
          <FaUserAlt className="text-lg" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>      
    </div>
  );
};

export default FavoriteRestaurantsPage;  