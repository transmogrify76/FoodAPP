import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const badgeClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  accepted: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  rejected: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  default: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

const RestaurantOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const [riders, setRiders] = useState<any[]>([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [assigningRider, setAssigningRider] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('https://backend.foodapp.transev.site');
    setSocket(newSocket);

    newSocket.on('message', (data: any) => {
      setMessage(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const storedRestaurantToken = localStorage.getItem('restaurant_token');
    if (storedRestaurantToken) {
      try {
        const decodedToken: any = jwtDecode(storedRestaurantToken);
        setOwnerId(decodedToken.owenerid);
        fetchRestaurantIds(decodedToken.owenerid);
      } catch (error) {
        console.error('Error decoding token:', error);
        setMessage('Invalid token.');
      }
    } else {
      setMessage('Restaurant token not found in local storage.');
    }
  }, []);

  const fetchRestaurantIds = async (ownerId: string) => {
    try {
      const formData = new FormData();
      formData.append('ownerid', ownerId);

      const response = await fetch('https://backend.foodapp.transev.site/owenerresturentfetch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch restaurant IDs');
        return;
      }

      const data = await response.json();
      const restaurantIdsFromResponse = data.data.map((restaurant: any) => restaurant.restaurantid);
      if (restaurantIdsFromResponse && restaurantIdsFromResponse.length > 0) {
        setRestaurantIds(restaurantIdsFromResponse);
      } else {
        setMessage('No restaurants found for this owner.');
      }
    } catch (error) {
      console.error('Error fetching restaurant IDs:', error);
      setMessage('Error fetching restaurant data.');
    }
  };

  useEffect(() => {
    if (restaurantIds.length === 0) return;

    const fetchOrders = async () => {
      try {
        // Fetch orders for all restaurants
        const allOrders = [];

        for (const restaurantId of restaurantIds) {
          const formData = new FormData();
          formData.append('restaurantid', restaurantId);

          const response = await axios.post('https://backend.foodapp.transev.site/order/orderhistory', formData);

          if (response.data && response.data.order_list) {
            // Add restaurant ID to each order for reference
            const ordersWithRestaurant = response.data.order_list.map((order: any) => ({
              ...order,
              restaurantId: restaurantId
            }));

            allOrders.push(...ordersWithRestaurant);
          }
        }

        setOrders(allOrders);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || 'Error fetching orders!');
        } else {
          setMessage('Unexpected error occurred!');
        }
      }
    };

    fetchOrders();
  }, [restaurantIds]);

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      const formData = new FormData();
      formData.append('orderid', orderId);
      formData.append('updateorderstatus', action === 'accept' ? 'accepted' : 'rejected');

      const response = await axios.post('https://backend.foodapp.transev.site/ops/updateorder', formData);

      if (response.data.message === 'Data update success') {
        setMessage(`Order #${orderId} has been ${action}ed.`);
        setOrders((prev) =>
          prev.map((order) =>
            order.uid === orderId ? { ...order, orderstatus: action === 'accept' ? 'accepted' : 'rejected' } : order
          )
        );
      } else {
        setMessage('Failed to update order status.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Error updating order status.');
    }
  };

  const handlePreparationStatus = async (orderId: string, restaurantId: string, status: 'startedpreparing' | 'inprogress' | 'dispatch') => {
  if (!socket) {
    setMessage('Socket connection not established');
    return;
  }

 
  if (status === 'dispatch') {
    try {
      const data = {
        orderid: orderId,
        restaurantid: restaurantId,
        tempstatus: status,
        preptime: '' // No prep time needed for dispatch
      };

      socket.emit('temporderstatus', data);

      
      setOrders((prev) =>
        prev.map((order) => 
          order.uid === orderId ? { 
            ...order, 
            tempstatus: status,
            orderstatus: 'completed' // Mark as completed
          } : order
        )
      );
      
      setMessage(`Order #${orderId} has been dispatched and marked as completed.`);
    } catch (error) {
      console.error('Error updating preparation status:', error);
      setMessage('Error updating preparation status.');
    }
  } else {
    // For other statuses (startedpreparing, inprogress)
    try {
      const data = {
        orderid: orderId,
        restaurantid: restaurantId,
        tempstatus: status,
        preptime: status === 'inprogress' ? prompt('Enter preparation time (in minutes):') || '' : ''
      };

      socket.emit('temporderstatus', data);

      setOrders((prev) =>
        prev.map((order) => (order.uid === orderId ? { ...order, tempstatus: status } : order))
      );
      
      setMessage(`Order #${orderId} status update requested to '${status}'.`);
    } catch (error) {
      console.error('Error updating preparation status:', error);
      setMessage('Error updating preparation status.');
    }
  }
};

  const fetchAllRiders = async () => {
    try {
      setLoadingRiders(true);
      const response = await axios.get('https://backend.foodapp.transev.site/ops/getallraiders');
      setRiders(response.data.data);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setMessage('Error fetching available riders');
    } finally {
      setLoadingRiders(false);
    }
  };

  const assignRiderToOrder = async (orderId: string) => {
    if (!selectedRiderId) {
      setMessage('Please select a rider first');
      return;
    }

    try {
      setAssigningRider(true);
      const formData = new FormData();
      formData.append('raiderid', selectedRiderId);
      formData.append('orderid', orderId);

      const response = await axios.post(
        'https://backend.foodapp.transev.site/order/assignorderraider',
        formData
      );

      if (response.status === 200) {
        setMessage('Rider assigned successfully');
        setOrders((prev) =>    
          prev.map((order) =>
            order.uid === orderId ? { ...order, assignedRaider: response.data.data } : order
          )
        );
        setShowRiderModal(false);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error assigning rider');
      console.error('Assignment error:', error);
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
    setMessage(`Delivery option '${option}' selected for order #${orderId}`);
    setOrders((prev) =>
      prev.map((order) => (order.uid === orderId ? { ...order, deliveryOption: option } : order))
    );
  };

  const getBadgeClass = (status?: string) => {
    if (!status) return badgeClasses.default;
    return badgeClasses[status] || badgeClasses.default;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-white to-orange-100">
      
      <div className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center shadow-lg">
        <button onClick={() => navigate(-1)} className="mr-3 rounded-full bg-white/20 p-2">
          <FaArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Orders</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Toast */}
          {message && (
            <div className="mb-4 animate-fadeIn">
              <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-900 px-4 py-3 shadow-md">
                {message}
              </div>
            </div>
          )}

          {/* Orders */}
          {orders.length > 0 ? (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.uid}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100"
                >
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-500 to-orange-600" />

                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-100">
                          <FaShoppingCart className="text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-gray-800">
                            {order.items[0]?.menu?.menuname || 'N/A'}
                          </h2>
                          <p className="text-xs text-gray-500">#{order.uid}</p>
                          <p className="text-xs text-gray-400">Restaurant ID: {order.restaurantId}</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getBadgeClass(
                          order.orderstatus
                        )}`}
                      >
                        {order.orderstatus || 'N/A'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-medium text-black">{order.items[0]?.quantity || 0}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-semibold text-green-600">₹{order.totalprice || 0}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-black">{order.useraddress || 'No address provided'}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 col-span-2">
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-black">{order.usercontact || 'No contact provided'}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Ordered On</p>
                        <p className="text-gray-800" >{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {order.orderstatus === 'pending' && (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleOrderAction(order.uid, 'accept')}
                          className="flex-1 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow hover:brightness-110 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.uid, 'reject')}
                          className="flex-1 rounded-full bg-red-600 text-white px-4 py-2 text-sm font-medium shadow hover:brightness-110 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}

  
                    {order.orderstatus === 'accepted' && (
                      <div className="mt-6 space-y-5">
                        {/* Delivery Options */}
                        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4 ring-1 ring-orange-100">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Delivery Method</h3>
                          <div className="flex gap-3">
                            {order.assignedRaider ? (
                              <div className="flex-1 rounded-xl bg-green-50 ring-1 ring-green-100 p-3">
                                <p className="text-sm text-green-800">
                                  Rider:&nbsp;
                                  <span className="font-semibold">
                                    {order.assignedRaider.raiderfullname}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleDeliveryOption(order.uid, 'self')}
                                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition shadow
                                    ${order.deliveryOption === 'self'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-500 text-white hover:brightness-110'
                                    }`}
                                >
                                  Self Delivery
                                </button>
                                <button
                                  onClick={() => handleRiderSelection(order.uid)}
                                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition shadow
                                    ${order.deliveryOption === 'rider'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-500 text-white hover:brightness-110'
                                    }`}
                                >
                                  {order.deliveryOption === 'rider' ? 'Change Rider' : 'Choose Rider'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Preparation Steps */}
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Preparation</h3>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handlePreparationStatus(order.uid, order.restaurantId, 'startedpreparing')}
                              className="rounded-full bg-orange-600 text-white px-4 py-2 text-xs font-medium hover:brightness-110 transition"
                            >
                              Started
                            </button>
                            <button
                              onClick={() => handlePreparationStatus(order.uid, order.restaurantId, 'inprogress')}
                              className="rounded-full bg-amber-500 text-white px-4 py-2 text-xs font-medium hover:brightness-110 transition"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => handlePreparationStatus(order.uid, order.restaurantId, 'dispatch')}
                              className="rounded-full bg-purple-600 text-white px-4 py-2 text-xs font-medium hover:brightness-110 transition"
                            >
                              Dispatch
                            </button>
                          </div>

                          {order.tempstatus && (
                            <div className="mt-3">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                                Current: {order.tempstatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50 text-center py-14 shadow-inner">
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;