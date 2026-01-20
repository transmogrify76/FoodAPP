import React, { useState, useRef } from 'react';
import {
  FaUserAlt,
  FaEnvelope,
  FaLock,
  FaRegCheckCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      const { name, email, password, confirmPassword } = formData;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('email', email);
        formDataToSend.append('password', password);
        formDataToSend.append('confirm_password', confirmPassword);

        const response = await fetch('http://192.168.0.200:5020/users/signup', {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          setStep(2);
          setSuccessMessage(data.message);
          setError('');
        } else {
          setError(data.error || 'An error occurred. Please try again.');
        }
      } catch {
        setError('Failed to connect to the server. Please try again.');
      }
    } else if (step === 2) {
      const { email, otp } = formData;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('email', email);
        formDataToSend.append('otp', otp);

        const response = await fetch('http://192.168.0.200:5020/users/signup', {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message);
          setError('');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError(data.error || 'Invalid OTP. Please try again.');
        }
      } catch {
        setError('Failed to connect to the server. Please try again.');
      }
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const otpArray = formData.otp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('').slice(0, 6);

    setFormData(prev => ({ ...prev, otp: newOtp }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
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
          <h1 className="text-xl font-bold text-orange-600">
            {step === 1 ? 'Create Your Account' : 'Verify OTP'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'Join Foodie Heaven to explore tasty delights!'
              : 'Enter the 6-digit OTP sent to your email'}
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        {successMessage && (
          <p className="text-green-600 text-sm mb-4 text-center">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <InputField
                icon={<FaUserAlt />}
                placeholder="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
              <InputField
                icon={<FaEnvelope />}
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                toggleIcon={
                  showPassword ? (
                    <FaEyeSlash onClick={() => setShowPassword(false)} />
                  ) : (
                    <FaEye onClick={() => setShowPassword(true)} />
                  )
                }
              />
              <InputField
                icon={<FaRegCheckCircle />}
                placeholder="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                toggleIcon={
                  showConfirm ? (
                    <FaEyeSlash onClick={() => setShowConfirm(false)} />
                  ) : (
                    <FaEye onClick={() => setShowConfirm(true)} />
                  )
                }
              />
            </>
          ) : (
            <div className="grid grid-cols-6 gap-2 justify-center">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={formData.otp[i] || ''}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    ref={(el) => (otpRefs.current[i] = el!)}
                    className="w-full h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-base hover:bg-orange-600 transition"
          >
            {step === 1 ? 'Sign Up' : 'Verify OTP'}
          </button>
        </form>

        {step === 1 && (
          <p className="text-xs text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-orange-600 font-semibold hover:underline">
              Log In
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({
  icon,
  placeholder,
  name,
  type,
  value,
  onChange,
  toggleIcon,
}: {
  icon: React.ReactNode;
  placeholder: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleIcon?: React.ReactNode;
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
    {toggleIcon && (
      <span className="ml-2 text-gray-500 cursor-pointer text-sm">{toggleIcon}</span>
    )}
  </div>
);

export default SignUp;
