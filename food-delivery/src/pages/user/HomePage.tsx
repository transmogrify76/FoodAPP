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
  FaUtensils,FaSignOutAlt,
  FaChevronRight
,FaBell
,FaUserAlt} from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear(); // Clear all stored data
    navigate('/login');   // Redirect to login page
  };


  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://192.168.0.103:5020/resown/listofresturants');
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

      const response = await fetch('http://192.168.0.103:5020/menu/getmenubyresturantid', {
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
                <FaFile className="text-orange-500 mr-3 text-lg" />
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
                onClick={() => navigate('/menu')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaUtensils className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">All Menus</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaCog className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/favourites')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaRegHeart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">Favorites</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center w-full p-3 rounded-lg hover:bg-orange-100 text-gray-700"
              >
                <FaShoppingCart className="text-orange-500 mr-3 text-lg" />
                <span className="font-medium">View Cart</span>
              </button>
                        <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-red-100 text-red-600 mt-6"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            <span className="font-medium">Logout</span>
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
              <FaBars />
            </button>
            <div className="flex items-center">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
                alt="Logo" 
                className="w-6 h-6 mr-2"
              />
              <h1 className="text-lg font-bold">Foodie Heaven</h1>
            </div>
            <div className="w-6"></div> {/* For balance */}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-3 text-orange-400" />
            <input
              type="text"
              placeholder="Search for restaurants or food..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
            />
          </div>
          
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-orange-500 mr-2" />
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
            >
              <option value="All">All Cuisines</option>
              {/* Add more cuisine options here */}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4">
            <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{error}</p>
          </div>
        )}

        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-4 text-white">
            <h2 className="font-bold text-lg mb-1">Special Offer!</h2>
            <p className="text-sm mb-3">Get 20% off on your first order</p>
            <button className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-semibold">
              Order Now
            </button>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800">Nearby Restaurants</h2>
            <button className="text-orange-500 text-sm flex items-center">
              See all <FaChevronRight className="ml-1 text-xs" />
            </button>
          </div>

          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <div 
                key={restaurant.resturantid}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                onClick={() => handleViewMenu(restaurant.resturantid)}
              >
                <div className="relative">
                  {restaurant.thumbnail && (
                    <img
                      src={`data:image/jpeg;base64,${restaurant.thumbnail}`}
                      alt={restaurant.resturantname}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <button className="absolute top-2 right-2 bg-white p-2 rounded-full text-orange-500 shadow">
                    <FaRegHeart />
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{restaurant.resturantname}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-orange-400" />
                        {restaurant.location}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      4.5 ★
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">30-45 min</span>
                    <button className="text-orange-500 text-xs font-semibold flex items-center">
                      View <FaChevronRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

     
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
<button
        className="text-orange-500 flex flex-col items-center"
        onClick={() => navigate("/home")}
      >
        <FaHome className="text-lg" />
        <span className="text-xs mt-1">Home</span>
      </button>

      <button
        className="text-gray-500 flex flex-col items-center"
        onClick={() => navigate("/notification-user")}
      >
        <FaBell className="text-lg" />
        <span className="text-xs mt-1">Notifications</span>
      </button>

      <button
        className="text-gray-500 flex flex-col items-center"
        onClick={() => navigate("/cart")}
      >
        <FaShoppingCart className="text-lg" />
        <span className="text-xs mt-1">Cart</span>
      </button>

      <button
        className="text-gray-500 flex flex-col items-center"
        onClick={() => navigate("/history")}
      >
        <FaHistory className="text-lg" />
        <span className="text-xs mt-1">Orders</span>
      </button>

      <button
        className="text-gray-500 flex flex-col items-center"
        onClick={() => navigate("/profile")}
      >
        <FaUserAlt className="text-lg" />
        <span className="text-xs mt-1">Profile</span>
      </button>

      </div>
    </div>
  );
};

export default HomePage;  
