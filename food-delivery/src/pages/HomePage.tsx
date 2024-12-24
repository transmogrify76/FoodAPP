import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaBars, FaRegHeart, FaShoppingBag, FaHome, FaHistory, FaCog } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for nearby Indian restaurants
  const restaurants = [
    { id: 1, name: 'Spice Junction', type: 'Indian', location: 'New Delhi' },
    { id: 2, name: 'Tandoori Delights', type: 'Indian', location: 'Mumbai' },
    { id: 3, name: 'Curry House', type: 'Indian', location: 'Kolkata' },
    { id: 4, name: 'Masala Magic', type: 'Indian', location: 'Bangalore' },
    { id: 5, name: 'Saffron Garden', type: 'Indian', location: 'Chennai' },
    { id: 6, name: 'Naan Stop', type: 'Indian', location: 'Hyderabad' },
    { id: 7, name: 'Chutney Villa', type: 'Indian', location: 'Ahmedabad' },
    { id: 8, name: 'Biryani Bliss', type: 'Indian', location: 'Pune' },
    { id: 9, name: 'Roti Roll', type: 'Indian', location: 'Delhi' },
    { id: 10, name: 'Chai Shai', type: 'Indian', location: 'Mumbai' },
    { id: 11, name: 'Kebab Kingdom', type: 'Indian', location: 'Lucknow' },
    { id: 12, name: 'Tikka Tale', type: 'Indian', location: 'Chandigarh' },
    { id: 13, name: 'Flavors of India', type: 'Indian', location: 'Goa' },
    { id: 14, name: 'Mirchi Mystery', type: 'Indian', location: 'Jaipur' },
    { id: 15, name: 'Dosa Dream', type: 'Indian', location: 'Bangalore' },
    { id: 16, name: 'Garam Masala', type: 'Indian', location: 'Mumbai' },
    { id: 17, name: 'Curry in a Hurry', type: 'Indian', location: 'Kochi' },
    { id: 18, name: 'Spice by the Bay', type: 'Indian', location: 'Kochi' },
    { id: 19, name: 'Butter Chicken Bistro', type: 'Indian', location: 'Chennai' },
    { id: 20, name: 'Palak Palace', type: 'Indian', location: 'Delhi' },
    { id: 21, name: 'Chai Palace', type: 'Indian', location: 'Kolkata' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between p-4 bg-red-600 text-white">
          <h3 className="text-2xl font-bold">Chitradeep !</h3>
          <button onClick={toggleSidebar} className="text-2xl">
            <AiOutlineClose />
          </button>
        </div>
        <div className="p-4">
          <ul>
            <li className="mb-4 flex items-center">
              <FaHome className="text-red-600 mr-3 text-xl" />
              <button className="w-full text-left text-gray-600 hover:text-red-600">Home</button>
            </li>
            <li className="mb-4 flex items-center">
              <FaHistory className="text-red-600 mr-3 text-xl" />
              <button className="w-full text-left text-gray-600 hover:text-red-600">Order History</button>
            </li>
            <li className="mb-4 flex items-center">
              <FaShoppingBag className="text-red-600 mr-3 text-xl" />
              <button className="w-full text-left text-gray-600 hover:text-red-600">Order Tracking</button>
            </li>
            <li className="mb-4 flex items-center">
              <FaCog className="text-red-600 mr-3 text-xl" />
              <button className="w-full text-left text-gray-600 hover:text-red-600">Settings</button>
            </li>
            <li className="mb-4 flex items-center">
              <FaRegHeart className="text-red-600 mr-3 text-xl" />
              <button className="w-full text-left text-gray-600 hover:text-red-600">Favorites</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 p-1 sm:p-6">
        <div className="bg-white shadow-lg rounded-lg p-5">
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={toggleSidebar}
              className="text-3xl text-red-600 p-2 rounded-full hover:bg-gray-200 focus:outline-none sm:hidden"
            >
              <FaBars />
            </button>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-red-600 sm:ml-2">Nearby Restaurants</h1>
          </div>
          <div className="flex justify-between mb-4 items-center">
            <div className="flex items-center">
              <FaSearch className="text-red-600 mr-2" />
              <input
                type="text"
                placeholder="Search for restaurants..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-2 sm:p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-3/4 sm:w-1/2"
              />
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-red-600 mr-2" />
              <select
                value={selectedFilter}
                onChange={handleFilterChange}
                className="p-2 sm:p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants
              .filter(
                (restaurant) =>
                  restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  (selectedFilter === 'All' || restaurant.type === selectedFilter)
              )
              .map((restaurant) => (
                <div key={restaurant.id} className="bg-white shadow-md rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-red-600">{restaurant.name}</h3>
                  <p className="text-gray-600">{restaurant.type}</p>
                  <p className="text-gray-500">{restaurant.location}</p>
                  <button className="mt-4 w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-all">
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
