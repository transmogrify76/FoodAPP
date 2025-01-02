import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantSignup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);

    try {
      if (!otp && !isOtpSent) {
        // Send OTP when OTP has not been sent
        const response = await axios.post('http://127.0.0.1:5000/users/resauth_signup', formData);
        setMessage(response.data.message);
        setIsOtpSent(true); // Set OTP as sent
      } else if (otp) {
        // Verify OTP if it's provided
        formData.append('otp', otp);
        const response = await axios.post('http://127.0.0.1:5000/users/resauth_signup', formData);
        setMessage(response.data.message);

        if (response.data.message === 'Signup successful!') {
          navigate('/restaurant-login'); // Redirect to login if signup is successful
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || 'Error occurred!');
      } else {
        setMessage('Unexpected error occurred!');
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full h-screen">
      <h2 className="text-2xl font-extrabold text-red-600 text-center mb-6">Restaurant Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
            <FaUser className="text-red-600 text-xl mr-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant Name"
              required
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
            <FaEnvelope className="text-red-600 text-xl mr-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
            <FaLock className="text-red-600 text-xl mr-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
            <FaLock className="text-red-600 text-xl mr-3" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {isOtpSent && !otp ? (
            <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Send OTP
            </button>
          )}
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            {otp ? 'Verify OTP' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="text-red-500 text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default RestaurantSignup;
