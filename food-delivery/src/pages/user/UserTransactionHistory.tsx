import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
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
        // Retrieve the token (assumed to be stored under "user_token")
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('token not found.');
        }

        // Decode the token to get the user id
        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userid;
        if (!userId) {
          throw new Error('User ID not found in token.');
        }

        // Create a payload with the user ID
        const formData = new FormData();
        formData.append('userid', userId);

        // Make the API call to your Flask endpoint
        const response = await fetch('http://localhost:5000/ops/usertransactionhistory', {
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
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center text-red-600 mb-8">
        Your Transaction History
      </h1>
      
      {transactionHistory && (
        <>
          {/* Summary Card */}
          <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-8">
            <p className="text-lg font-semibold">
              Total Transactions: {transactionHistory.transaction_count}
            </p>
            <p className="text-lg font-semibold">
              Total Spent: ₹{transactionHistory.total_spent} {transactionHistory.currency}
            </p>
          </div>

          {/* Transaction List */}
          <div className="space-y-6">
            {transactionHistory.transactions.map((transaction, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-4">
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserTransactionHistoryPage;
