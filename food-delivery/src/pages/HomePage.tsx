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
        const response = await fetch('http://127.0.0.1:5000/resown/listofresturants');
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

  const handleViewMenu = async (restaurantId: number) => {
    try {
      const formData = new FormData();
      formData.append('resturnatid', restaurantId.toString());

      const response = await fetch('http://127.0.0.1:5000/menu/getmenubyresturantid', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menu.');
      }

      const data = await response.json();

      if (data.menus) {
        navigate('/restaurant-menu', { state: { menu: data.menus } });
      } else {
        throw new Error('No menu found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu');
    }
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <h3 className="text-xl font-bold">Chitradeep!</h3>
          <button onClick={toggleSidebar} className="text-2xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-6">
            <li className="flex items-center">
              <FaHome className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium"
              >
                Home
              </button>
            </li>
            <li className="flex items-center">
              <FaFile className="text-red-500 mr-3 text-lg" />
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left text-gray-600 hover:text-red-500 font-medium"
              >
                Profile
              </button>
            </li>
            <li className="flex items-center">
              <FaHistory className="text-red-500 mr-3 text-lg" />
              <button className="w-full text-left text-gray-600 hover:text-red-500 font-medium">
                Order History
              </button>
            </li>
            <li className="flex items-center">
              <FaShoppingBag className="text-red-500 mr-3 text-lg" />
              <button className="w-full text-left text-gray-600 hover:text-red-500 font-medium">
                Order Tracking
              </button>
            </li>
            <li className="flex items-center">
              <FaCog className="text-red-500 mr-3 text-lg" />
              <button className="w-full text-left text-gray-600 hover:text-red-500 font-medium">
                Settings
              </button>
            </li>
            <li className="flex items-center">
              <FaRegHeart className="text-red-500 mr-3 text-lg" />
              <button className="w-full text-left text-gray-600 hover:text-red-500 font-medium">
                Favorites
              </button>
            </li>
            {/* View Cart Added */}
            <li className="flex items-center">
              <FaShoppingCart className="text-red-500 mr-3 text-lg" />
              <button className="w-full text-left text-gray-600 hover:text-red-500 font-medium">
                View Cart
              </button>
            </li>
          </ul>
        </div>
      </div>

      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black opacity-50 z-40"></div>}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={toggleSidebar}
              className="text-3xl text-red-500 p-2 rounded-full hover:bg-gray-200 focus:outline-none sm:hidden"
            >
              <FaBars />
            </button>
            <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
              Discover Restaurants
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row justify-between mb-6 items-center space-y-4 sm:space-y-0">
            <div className="flex items-center w-full sm:w-auto">
              <FaSearch className="text-red-500 mr-2" />
              <input
                type="text"
                placeholder="Search for your favorite food..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
              />
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              <select
                value={selectedFilter}
                onChange={handleFilterChange}
                className="p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
              >
                <option value="All">All</option>
                <option value="Finnish">Finnish</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {restaurants
              .filter(
                (restaurant) =>
                  restaurant.resturantname.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  (selectedFilter === 'All' || restaurant.cuisin_type.toLowerCase() === selectedFilter.toLowerCase())
              )
              .map((restaurant) => (
                <div
                  key={restaurant.resturantid}
                  className="bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-xl rounded-lg p-6 transition-all"
                >
                  <h3 className="text-lg font-bold text-red-500 truncate">{restaurant.resturantname}</h3>
                  <p className="text-gray-600 mt-2">{restaurant.cuisin_type}</p>
                  <p className="text-gray-500 mt-1">{restaurant.location}</p>
                  <button
                    className="mt-4 w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:bg-gradient-to-l transition-all"
                    onClick={() => handleViewMenu(restaurant.resturantid)}
                  >
                    View Menu
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
