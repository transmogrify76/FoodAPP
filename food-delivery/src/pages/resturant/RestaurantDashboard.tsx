import React from "react";
import {
  FaHome,
  FaListAlt,
  FaUtensils,
  FaCog,
  FaChartBar,
  FaPlus,
  FaUserCircle,
  FaTrash, // ✅ Added delete icon
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();

  const navigateTo = (route: string) => {
    navigate(route);
  };

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">

      {/* HEADER */}
      <div className="bg-orange-500 text-white px-5 py-4 flex justify-between items-center rounded-b-3xl shadow-md">
        <div>
          <h2 className="text-lg font-semibold">Welcome Back</h2>
          <p className="text-sm opacity-90">Manage your restaurant with ease</p>
        </div>
        <FaUserCircle size={32} className="cursor-pointer" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-4">
        <QuickAction
          icon={<FaPlus />}
          label="Create Restaurant"
          color="bg-gradient-to-r from-orange-400 to-orange-600"
          onClick={() => navigateTo("/restaurant-create")}
        />
        <QuickAction
          icon={<FaUtensils />}
          label="Manage Menu"
          color="bg-gradient-to-r from-yellow-400 to-orange-500"
          onClick={() => navigateTo("/create-menu")}
        />
     
      
      </div>

      {/* DASHBOARD TILES */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-20">
        <DashboardTile
          icon={<FaHome />}
          title="Profile"
          onClick={() => navigateTo("/restaurant-details")}
        />
        <DashboardTile
          icon={<FaListAlt />}
          title="Orders"
          onClick={() => navigateTo("/restaurant-orders")}
        />
        <DashboardTile
          icon={<FaChartBar />}
          title="Reports"
          onClick={() => navigateTo("/report")}
        />
        <DashboardTile
          icon={<FaUtensils />}
          title="Existing Menus"
          onClick={() => navigateTo("/existingmenu")}
        />
        <DashboardTile
          icon={<FaCog />}
          title="Settings"
          onClick={() => navigateTo("/restaurant-settings")}
        />
        {/* ✅ New Dashboard Tile for Delete Restaurant */}
        <DashboardTile
          icon={<FaTrash />}
          title="Delete Restaurant"
          onClick={() => navigateTo("/delete-restaurant")}
        />
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 shadow-lg">
        <NavItem
          icon={<FaHome />}
          label="Home"
          active
          onClick={() => navigateTo("/restaurant-dashboard")}
        />
        <NavItem
          icon={<FaListAlt />}
          label="Orders"
          onClick={() => navigateTo("/restaurant-orders")}
        />
        <NavItem
          icon={<FaUtensils />}
          label="Menu"
          onClick={() => navigateTo("/create-menu")}
        />
        <NavItem
          icon={<FaCog />}
          label="Settings"
          onClick={() => navigateTo("/restaurant-settings")}
        />
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, color, onClick }: any) => (
  <div
    className={`${color} text-white flex flex-col items-center justify-center rounded-2xl p-4 shadow-lg cursor-pointer`}
    onClick={onClick}
  >
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-sm font-semibold">{label}</p>
  </div>
);

const DashboardTile = ({ icon, title, onClick }: any) => (
  <div
    className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition"
    onClick={onClick}
  >
    <div className="text-orange-500 text-2xl mb-2">{icon}</div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
  </div>
);

const NavItem = ({ icon, label, active, onClick }: any) => (
  <div
    className={`flex flex-col items-center cursor-pointer ${
      active ? "text-orange-500" : "text-gray-500"
    }`}
    onClick={onClick}
  >
    <div className="text-lg">{icon}</div>
    <p className="text-xs mt-1">{label}</p>
  </div>
);

export default RestaurantDashboard;
