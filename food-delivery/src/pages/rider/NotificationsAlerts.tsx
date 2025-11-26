import React, { useState } from "react";
import {
  FaBell,
  FaMoneyBillWave,
  FaTools,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotificationsAlerts = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      message: "New order available: Restaurant A → Customer X (1.2 km)",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      type: "payment",
      message: "Payment received: ₹15.50 for Order #12345",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      type: "system",
      message: "System update: New features available in version 2.1",
      time: "5 hours ago",
      read: false,
    },
  ]);
 
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-6 shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-orange-600/40">
            <FaArrowLeft className="text-xl text-white" />
          </button>

          <h1 className="text-2xl font-bold">Notifications & Alerts</h1>

          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-white underline underline-offset-2"
          >
            Mark all as read
          </button>
        </div>
        <p className="text-orange-100 mt-1">Stay updated with important alerts</p>
      </div>

      {/* PUSH NOTIFICATION SETTING */}
      <div className="p-4 mt-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBell className="text-orange-500 text-xl" />
              <p className="font-semibold text-gray-800">Push Notifications</p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full flex items-center transition-all ${
                notificationsEnabled ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="mt-5 space-y-4">
          {notifications.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`bg-white rounded-2xl p-5 shadow-md border flex gap-4 ${
                !note.read ? "border-l-4 border-orange-500" : "border-orange-100"
              }`}
            >
              {/* Icon */}
              <div className="pt-1">
                {note.type === "order" && <FaBell className="text-orange-500 text-xl" />}
                {note.type === "payment" && <FaMoneyBillWave className="text-green-600 text-xl" />}
                {note.type === "system" && <FaTools className="text-blue-500 text-xl" />}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-gray-800">{note.message}</p>

                <div className="flex justify-between mt-2 items-center">
                  <span className="text-sm text-gray-500">{note.time}</span>

                  {!note.read && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mt-6 border border-orange-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>

          <div className="space-y-5">

            {/* Order Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaBell className="text-orange-500" />
                <span className="text-gray-800">New Order Alerts</span>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>

            {/* Payments */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaMoneyBillWave className="text-green-600" />
                <span className="text-gray-800">Payment Received Alerts</span>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>

            {/* System Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaTools className="text-blue-500" />
                <span className="text-gray-800">System Updates</span>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default NotificationsAlerts;
