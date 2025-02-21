import React, { useState } from 'react';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaWallet, 
  FaHistory, 
  FaArrowLeft,
  FaCalendarAlt,
  FaFileDownload
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EarningsTransactions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('earnings');

  const earningsData = {
    totalEarnings: '1,250.50',
    breakdown: [
      { id: 1, date: '2023-10-01', orderId: '#12345', amount: '15.50' },
      { id: 2, date: '2023-10-02', orderId: '#12346', amount: '18.00' },
      { id: 3, date: '2023-10-03', orderId: '#12347', amount: '12.50' }
    ],
    weeklyReport: {
      currentWeek: '150.00',
      lastWeek: '175.00'
    },
    monthlyReport: {
      currentMonth: '600.00',
      lastMonth: '550.00'
    }
  };

  const walletData = {
    balance: '250.00',
    paymentHistory: [
      { id: 1, date: '2023-09-28', amount: '200.00', method: 'Bank Transfer', status: 'Completed' },
      { id: 2, date: '2023-09-15', amount: '150.00', method: 'UPI', status: 'Completed' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Earnings & Transactions</h1>
        </div>
      </div>

      <div className="flex space-x-2 p-4">
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-2 px-4 rounded-full font-medium {
            activeTab === 'earnings'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-800 border'
          }`}
        >
          Earnings
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-2 px-4 rounded-full font-medium {
            activeTab === 'wallet'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-800 border'
          }`}
        >
          Wallet
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'earnings' ? (
          <>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Total Earnings</h2>
                  <p className="text-3xl font-bold text-red-500">{earningsData.totalEarnings}</p>
                </div>
                <FaMoneyBillWave className="text-4xl text-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaChartLine className="text-red-500" />
                  <h3 className="font-semibold">Weekly Report</h3>
                </div>
                <div className="space-y-1">
                  <p>This Week: {earningsData.weeklyReport.currentWeek}</p>
                  <p>Last Week: {earningsData.weeklyReport.lastWeek}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarAlt className="text-red-500" />
                  <h3 className="font-semibold">Monthly Report</h3>
                </div>
                <div className="space-y-1">
                  <p>This Month: {earningsData.monthlyReport.currentMonth}</p>
                  <p>Last Month: {earningsData.monthlyReport.lastMonth}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Earnings Breakdown</h2>
              </div>
              <div className="divide-y">
                {earningsData.breakdown.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.orderId}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <span className="font-semibold">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Wallet Balance</h2>
                  <p className="text-3xl font-bold text-red-500">{walletData.balance}</p>
                </div>
                <FaWallet className="text-4xl text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Withdrawal Options</h2>
              <div className="space-y-2">
                <button className="w-full p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                  Bank Transfer
                </button>
                <button className="w-full p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                  UPI Transfer
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Payment History</h2>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                  <FaFileDownload className="text-xl" />
                </button>
              </div>
              <div className="divide-y">
                {walletData.paymentHistory.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.method}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.amount}</p>
                        <p className={`text-sm {
                          item.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
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