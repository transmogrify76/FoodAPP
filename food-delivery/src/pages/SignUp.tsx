import React, { useState } from 'react';
import { FaUserAlt, FaEnvelope, FaLock, FaRegCheckCircle } from 'react-icons/fa'; // Importing icons

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    // Add signup logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-yellow-300 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-6 text-shadow-md animate-bounce">
          Join The Party!
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8 italic animate-pulse">
          Sign up to start your exciting journey with us!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserAlt className="inline-block mr-2 text-purple-500" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-50 transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="inline-block mr-2 text-green-500" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-green-50 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline-block mr-2 text-purple-500" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-purple-50 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaRegCheckCircle className="inline-block mr-2 text-red-500" />
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
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white text-lg font-bold py-4 rounded-lg shadow-xl hover:from-pink-500 hover:to-purple-400 transform transition-all duration-300 hover:scale-105">
            Create Account
          </button>
        </form>
        <p className="text-sm text-gray-600 text-center mt-6 animate-bounce">
          Already have an account?{' '}
          <a href="/login" className="text-pink-600 font-semibold hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;