import React, { useState } from 'react';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://192.168.0.200:5020/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-3xl p-6 w-full max-w-sm">
        <div className="mb-6 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
            alt="Logo"
            className="w-20 mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-orange-600">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to continue to Foodie Heaven!</p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={<FaUserAlt />}
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            icon={<FaLock />}
            placeholder="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="/forget-password"
              className="text-xs text-orange-600 font-semibold hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-base hover:bg-orange-600 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-orange-600 font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

const InputField = ({
  icon,
  placeholder,
  name,
  type,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-orange-500 transition">
    <span className="text-orange-500 mr-3 text-sm">{icon}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full outline-none text-sm placeholder-gray-400 text-gray-800 bg-transparent"
      required
    />
  </div>
);

export default Login;
