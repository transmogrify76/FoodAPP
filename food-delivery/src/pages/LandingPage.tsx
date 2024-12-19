import React from 'react';
import { FaPizzaSlice, FaHamburger } from 'react-icons/fa';
import { GiHotMeal } from 'react-icons/gi';
import logo from '../assets/Red Illustrated Mascot Chef Free Logo.png'; // Import the logo from assets folder

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex flex-col items-center justify-between">
      <header className="w-full p-6 bg-white shadow-md flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-red-600">Foodie Heaven</h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="mb-5"> {/* Added extra margin between header and logo */}
          <img
            src={logo} // Use the logo from the assets folder
            alt="Foodie Heaven Logo"
            className="w-36 h-36 rounded-full shadow-lg"
          />
        </div>

        <h2 className="text-5xl font-extrabold text-gray-800 text-center mb-2 leading-tight">
          Delicious Food <span className="text-red-600">Delivered</span>!
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center max-w-lg mb-10">
          Explore cuisines from around the globe, made fresh and delivered fast. Savor the taste, savor the moment.
        </p>

        <div className="flex space-x-6 mb-7">
          <FaPizzaSlice className="text-red-500 text-6xl" />
          <FaHamburger className="text-red-400 text-6xl" />
          <GiHotMeal className="text-red-600 text-6xl" />
        </div>

        <div className="w-full flex flex-col items-center space-y-6 mb-4"> {/* Added margin below buttons */}
          <a
            href="/signup"
            className="w-4/5 px-8 py-4 bg-red-500 text-white font-bold rounded-xl shadow-lg text-center hover:bg-red-600 text-lg"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="w-4/5 px-8 py-4 border border-gray-300 text-gray-800 font-bold rounded-xl shadow-lg text-center hover:bg-gray-200 text-lg"
          >
            Login
          </a>
        </div>
      </main>

      <footer className="w-full p-5 bg-white shadow-md text-center">
        <p className="text-sm sm:text-base text-gray-500">&copy; 2024 Foodie Heaven. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
