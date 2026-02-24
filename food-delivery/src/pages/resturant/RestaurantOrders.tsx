import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

// Status badge styling
const badgeClasses: Record<string, string> = {
  CREATED: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  CONFIRMED: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  REJECTED: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  default: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

const RestaurantOrders: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<string>('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [assigningRider, setAssigningRider] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  const API_BASE = 'http://192.168.0.103:5020';

  // Socket connection
  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    newSocket.on('message', (data: any) => {
      setSuccessMessage(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Decode token and fetch restaurants
  useEffect(() => {
    const token = localStorage.getItem('restaurant_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setOwnerId(decoded.owenerid || '');
        fetchRestaurants(decoded.owenerid);
      } catch (err) {
        console.error('Token decoding failed', err);
        setError('Invalid token.');
      }
    } else {
      setError('Restaurant token not found.');
    }
  }, []);

  const fetchRestaurants = async (ownerId: string) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('ownerid', ownerId);

    try {
      const response = await fetch(`${API_BASE}/owenerresturentfetch`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch restaurants');
        return;
      }
      const data = await response.json();
      setRestaurants(data.data || []);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!selectedRestaurantId) {
      setError('Please select a restaurant first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE}/order/resorderhistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantid: selectedRestaurantId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch orders');
        setOrders([]);
        return;
      }

      const data = await response.json();
      setOrders(data.order_list || []);
      if (data.order_list?.length === 0) {
        setSuccessMessage('No orders found for this restaurant.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for order actions (accept/reject)
  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      const formData = new FormData();
      formData.append('orderid', orderId);
      formData.append('updateorderstatus', action === 'accept' ? 'accepted' : 'rejected');

      const response = await fetch(`${API_BASE}/ops/updateorder`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update order status');
        return;
      }

      const data = await response.json();
      if (data.message === 'Data update success') {
        setSuccessMessage(`Order #${orderId} has been ${action}ed.`);
        setOrders((prev) =>
          prev.map((order) =>
            order.master_order_id === orderId
              ? { ...order, orderstatus: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
              : order
          )
        );
      } else {
        setError('Failed to update order status.');
      }
    } catch (err) {
      setError('Error updating order status.');
    }
  };

  const handlePreparationStatus = async (
    orderId: string,
    restaurantId: string,
    status: 'startedpreparing' | 'inprogress' | 'dispatch'
  ) => {
    if (!socket) {
      setError('Socket connection not established');
      return;
    }

    if (status === 'dispatch') {
      try {
        const data = {
          orderid: orderId,
          restaurantid: restaurantId,
          tempstatus: status,
          preptime: '',
        };
        socket.emit('temporderstatus', data);
        setOrders((prev) =>
          prev.map((order) =>
            order.master_order_id === orderId
              ? { ...order, tempstatus: status, orderstatus: 'COMPLETED' }
              : order
          )
        );
        setSuccessMessage(`Order #${orderId} has been dispatched.`);
      } catch (err) {
        setError('Error updating preparation status.');
      }
    } else {
      const preptime =
        status === 'inprogress' ? prompt('Enter preparation time (in minutes):') || '' : '';
      const data = {
        orderid: orderId,
        restaurantid: restaurantId,
        tempstatus: status,
        preptime,
      };
      socket.emit('temporderstatus', data);
      setOrders((prev) =>
        prev.map((order) =>
          order.master_order_id === orderId ? { ...order, tempstatus: status } : order
        )
      );
      setSuccessMessage(`Order #${orderId} status update to '${status}' requested.`);
    }
  };

  // Rider handling
  const fetchAllRiders = async () => {
    try {
      setLoadingRiders(true);
      const response = await fetch(`${API_BASE}/ops/getallraiders`);
      const data = await response.json();
      setRiders(data.data || []);
    } catch (err) {
      setError('Error fetching riders');
    } finally {
      setLoadingRiders(false);
    }
  };

  const assignRiderToOrder = async (orderId: string) => {
    if (!selectedRiderId) {
      setError('Please select a rider');
      return;
    }

    try {
      setAssigningRider(true);
      const formData = new FormData();
      formData.append('raiderid', selectedRiderId);
      formData.append('orderid', orderId);

      const response = await fetch(`${API_BASE}/order/assignorderraider`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error assigning rider');
        return;
      }

      const data = await response.json();
      setSuccessMessage('Rider assigned successfully');
      setOrders((prev) =>
        prev.map((order) =>
          order.master_order_id === orderId ? { ...order, assignedRaider: data.data } : order
        )
      );
      setShowRiderModal(false);
    } catch (err) {
      setError('Error assigning rider');
    } finally {
      setAssigningRider(false);
    }
  };

  const handleRiderSelection = (orderId: string) => {
    setSelectedOrderId(orderId);
    fetchAllRiders();
    setShowRiderModal(true);
  };

  const handleDeliveryOption = (orderId: string, option: 'self' | 'rider') => {
    setSuccessMessage(`Delivery option '${option}' selected for order #${orderId}`);
    setOrders((prev) =>
      prev.map((order) =>
        order.master_order_id === orderId ? { ...order, deliveryOption: option } : order
      )
    );
  };

  const getBadgeClass = (status?: string) => badgeClasses[status || 'default'] || badgeClasses.default;

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Order History</h1>
        <div className="w-6"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 shadow-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 shadow-md">
            {successMessage}
          </div>
        )}
        {loading && (
          <div className="text-center text-gray-700 font-medium mb-4">Loading...</div>
        )}

        {/* Restaurant Selector Card */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Select Restaurant</h2>
          {restaurants.length > 0 ? (
            <select
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">-- Choose a restaurant --</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.restaurantid} value={restaurant.restaurantid}>
                  {restaurant.restaurantname}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600">No restaurants found.</p>
          )}
          <button
            onClick={fetchOrders}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
            disabled={!selectedRestaurantId || loading}
          >
            {loading ? 'Fetching Orders...' : 'Fetch Orders'}
          </button>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.master_order_id}
                className="bg-white p-4 rounded-xl shadow-md space-y-3"
              >
                {/* Order Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <FaShoppingCart className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.username || 'Guest'}</h3>
                      <p className="text-xs text-gray-500">#{order.master_order_id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeClass(
                      order.orderstatus
                    )}`}
                  >
                    {order.orderstatus}
                  </span>
                </div>

                {/* Restaurant Info */}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{order.restaurant_name}</span> • {order.restaurant_address}
                </p>

                {/* Menu Items */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Items:</p>
                  {order.menu && order.menu.length > 0 ? (
                    order.menu.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-800">
                          {item.menuname} x {item.quantity}
                        </span>
                        <span className="font-medium text-green-600">
                          ₹{item.menuprice * item.quantity}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No item details</p>
                  )}
                </div>

                {/* Payment & Contact */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold text-green-600">₹{order.totalprice}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="text-gray-700">
                      {order.payment_mode} • {order.payment_status}
                    </p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-700">{order.useraddress || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-gray-700">{order.user_phone_no || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Ordered On</p>
                    <p className="text-gray-700">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.orderstatus === 'CREATED' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleOrderAction(order.master_order_id, 'accept')}
                      className="flex-1 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleOrderAction(order.master_order_id, 'reject')}
                      className="flex-1 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {(order.orderstatus === 'ACCEPTED' || order.orderstatus === 'CONFIRMED') && (
                  <div className="space-y-4 pt-2">
                    {/* Delivery Options */}
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <p className="text-sm font-medium text-gray-800 mb-2">Delivery Method</p>
                      {order.assignedRaider ? (
                        <p className="text-sm text-green-800">
                          Rider: {order.assignedRaider.raiderfullname}
                        </p>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeliveryOption(order.master_order_id, 'self')}
                            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                              order.deliveryOption === 'self'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            Self Delivery
                          </button>
                          <button
                            onClick={() => handleRiderSelection(order.master_order_id)}
                            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                              order.deliveryOption === 'rider'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {order.deliveryOption === 'rider' ? 'Change Rider' : 'Choose Rider'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preparation Steps */}
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm font-medium text-gray-800 mb-2">Preparation</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            handlePreparationStatus(
                              order.master_order_id,
                              order.restaurantid,
                              'startedpreparing'
                            )
                          }
                          className="py-2 rounded-full bg-orange-600 text-white text-xs hover:bg-orange-700"
                        >
                          Started
                        </button>
                        <button
                          onClick={() =>
                            handlePreparationStatus(order.master_order_id, order.restaurantid, 'inprogress')
                          }
                          className="py-2 rounded-full bg-amber-500 text-white text-xs hover:bg-amber-600"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() =>
                            handlePreparationStatus(order.master_order_id, order.restaurantid, 'dispatch')
                          }
                          className="py-2 rounded-full bg-purple-600 text-white text-xs hover:bg-purple-700"
                        >
                          Dispatch
                        </button>
                      </div>
                      {order.tempstatus && (
                        <p className="mt-2 text-xs text-gray-600">
                          Current: <span className="font-medium">{order.tempstatus}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
              No orders to display. Select a restaurant and click "Fetch Orders".
            </div>
          )
        )}
      </div>

      {/* Rider Selection Modal */}
      {showRiderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Select a Rider</h3>
            {loadingRiders ? (
              <p>Loading riders...</p>
            ) : (
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
              >
                <option value="">Choose a rider</option>
                {riders.map((rider) => (
                  <option key={rider.raiderid} value={rider.raiderid}>
                    {rider.raiderfullname} ({rider.raidercontact})
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => assignRiderToOrder(selectedOrderId)}
                disabled={assigningRider || !selectedRiderId}
                className="flex-1 bg-blue-600 text-white rounded-full py-2 disabled:opacity-50"
              >
                {assigningRider ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => setShowRiderModal(false)}
                className="flex-1 bg-gray-200 rounded-full py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;