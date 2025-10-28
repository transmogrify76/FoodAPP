import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { IoCalendar, IoPricetag } from 'react-icons/io5';

interface Transaction {
  date: string;
  price: number;
}

interface TransactionHistoryResponse {
  transaction_count: number;
  total_spent: number;
  currency: string;
  transactions: Transaction[];
}

interface DecodedToken {
  userid: string;
}

const UserTransactionHistoryPage: React.FC = () => {
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('token not found.');  
        }

        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userid;
        if (!userId) {
          throw new Error('User ID not found in token.');
        }

        const formData = new FormData();
        formData.append('userid', userId);

        const response = await fetch('https://backend.foodapp.transev.site/ops/usertransactionhistory', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transaction history.');
        }

        const data = await response.json();
        setTransactionHistory(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 via-white to-gray-100">
        <p className="text-red-600 text-xl font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-red-500 via-white to-gray-100 min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10">
        <h1 className="text-xl font-bold">Transaction History</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-20">
        
        {transactionHistory && (
          <>
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
              <p className="text-lg font-semibold">
                Total Transactions: {transactionHistory.transaction_count}
              </p>
              <p className="text-lg font-semibold">
                Total Spent: ₹{transactionHistory.total_spent} {transactionHistory.currency}
              </p>
            </div>

            <div className="space-y-6">
              {transactionHistory.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <IoCalendar className="text-gray-500" />
                      <span className="text-lg font-semibold">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoPricetag className="text-gray-500" />
                      <span className="text-xl font-semibold">
                        ₹{Number(transaction.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  ); 
};

export default UserTransactionHistoryPage;
