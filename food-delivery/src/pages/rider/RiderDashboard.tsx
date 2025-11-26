import React, { useState } from "react";
import {
  FaMotorcycle,
  FaClipboardList,
  FaUser,
  FaBell,
  FaWallet,
  FaUserCircle,
  FaMapMarkerAlt,
  FaChartBar,
  FaClock,
  FaRoad,
} from "react-icons/fa";
import * as Switch from "@radix-ui/react-switch";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  raiderid: string;
}

const RiderDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const toggleStatus = async () => {
    const token = localStorage.getItem("raider_token");
    if (!token) return;

    let raiderid: string;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      raiderid = decoded.raiderid;
    } catch {
      return;
    }

    const formData = new FormData();
    formData.append("raiderid", raiderid);

    try {
      const response = await fetch(
        "https://backend.foodapp.transev.site/ops/raiderstatus",
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (response.ok) {
        setIsOnline(result.online_status === "on");
      }
    } catch {}
  };

  const goTo = (route: string, tab: string) => {
    setActiveTab(tab);
    navigate(route);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-7 
      flex justify-between items-center shadow-lg rounded-b-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold">Hi Rider 👋</h2>
          <p className="text-sm opacity-90">Stay online to receive more orders</p>
        </div>
        <FaUserCircle size={42} className="cursor-pointer drop-shadow-lg" />
      </div>

      {/* STATUS CARD */}
      <div className="px-5 mt-5">
        <div className="bg-white p-5 rounded-2xl shadow-md flex justify-between items-center border
        transition-all duration-300 hover:shadow-xl hover:border-orange-400">
          <div>
            <p className="text-sm font-semibold text-gray-600">CURRENT STATUS</p>
            <p
              className={`text-lg font-bold ${
                isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>

          <Switch.Root
            checked={isOnline}
            onCheckedChange={toggleStatus}
            className={`w-16 h-8 rounded-full transition-all relative duration-300 
            ${isOnline ? "bg-green-500 shadow-lg" : "bg-gray-400"}`}
          >
            <Switch.Thumb
              className={`block w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300
              ${isOnline ? "translate-x-8" : "translate-x-1"}`}
            />
          </Switch.Root>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="px-5 mt-6 grid grid-cols-3 gap-4">
        <QuickStat icon={<FaClipboardList />} label="Today Orders" value="7" />
        <QuickStat icon={<FaRoad />} label="Distance" value="22 km" />
        <QuickStat icon={<FaWallet />} label="Incentive" value="₹80" />
      </div>

      {/* MAIN TILES */}
      <div className="px-5 mt-7 grid grid-cols-2 gap-5 pb-28 flex-1 overflow-y-auto">

        <Tile icon={<FaMotorcycle />} title="Ongoing Orders" count="2" />
        <Tile icon={<FaClipboardList />} title="Order History" />
        <Tile icon={<FaChartBar />} title="Earnings Summary" />
        <Tile icon={<FaClock />} title="Shift Time" count="3 hrs" />
        <Tile icon={<FaMapMarkerAlt />} title="Delivery Zones" />
        <Tile icon={<FaBell />} title="Alerts & Updates" />

      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl 
      py-3 flex justify-around items-center rounded-t-2xl">
        <NavItem
          icon={<FaMotorcycle />}
          label="Home"
          active={activeTab === "home"}
          onClick={() => goTo("/rider-dashboard", "home")}
        />
        <NavItem
          icon={<FaWallet />}
          label="Earnings"
          active={activeTab === "earnings"}
          onClick={() => goTo("/rider-earnings", "earnings")}
        />
        <NavItem
          icon={<FaClipboardList />}
          label="Orders"
          active={activeTab === "orders"}
          onClick={() => goTo("/rider-ordermanagement", "orders")}
        />
        <NavItem
          icon={<FaBell />}
          label="Alerts"
          active={activeTab === "alerts"}
          onClick={() => goTo("/rider-notification", "alerts")}
        />
        <NavItem
          icon={<FaUser />}
          label="Profile"
          active={activeTab === "profile"}
          onClick={() => goTo("/rider-profile", "profile")}
        />
      </div>
    </div>
  );
};

/* COMPONENTS */
const QuickStat = ({ icon, label, value }: any) => (
  <div className="bg-white rounded-2xl p-4 shadow-md border flex flex-col items-center 
    transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:border-orange-400">
    <div className="text-orange-500 text-xl mb-1">{icon}</div>
    <p className="text-xs text-gray-500">{label}</p>
    <h3 className="text-lg font-bold text-gray-800 mt-1">{value}</h3>
  </div>
);

const Tile = ({ icon, title, count }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border flex flex-col items-center 
    transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:border-orange-400">
    <div className="text-orange-500 text-4xl mb-2">{icon}</div>
    <p className="text-sm text-gray-600 font-medium">{title}</p>
    {count && (
      <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{count}</h3>
    )}
  </div>
);

const NavItem = ({ icon, label, active, onClick }: any) => (
  <div
    className={`flex flex-col items-center cursor-pointer transition-all duration-300 
      ${active ? "text-orange-500 scale-110" : "text-gray-500 hover:text-orange-400 hover:scale-105"}`}
    onClick={onClick}
  >
    <div className="text-lg">{icon}</div>
    <p className="text-xs mt-1">{label}</p>
  </div>
);

export default RiderDashboard;
