import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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

      const response = await fetch('http://192.168.0.225:5000/owenerresturentfetch', {
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

        const response = await axios.post('http://192.168.0.225:5000/order/orderhistory', formData);
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

      const response = await axios.post('http://192.168.0.225:5000/ops/updateorder', formData);

      if (response.data.message === 'Data update success') {
        setMessage(`Order #${orderId} has been ${action}ed.`);
        setOrders(orders.map((order) =>
          order.uid === orderId ? { ...order, orderstatus: action === 'accept' ? 'accepted' : 'rejected' } : order
        ));
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

      const response = await axios.post('http://192.168.0.225:5000/tmporderstatus', formData);

      if (response.status === 200) {
        setMessage(`Order #${orderId} status updated to '${status}'.`);
        setOrders(orders.map((order) =>
          order.uid === orderId ? { ...order, tempstatus: status } : order
        ));
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
      const response = await axios.get('http://192.168.0.225:5000/ops/getallraiders');
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
        'http://192.168.0.225:5000/order/assignorderraider',
        formData
      );

      if (response.status === 200) {
        setMessage('Rider assigned successfully');
        // Update order with rider information
        setOrders(orders.map(order => 
          order.uid === orderId ? { ...order, assignedRaider: response.data.data } : order
        ));
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
    setOrders(orders.map((order) =>
      order.uid === orderId ? { ...order, deliveryOption: option } : order
    ));
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-white">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Restaurant Orders</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.uid} className="bg-white shadow-md rounded-lg p-4 border-l-4 border-red-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaShoppingCart className="text-red-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-700">{order.items[0]?.menu?.menuname || 'N/A'}</h2>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600"><strong>Description:</strong> {order.items[0]?.menu?.menudescription || 'N/A'}</p>
                  <p className="text-sm text-gray-600"><strong>Quantity:</strong> {order.items[0]?.quantity || 0}</p>
                  <p className="text-sm text-gray-600"><strong>Total Price:</strong> ₹{order.totalprice || 0}</p>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> {order.orderstatus}</p>
                  <p className="text-sm text-gray-600"><strong>Contact:</strong> {order.usercontact}</p>
                  <p className="text-sm text-gray-600"><strong>Address:</strong> {order.useraddress}</p>
                  <p className="text-sm text-gray-600"><strong>Order Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleOrderAction(order.uid, 'accept')}
                    className={`bg-green-500 text-white py-2 px-4 rounded-lg text-sm ${
                      order.orderstatus !== 'pending' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                    }`}
                    disabled={order.orderstatus !== 'pending'}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOrderAction(order.uid, 'reject')}
                    className={`bg-red-500 text-white py-2 px-4 rounded-lg text-sm ${
                      order.orderstatus !== 'pending' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                    }`}
                    disabled={order.orderstatus !== 'pending'}
                  >
                    Reject
                  </button>
                </div>

                {order.orderstatus === 'accepted' && (
                  <>
                    {/* Delivery Options Section */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery Method</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {order.assignedRaider ? (
                          <div className="flex-1 p-2 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-700">
                              Rider Assigned: {order.assignedRaider.raiderfullname}
                            </p>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDeliveryOption(order.uid, 'self')}
                              className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                                order.deliveryOption === 'self' 
                                  ? 'bg-green-600 text-white ring-2 ring-green-300'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              Self Delivery
                            </button>
                            <button
                              onClick={() => handleRiderSelection(order.uid)}
                              className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                                order.deliveryOption === 'rider'
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {order.deliveryOption === 'rider' ? 'Change Rider' : 'Choose Rider'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rider Selection Modal */}
                    {showRiderModal && selectedOrderId === order.uid && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full">
                          <h3 className="text-lg font-semibold mb-4">Select Rider</h3>
                          
                          {loadingRiders ? (
                            <p>Loading available riders...</p>
                          ) : riders.length > 0 ? (
                            <div className="space-y-2">
                              {riders.map(rider => (
                                <div 
                                  key={rider.uid}
                                  className={`p-3 rounded-lg cursor-pointer ${
                                    selectedRiderId === rider.uid 
                                      ? 'bg-blue-100 border-2 border-blue-500'
                                      : 'hover:bg-gray-100 border'
                                  }`}
                                  onClick={() => setSelectedRiderId(rider.uid)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{rider.fullname}</p>
                                      <p className="text-sm text-gray-600">{rider.preferreddelivelrylocation}</p>
                                    </div>
                                    <span className={`inline-block w-3 h-3 rounded-full ${
                                      rider.raiderstatus === 'on' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No available riders found</p>
                          )}

                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setShowRiderModal(false);
                                setSelectedRiderId('');
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => assignRiderToOrder(order.uid)}
                              disabled={!selectedRiderId || assigningRider}
                              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                                (!selectedRiderId || assigningRider) ? 'opacity-50' : 'hover:bg-blue-700'
                              }`}
                            >
                              {assigningRider ? 'Assigning...' : 'Assign Rider'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preparation Steps Section */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Preparation Progress</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handlePreparationStatus(order.uid, 'startedpreparing')}
                          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600"
                        >
                          Started Preparing
                        </button>
                        <button
                          onClick={() => handlePreparationStatus(order.uid, 'inprogress')}
                          className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-yellow-600"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handlePreparationStatus(order.uid, 'dispatch')}
                          className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-600"
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;