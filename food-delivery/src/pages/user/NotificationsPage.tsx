import React, { useState, useEffect } from 'react';
import { FaBell, FaArrowLeft, FaShoppingCart, FaUtensils, FaMotorcycle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user ID from localStorage or context
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserId(parsedData.userid || parsedData.uid);
    }

    // Initialize Socket.IO connection
    const newSocket = io('https://backend.foodapp.transev.site');
    setSocket(newSocket);

    // Listen for notifications response
    newSocket.on('message', (data: any) => {
      if (data.notifications) {
        setNotifications(data.notifications);
        setLoading(false);
      }
      if (data.message) {
        setMessage(data.message);
      }
      if (data.error) {
        setMessage(data.error);
        setLoading(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && userId) {
      // Fetch notifications when socket and user ID are ready
      socket.emit('fetchnotificationsforuserid', { userid: userId });
    }
  }, [socket, userId]);

  const getNotificationIcon = (statustype: string) => {
    switch (statustype) {
      case 'tempstatuschange':
        return <FaUtensils className="text-orange-500" />;
      case 'order_assigned':
        return <FaMotorcycle className="text-blue-500" />;
      case 'order_completed':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaShoppingCart className="text-gray-500" />;
    }
  };

  const getNotificationColor = (statustype: string) => {
    switch (statustype) {
      case 'tempstatuschange':
        return 'bg-orange-50 border-orange-200';
      case 'order_assigned':
        return 'bg-blue-50 border-blue-200';
      case 'order_completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleRefresh = () => {
    if (socket && userId) {
      setLoading(true);
      socket.emit('fetchnotificationsforuserid', { userid: userId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
          <button onClick={() => navigate(-1)} className="mr-3">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">Notifications</h1>
          <div className="w-8"></div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Notifications</h1>
        <button onClick={handleRefresh} className="p-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {message && (
          <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 px-4 py-3 shadow-sm">
            {message}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-4">
              <FaBell className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">We'll notify you when something arrives</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${getNotificationColor(
                  notification.statustype
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-2 ring-white">
                      {getNotificationIcon(notification.statustype)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 capitalize">
                        {notification.statustype?.replace(/_/g, ' ') || 'Notification'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message || `Order #${notification.order_id} status updated`}
                    </p>

                    {notification.items && notification.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600">Items:</p>
                        <ul className="text-xs text-gray-500 mt-1">
                          {notification.items.slice(0, 3).map((item: string, idx: number) => (
                            <li key={idx}>• {item}</li>
                          ))}
                          {notification.items.length > 3 && (
                            <li className="text-orange-500">
                              +{notification.items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {notification.preptime && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          Prep time: {notification.preptime} min
                        </span>
                      </div>
                    )}

                    {notification.order_id && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/order/${notification.order_id}`)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View Order Details →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      {notifications.length > 0 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <FaArrowLeft className="transform rotate-90" />
        </button>
      )}
    </div>
  );
};

export default NotificationsPage;