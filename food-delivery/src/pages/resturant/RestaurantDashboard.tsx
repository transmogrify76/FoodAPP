import React from "react";
import {
  FaHome,
  FaListAlt,
  FaUtensils,
  FaCog,
  FaChartBar,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();

  const navigateTo = (route: string) => {
    navigate(route);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      <div className="bg-red-600 text-white p-4 flex justify-around items-center">
        <div
          onClick={() => navigateTo("/restaurant-dashboard")}
          className="flex flex-col items-center cursor-pointer"
        >
          <FaHome size={24} />
          <span className="text-sm mt-1">Dashboard</span>
        </div>
        <div
          onClick={() => navigateTo("/restaurant-orders")}
          className="flex flex-col items-center cursor-pointer"
        >
          <FaListAlt size={24} />
          <span className="text-sm mt-1">Orders</span>
        </div>
        <div
          onClick={() => navigateTo("/create-menu")}
          className="flex flex-col items-center cursor-pointer"
        >
          <FaUtensils size={24} />
          <span className="text-sm mt-1">Menu</span>
        </div>
        <div
          onClick={() => navigateTo("/report")}
          className="flex flex-col items-center cursor-pointer"
        >
          <FaChartBar size={24} />
          <span className="text-sm mt-1">Reports</span>
        </div>
        <div
          onClick={() => navigateTo("/restaurant-settings")}
          className="flex flex-col items-center cursor-pointer"
        >
          <FaCog size={24} />
          <span className="text-sm mt-1">Settings</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Welcome to your Dashboard
        </h2>
        <div className="grid grid-cols-1 gap-4">

          <div
            onClick={() => navigateTo("/restaurant-details")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Restaurant Profile
            </h3>
            <p className="text-sm text-gray-600">
              View and update your restaurant details
            </p>
          </div>
          <div
            onClick={() => navigateTo("/restaurant-orders")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Orders</h3>
            <p className="text-sm text-gray-600">
              View and manage incoming orders
            </p>
          </div>
          <div
            onClick={() => navigateTo("/create-menu")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Menu Management
            </h3>
            <p className="text-sm text-gray-600">
              Add, update, or remove menu items
            </p>
          </div>
          <div
            onClick={() => navigateTo("/existingmenu")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Existing Menus</h3>
            <p className="text-sm text-gray-600">
              View your exising menus here to modify them 
            </p>
          </div>
          <div
            onClick={() => navigateTo("/restaurant-settings")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Settings 
            </h3>
            <p className="text-sm text-gray-600">
              Manage your account and preferences
            </p>
          </div>
          <div
            onClick={() => navigateTo("/restaurant-create")}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FaPlus className="mr-2 text-red-500" />
              Create Restaurant
            </h3>
            <p className="text-sm text-gray-600">
              Start a new restaurant by adding its details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
