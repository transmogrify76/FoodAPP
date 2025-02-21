import React from 'react';
import { FaPizzaSlice, FaHamburger, FaArrowRight, FaMotorcycle } from 'react-icons/fa';
import { GiHotMeal } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Red Illustrated Mascot Chef Free Logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex flex-col items-center justify-between">
      <main className="flex flex-col items-center justify-center flex-1 w-full px-6 pb-8">
        <div className="pt-8 mb-6 animate-bounce">
          <img
            src={logo}
            alt="Foodie Heaven Logo"
            className="w-36 h-36 rounded-full shadow-lg border-4 border-white"
          />
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 text-center mb-4 leading-tight">
          Delicious Food <span className="text-red-600">Delivered</span>!
        </h2>
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-md mb-8">
          Explore cuisines from around the globe, made fresh and delivered fast. Savor the taste, savor the moment.
        </p>
        <div className="flex space-x-6 mb-8">
          <FaPizzaSlice className="text-red-500 text-5xl sm:text-6xl hover:scale-110 transition-transform" />
          <FaHamburger className="text-red-400 text-5xl sm:text-6xl hover:scale-110 transition-transform" />
          <GiHotMeal className="text-red-600 text-5xl sm:text-6xl hover:scale-110 transition-transform" />
        </div>
        <div className="w-full max-w-sm flex flex-col items-center space-y-4">
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center hover:opacity-90 transition-transform"
          >
            SignUp
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-white text-gray-800 font-bold rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Login
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/restaurant-login')}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
          >
            Restaurant Owner
            <FaArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate('/rider-signup')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center hover:opacity-90 transition-all mb-16"
          >
            <FaMotorcycle className="mr-2" />
            Become a Rider
          </button>
        </div>
      </main>

      <footer className="w-full p-4 bg-white shadow-md text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          &copy; 2024 Foodie Heaven. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
