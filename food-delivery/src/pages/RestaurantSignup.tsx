import React, { useState } from 'react';
import { FaUserAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [message, setMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, otp } = formData;
    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);
    formDataToSend.append('confirm_password', confirmPassword);

    try {
      if (!otp && !isOtpSent) {
        // Send OTP if not already sent
        const response = await axios.post('http://127.0.0.1:5000/users/resauth_signup', formDataToSend);
        setMessage(response.data.message);
        setIsOtpSent(true); // Mark OTP as sent
      } else if (otp) {
        // Verify OTP if entered
        formDataToSend.append('otp', otp);
        const response = await axios.post('http://127.0.0.1:5000/users/resauth_signup', formDataToSend);
        setMessage(response.data.message);

        if (response.data.message === 'Signup successful!') {
          navigate('/restaurant-login'); // Redirect to login on success
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
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-lg p-10 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Restaurant Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserAlt className="inline-block mr-2 text-red-500" />
              Restaurant Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
              placeholder="Enter your restaurant name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="inline-block mr-2 text-red-500" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline-block mr-2 text-red-500" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline-block mr-2 text-red-500" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
              placeholder="Confirm your password"
              required
            />
          </div>

          {isOtpSent && !formData.otp ? (
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
                placeholder="Enter OTP sent to your email"
                required
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
            {formData.otp ? 'Verify OTP' : 'Sign Up'}
          </button>
        </form>

        {message && <p className="text-red-500 text-center mt-4">{message}</p>}

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/restaurant-login" className="text-red-600 font-semibold hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RestaurantSignup;
