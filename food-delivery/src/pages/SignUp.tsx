import React, { useState } from 'react';
import { FaUserAlt, FaEnvelope, FaLock, FaRegCheckCircle } from 'react-icons/fa';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '', // New field for OTP
  });
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP Verification
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Send signup request to the backend
      const { name, email, password, confirmPassword } = formData;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('email', email);
        formDataToSend.append('password', password);
        formDataToSend.append('confirm_password', confirmPassword);

        const response = await fetch('http://127.0.0.1:5000/users/signup', {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          setStep(2); // Move to OTP verification step
          setSuccessMessage(data.message);
        } else {
          setError(data.error || 'An error occurred. Please try again.');
        }
      } catch (error) {
        setError('Failed to connect to the server. Please try again.');
      }
    } else if (step === 2) {
      // Verify OTP
      const { email, otp } = formData;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('email', email);
        formDataToSend.append('otp', otp);

        const response = await fetch('http://127.0.0.1:5000/users/signup', {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message);
          setError('');
        } else {
          setError(data.error || 'Invalid OTP. Please try again.');
        }
      } catch (error) {
        setError('Failed to connect to the server. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
          {step === 1 ? 'Create Your Account' : 'Verify OTP'}
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          {step === 1
            ? 'Join Foodie Heaven and enjoy delicious meals delivered to your door!'
            : 'Enter the OTP sent to your email to complete signup.'}
        </p>
        {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 font-semibold mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUserAlt className="inline-block mr-2 text-red-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 transition-all"
                  placeholder="Enter your full name"
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
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
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
            </>
          ) : (
            <div className="mb-6">
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
                placeholder="Enter OTP"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-red-500 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-red-600 transition-all"
          >
            {step === 1 ? 'Sign Up' : 'Verify OTP'}
          </button>
        </form>
        {step === 1 && (
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-red-600 font-semibold hover:underline">
              Log In
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUp;
