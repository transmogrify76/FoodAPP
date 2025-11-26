import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaWallet,
  FaHistory,
  FaArrowLeft,
  FaCalendarAlt,
  FaFileDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EarningsTransactions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("earnings");

  const earningsData = {
    totalEarnings: "1,250.50",
    breakdown: [
      { id: 1, date: "2023-10-01", orderId: "#12345", amount: "15.50" },
      { id: 2, date: "2023-10-02", orderId: "#12346", amount: "18.00" },
      { id: 3, date: "2023-10-03", orderId: "#12347", amount: "12.50" },
    ],
    weeklyReport: {
      currentWeek: "150.00",
      lastWeek: "175.00",
    },
    monthlyReport: {
      currentMonth: "600.00",
      lastMonth: "550.00",
    },
  };

  const walletData = {
    balance: "250.00",
    paymentHistory: [
      {
        id: 1,
        date: "2023-09-28",
        amount: "200.00",
        method: "Bank Transfer",
        status: "Completed",
      },
      {
        id: 2,
        date: "2023-09-15",
        amount: "150.00",
        method: "UPI",
        status: "Completed",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-6 shadow-lg rounded-b-3xl flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">Earnings & Transactions</h1>
      </div>

      {/* TABS */}
      <div className="px-5 mt-5 flex space-x-3">
        <button
          onClick={() => setActiveTab("earnings")}
          className={`flex-1 py-2 rounded-full font-semibold transition-all ${
            activeTab === "earnings"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white border text-gray-700 hover:bg-orange-50"
          }`}
        >
          Earnings
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 py-2 rounded-full font-semibold transition-all ${
            activeTab === "wallet"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white border text-gray-700 hover:bg-orange-50"
          }`}
        >
          Wallet
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-5 space-y-5">

        {activeTab === "earnings" ? (
          <>
            {/* TOTAL EARNINGS */}
            <div className="bg-white p-5 rounded-2xl shadow-md border flex justify-between items-center hover:shadow-lg transition">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">
                  ₹{earningsData.totalEarnings}
                </p>
              </div>
              <FaMoneyBillWave className="text-orange-500 text-4xl" />
            </div>

            {/* WEEKLY & MONTHLY REPORT */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center space-x-2">
                  <FaChartLine className="text-orange-500 text-lg" />
                  <p className="font-semibold">Weekly Report</p>
                </div>
                <p className="text-sm mt-2 text-gray-700">
                  This Week:{" "}
                  <span className="font-bold text-gray-900">
                    ₹{earningsData.weeklyReport.currentWeek}
                  </span>
                </p>
                <p className="text-sm">
                  Last Week:{" "}
                  <span className="font-bold text-gray-900">
                    ₹{earningsData.weeklyReport.lastWeek}
                  </span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-orange-500 text-lg" />
                  <p className="font-semibold">Monthly Report</p>
                </div>
                <p className="text-sm mt-2 text-gray-700">
                  This Month:{" "}
                  <span className="font-bold text-gray-900">
                    ₹{earningsData.monthlyReport.currentMonth}
                  </span>
                </p>
                <p className="text-sm">
                  Last Month:{" "}
                  <span className="font-bold text-gray-900">
                    ₹{earningsData.monthlyReport.lastMonth}
                  </span>
                </p>
              </div>
            </div>

            {/* EARNINGS BREAKDOWN */}
            <div className="bg-white rounded-2xl shadow-md border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900 text-lg">
                  Earnings Breakdown
                </h2>
              </div>

              <div>
                {earningsData.breakdown.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 border-b last:border-none hover:bg-orange-50 transition"
                  >
                    <div>
                      <p className="font-medium">{item.orderId}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>

                    <p className="font-bold text-gray-800">₹{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* WALLET BALANCE */}
            <div className="bg-white p-5 rounded-2xl shadow-md border flex justify-between items-center hover:shadow-lg transition">
              <div>
                <p className="text-gray-500 text-sm font-medium">Wallet Balance</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">
                  ₹{walletData.balance}
                </p>
              </div>
              <FaWallet className="text-orange-500 text-4xl" />
            </div>

            {/* WITHDRAW OPTIONS */}
            <div className="bg-white p-5 rounded-2xl shadow-md border">
              <h2 className="font-semibold text-gray-900 mb-4">Withdraw Money</h2>

              <button className="w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 transition mb-3">
                Bank Transfer
              </button>

              <button className="w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 transition">
                UPI Transfer
              </button>
            </div>

            {/* PAYMENT HISTORY */}
            <div className="bg-white rounded-2xl shadow-md border">
              <div className="p-4 border-b flex justify-between items-center">
                <p className="font-semibold text-gray-900 text-lg">
                  Payment History
                </p>

                <button className="p-2 rounded-full text-orange-500 hover:bg-orange-100 transition">
                  <FaFileDownload className="text-xl" />
                </button>
              </div>

              <div>
                {walletData.paymentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border-b last:border-none hover:bg-orange-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.method}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{item.amount}</p>
                        <p className="text-green-500 text-sm font-semibold">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EarningsTransactions;
