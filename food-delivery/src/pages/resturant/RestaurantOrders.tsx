import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [riders, setRiders] = useState<any[]>([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [assigningRider, setAssigningRider] = useState(false);

  useEffect(() => {
    const storedRestaurantToken = localStorage.getItem('restaurant_token');
    if (storedRestaurantToken) {
      try {
        const decodedToken: any = jwtDecode(storedRestaurantToken);
        setOwnerId(decodedToken.owenerid);
        fetchRestaurantId(decodedToken.owenerid);
      } catch (error) {
        console.error('Error decoding token:', error);
        setMessage('Invalid token.');
      }
    } else {
      setMessage('Restaurant token not found in local storage.');
    }
  }, []);

  const fetchRestaurantId = async (ownerId: string) => {
    try {
      const formData = new FormData();
      formData.append('ownerid', ownerId);

      const response = await fetch('https://backend.foodapp.transev.site/owenerresturentfetch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch restaurant ID');
        return;
      }

      const data = await response.json();
      const restaurantIdFromResponse = data.data[0]?.restaurantid;
      if (restaurantIdFromResponse) {
        setRestaurantId(restaurantIdFromResponse);
      } else {
        setMessage('No restaurant found for this owner.');
      }
    } catch (error) {
      console.error('Error fetching restaurant ID:', error);
      setMessage('Error fetching restaurant data.');
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const fetchOrders = async () => {
      try {
        const formData = new FormData();
        formData.append('restaurantid', restaurantId);

        const response = await axios.post('https://backend.foodapp.transev.site/order/orderhistory', formData);
        setOrders(response.data.order_list);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || 'Error fetching orders!');
        } else {
          setMessage('Unexpected error occurred!');
        }
      }
    };

    fetchOrders();
  }, [restaurantId]);

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

  const handlePreparationStatus = async (orderId: string, status: 'startedpreparing' | 'inprogress' | 'dispatch') => {
    try {
      const formData = new FormData();
      formData.append('orderid', orderId);
      formData.append('tempstatus', status);
      formData.append('restaurantid', restaurantId);
      formData.append('userid', ownerId);

      if (status === 'inprogress') {
        const preptime = prompt('Enter preparation time (in minutes):');
        if (!preptime) {
          setMessage('Preparation time is required for "inprogress" status.');
          return;
        }
        formData.append('preptime', preptime);
      }

      const response = await axios.post('https://backend.foodapp.transev.site/tmporderstatus', formData);

      if (response.status === 200) {
        setMessage(`Order #${orderId} status updated to '${status}'.`);
        setOrders((prev) =>
          prev.map((order) => (order.uid === orderId ? { ...order, tempstatus: status } : order))
        );
      } else {
        setMessage('Failed to update preparation status.');
      }
    } catch (error) {
      console.error('Error updating preparation status:', error);
      setMessage('Error updating preparation status.');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center rounded-b-2xl shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Restaurant Orders</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Message / Toast */}
          {message && (
            <div className="mb-4">
              <div className="rounded-xl border border-orange-200 bg-orange-50 text-orange-800 px-4 py-3 shadow-sm">
                {message}
              </div>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.uid}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                >
                  {/* Accent strip */}
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-500 to-orange-600" />

                  <div className="p-4 sm:p-5">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-100">
                          <FaShoppingCart className="text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                            {order.items[0]?.menu?.menuname || 'N/A'}
                          </h2>
                          <p className="text-xs text-gray-500">
                            #{order.uid}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getBadgeClass(
                            order.orderstatus
                          )}`}
                        >
                          {order.orderstatus || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm text-gray-800 line-clamp-2">
                          {order.items[0]?.menu?.menudescription || 'N/A'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.items[0]?.quantity || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{order.totalprice || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm text-gray-800">{order.usercontact}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 sm:col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-800">{order.useraddress}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                        <p className="text-xs text-gray-500">Order Time</p>
                        <p className="text-sm text-gray-800">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Accept / Reject */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                      <button
                        onClick={() => handleOrderAction(order.uid, 'accept')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
                          ${
                            order.orderstatus !== 'pending'
                              ? 'bg-green-100 text-green-800 cursor-not-allowed opacity-60'
                              : 'bg-green-600 text-white hover:brightness-110'
                          }`}
                        disabled={order.orderstatus !== 'pending'}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.uid, 'reject')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
                          ${
                            order.orderstatus !== 'pending'
                              ? 'bg-red-100 text-red-800 cursor-not-allowed opacity-60'
                              : 'bg-red-600 text-white hover:brightness-110'
                          }`}
                        disabled={order.orderstatus !== 'pending'}
                      >
                        Reject
                      </button>
                    </div>

                    {/* Accepted flow */}
                    {order.orderstatus === 'accepted' && (
                      <>
                        {/* Delivery options */}
                        <div className="mt-5 rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4 ring-1 ring-orange-100">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Delivery Method</h3>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {order.assignedRaider ? (
                              <div className="flex-1 rounded-xl bg-green-50 ring-1 ring-green-100 p-3">
                                <p className="text-sm text-green-800">
                                  Rider Assigned:&nbsp;
                                  <span className="font-semibold">
                                    {order.assignedRaider.raiderfullname}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleDeliveryOption(order.uid, 'self')}
                                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition
                                    ${
                                      order.deliveryOption === 'self'
                                        ? 'bg-green-600 text-white ring-2 ring-green-300'
                                        : 'bg-green-500 text-white hover:brightness-110'
                                    }`}
                                >
                                  Self Delivery
                                </button>
                                <button
                                  onClick={() => handleRiderSelection(order.uid)}
                                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition
                                    ${
                                      order.deliveryOption === 'rider'
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                        : 'bg-blue-500 text-white hover:brightness-110'
                                    }`}
                                >
                                  {order.deliveryOption === 'rider' ? 'Change Rider' : 'Choose Rider'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Rider modal */}
                        {showRiderModal && selectedOrderId === order.uid && (
                          <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
                              <div className="border-b border-gray-100 px-5 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Select Rider</h3>
                              </div>

                              <div className="max-h-[55vh] overflow-y-auto px-5 py-4">
                                {loadingRiders ? (
                                  <p className="text-sm text-gray-600">Loading available riders...</p>
                                ) : riders.length > 0 ? (
                                  <div className="space-y-2">
                                    {riders.map((rider) => (
                                      <button
                                        key={rider.uid}
                                        type="button"
                                        onClick={() => setSelectedRiderId(rider.uid)}
                                        className={`w-full text-left rounded-xl p-3 transition ring-1 
                                          ${
                                            selectedRiderId === rider.uid
                                              ? 'bg-blue-50 ring-blue-200'
                                              : 'bg-white hover:bg-gray-50 ring-gray-200'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-medium text-gray-900">{rider.fullname}</p>
                                            <p className="text-xs text-gray-600">
                                              {rider.preferreddelivelrylocation}
                                            </p>
                                          </div>
                                          <span
                                            className={`inline-block w-3 h-3 rounded-full ${
                                              rider.raiderstatus === 'on' ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                          />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">No available riders found</p>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
                                <button
                                  onClick={() => {
                                    setShowRiderModal(false);
                                    setSelectedRiderId('');
                                  }}
                                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => assignRiderToOrder(order.uid)}
                                  disabled={!selectedRiderId || assigningRider}
                                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition
                                    ${
                                      !selectedRiderId || assigningRider
                                        ? 'bg-blue-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:brightness-110'
                                    }`}
                                >
                                  {assigningRider ? 'Assigning...' : 'Assign Rider'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Preparation steps */}
                        <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Preparation Progress</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              onClick={() => handlePreparationStatus(order.uid, 'startedpreparing')}
                              className="rounded-xl bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:brightness-110 transition"
                            >
                              Started Preparing
                            </button>
                            <button
                              onClick={() => handlePreparationStatus(order.uid, 'inprogress')}
                              className="rounded-xl bg-amber-500 text-white px-4 py-2 text-sm font-medium hover:brightness-110 transition"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => handlePreparationStatus(order.uid, 'dispatch')}
                              className="rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:brightness-110 transition"
                            >
                              Dispatch
                            </button>
                          </div>

                          {/* Temp status pill */}
                          {order.tempstatus && (
                            <div className="mt-3">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                                Current stage: {order.tempstatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 text-center py-14">
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;
