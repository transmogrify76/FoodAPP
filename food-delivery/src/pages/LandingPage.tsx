import React from 'react';
import { FaPizzaSlice, FaHamburger, FaArrowRight, FaMotorcycle } from 'react-icons/fa';
import { GiHotMeal } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Red Illustrated Mascot Chef Free Logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex flex-col items-center justify-between">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 w-full px-6 pb-10">
        
        {/* Logo */}
        <div className="pt-10 mb-8 animate-bounce">
          <img
            src={logo}
            alt="Foodie Heaven Logo"
            className="w-40 h-40 rounded-full shadow-lg border-4 border-white"
          />
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 text-center mb-4 leading-tight">
          Delicious Food <span className="text-orange-500">Delivered</span>!
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center max-w-md mb-10">
          Explore cuisines from around the globe, made fresh and delivered fast. Savor the taste, savor the moment.
        </p>

        {/* Food Icons */}
        <div className="flex space-x-6 mb-12">
          <div className="p-4 bg-orange-100 rounded-full hover:scale-110 transition-transform">
            <FaPizzaSlice className="text-orange-500 text-5xl" />
          </div>
          <div className="p-4 bg-orange-100 rounded-full hover:scale-110 transition-transform">
            <FaHamburger className="text-orange-400 text-5xl" />
          </div>
          <div className="p-4 bg-orange-100 rounded-full hover:scale-110 transition-transform">
            <GiHotMeal className="text-orange-600 text-5xl" />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-col items-center space-y-4">
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-6 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all"
          >
            Sign Up
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Login
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/restaurant-login')}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
          >
            Restaurant Owner
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/rider-signup')}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center hover:opacity-90 transition-all mb-16"
          >
            <FaMotorcycle className="mr-2" />
            Become a Rider
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 bg-white shadow-md text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          &copy; 2024 Foodie Heaven. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
