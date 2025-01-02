import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await axios.post('http://127.0.0.1:5000/users/resauthlogin_login', formData);

      // Store token in localStorage
      localStorage.setItem('restaurant_token', response.data.token);

      // Set message to display to the user
      setMessage(response.data.message);

      // Redirect to restaurant dashboard
      navigate('/restaurant-dashboard');
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
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full min-h-[800px]">
        <h2 className="text-2xl font-extrabold text-red-600 text-center mb-6">Restaurant Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex items-center border-2 border-red-300 rounded-lg p-2">
            <FaUser className="text-red-600 text-xl mr-3" />
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
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Login
          </button>
        </form>
        {message && <p className="text-red-500 text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default RestaurantLogin;
