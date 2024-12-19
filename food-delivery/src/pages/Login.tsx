import React, { useState } from 'react';
import { FaUserAlt, FaLock } from 'react-icons/fa'; 

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    console.log('Login form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full min-h-[800px]">
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
          Welcome Back!
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Please log in to continue your journey with us!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserAlt className="inline-block mr-2 text-red-500" />
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
          <button
            type="submit"
            className="w-full bg-red-500 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-red-600 transition-all">
            Log In
          </button>
        </form>
        <p className="text-sm text-gray-600 text-center mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-red-600 font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
