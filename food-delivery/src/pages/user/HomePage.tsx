import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBars,
  FaRegHeart,
  FaShoppingBag,
  FaHome,
  FaHistory,
  FaCog,
  FaFile,
  FaShoppingCart,
  FaUtensils
} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('https://backend.foodapp.transev.site/resown/listofresturants');
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants.');
        }
        const data = await response.json();
        if (data.restaurants && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          throw new Error('Unexpected API response format.');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong!');
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleViewMenu = async (restaurantId: string) => {
    try {
      const formData = new FormData();
      formData.append('resturnatid', restaurantId);

      const response = await fetch('https://backend.foodapp.transev.site/menu/getmenubyresturantid', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menu.');
      }

      const data = await response.json();

      if (data.menus) {
        navigate('/restaurant-menu', { state: { menu: data.menus, restaurantId } });
      } else {
        throw new Error('No menu found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu');
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearchQuery =
      restaurant.resturantname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisineFilter =
      selectedFilter === 'All' ||
      restaurant.cuisin_type.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearchQuery && matchesCuisineFilter;
  });

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <h3 className="text-xl font-bold">Chitradeep!</h3>
          <button onClick={toggleSidebar} className="text-2xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-4">
            <li className="flex items-center">
              <FaHome className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/home')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Home
              </button>
            </li>
            <li className="flex items-center">
              <FaFile className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Profile
              </button>
            </li>
            <li className="flex items-center">
              <FaHistory className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/history')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Order History
              </button>
            </li>
            <li className="flex items-center">
              <FaShoppingBag className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/track-order')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Order Tracking
              </button>
            </li>
            <li className="flex items-center">
              <FaUtensils className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/menu')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                All Menus
              </button>
            </li>
            <li className="flex items-center">
              <FaCog className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Settings
              </button>
            </li>
            <li className="flex items-center">
              <FaRegHeart className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/favourites')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                Favorites
              </button>
            </li>
            <li className="flex items-center">
              <FaShoppingCart className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/cart')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium text-sm"
              >
                View Cart
              </button>
            </li>
          </ul>
        </div>
      </div>
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}

      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <button onClick={toggleSidebar} className="text-2xl">
          <FaBars />
        </button>
        <h1 className="text-xl font-bold">Discover Restaurants</h1>
        <div className="w-6" /> 
      </div>

      <div className="p-4 pb-24 flex-1">

        <div className="flex flex-col sm:flex-row justify-between mb-4 items-center space-y-3 sm:space-y-0">
          <div className="flex items-center w-full sm:w-auto">
            <FaSearch className="text-red-500 mr-2" />
            <input
              type="text"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto text-sm"
            />
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <FaMapMarkerAlt className="text-red-500 mr-2" />
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="p-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto text-sm"
            >
              <option value="All">All</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.resturantid}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
            >
              {restaurant.thumbnail && (
                <img
                  src={`data:image/jpeg;base64,${restaurant.thumbnail}`}
                  alt={restaurant.resturantname}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-lg font-semibold text-center">{restaurant.resturantname}</h2>
              <p className="text-gray-600 text-center text-sm">{restaurant.location}</p>
              <p className="text-gray-600 text-center text-sm">{restaurant.address}</p>
              <div className="flex justify-center items-center mt-3">
                <button
                  onClick={() => handleViewMenu(restaurant.resturantid)}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm"
                >
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
