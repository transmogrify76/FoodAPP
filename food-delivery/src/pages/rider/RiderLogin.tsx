import React, { useState } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RiderLogin: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("https://backend.foodapp.transev.site/raider/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("raider_token", data.raider_token);
      navigate("/rider-dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-11 max-w-md w-full min-h-[650px]">
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
          Welcome Back!
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Please log in to continue!
        </p>
        {error && <p className="text-center text-red-500 font-bold mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button type="submit"
            className="w-full bg-red-500 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-red-600 transition-all">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default RiderLogin;