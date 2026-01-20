import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaArrowLeft, FaShoppingCart, FaUtensils, 
  FaMotorcycle, FaCheckCircle, FaClock 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);

  // Get user id
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded?.userid;
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setMessage("User not authenticated");
      setLoading(false);
      return;
    }

    // Connect with userId in URL directly
    const newSocket = io(`http://192.168.0.200:5020/notify.v1?userId=${userId}`, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setLoading(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("❌ connect_error", err.message);
      setMessage("Connection failed");
      setLoading(false);
    });

    newSocket.on("message", (data: any) => {
      console.log("📩 Incoming socket data:", data);

      if (data.notifications) {
        setNotifications(data.notifications);
      }
      if (data.message) {
        setMessage(data.message);
      }
      if (data.error) {
        setMessage(data.error);
      }
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Icon mapping
  const getNotificationIcon = (status: string) => {
    switch (status) {
      case 'createorder':
        return <FaShoppingCart className="text-gray-500" />;
      case 'tempstatuschange':
        return <FaUtensils className="text-orange-500" />;
      case 'order_assigned':
        return <FaMotorcycle className="text-blue-500" />;
      case 'order_completed':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  // Status-friendly text
  const getStatusText = (notification: any) => {
    switch (notification.status) {
      case 'pending':
        return "Your order has been placed.";
      case 'inprogress':
        return "Your order is being prepared.";
      case 'startedpreparing':
        return "The restaurant started preparing your food.";
      case 'order_assigned':
        return "A delivery partner is on the way.";
      case 'order_completed':
        return "Your order has been delivered. Enjoy your meal!";
      default:
        return notification.note || "Order update received.";
    }
  };   
   
  // Timeline-like grouping
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diff = today.getDate() - date.getDate();
 
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Group by day
  const groupedNotifications = notifications.reduce((groups: any, item) => {
    const dateKey = formatDate(item.created_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Notifications</h1>
        <FaBell className="text-white" />
      </div>

      {/* Content */}
      <div className="p-4">
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-4">
              <FaBell className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">We’ll notify you when something arrives</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]: any) => (
            <div key={date} className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 mb-3">{date}</h2>
              <div className="space-y-3">
                {items.map((notification: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border p-4 shadow-sm flex gap-3 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                        {getNotificationIcon(notification.statustype)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{getStatusText(notification)}</p>
                      {notification.items?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Items: {notification.items.join(", ")}
                        </p>
                      )}
                      <span className="text-xs text-gray-400 mt-2 block">
                        {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
