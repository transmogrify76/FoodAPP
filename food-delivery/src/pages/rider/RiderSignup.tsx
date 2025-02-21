import React, { useState } from "react";
import { FaUserAlt, FaLock, FaIdCard, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RiderSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    drivingLicense: "",
    vehicleRegNo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/riders/signup", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      alert("Signup Successful!");
      navigate("/login");
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full min-h-[850px]">
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
          Create Your Account
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Join us and start your journey as a rider!
        </p>
        {error && <p className="text-center text-red-500 font-bold mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserAlt className="inline-block mr-2 text-red-500" />
              Full Name
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 hover:bg-red-50"
              placeholder="Enter your full name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserAlt className="inline-block mr-2 text-red-500" />
              Email Address
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 hover:bg-red-50"
              placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline-block mr-2 text-red-500" />
              Password
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 hover:bg-red-50"
              placeholder="Enter your password" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaIdCard className="inline-block mr-2 text-red-500" />
              Driving License No
            </label>
            <input type="text" name="drivingLicense" value={formData.drivingLicense} onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 hover:bg-red-50"
              placeholder="Enter your driving license number" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaCar className="inline-block mr-2 text-red-500" />
              Vehicle Registration No
            </label>
            <input type="text" name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleChange}
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 hover:bg-red-50"
              placeholder="Enter your vehicle registration number" required />
          </div>
          <button type="submit"
            className="w-full bg-red-500 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-red-600 transition-all">
            Sign Up
          </button>
        </form>
        <p className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <a href="/rider-login" className="text-red-600 font-semibold hover:underline">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default RiderSignup;
