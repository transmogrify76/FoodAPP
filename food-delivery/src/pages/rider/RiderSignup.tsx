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
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://192.168.0.103:5020/raiderops/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            ...formData,
            fullname: formData.name,
            confirm_password: formData.password,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      setStep(2);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://192.168.0.103:5020/raiderops/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: formData.email,
            otp: otp,
            fullname: formData.name,
            password: formData.password,
            confirm_password: formData.password,
            drivinglicense: formData.drivingLicense,
            vehicleregno: formData.vehicleRegNo,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");

      alert("Signup Successful!");
      navigate("/rider-login");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-xl rounded-3xl p-6 w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png"
            alt="Rider Logo"
            className="w-20 mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-orange-600">Rider Signup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join us and start delivering with ease.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Step 1: Signup Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={<FaUserAlt />}
              placeholder="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />

            <InputField
              icon={<FaUserAlt />}
              placeholder="Email Address"
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

            <InputField
              icon={<FaIdCard />}
              placeholder="Driving License Number"
              name="drivingLicense"
              type="text"
              value={formData.drivingLicense}
              onChange={handleChange}
            />

            <InputField
              icon={<FaCar />}
              placeholder="Vehicle Registration Number"
              name="vehicleRegNo"
              type="text"
              value={formData.vehicleRegNo}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Sign Up
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600">
                Enter the OTP sent to <span className="font-semibold">{formData.email}</span>
              </p>
            </div>

            <InputField
              icon={<FaLock />}
              placeholder="Enter OTP"
              name="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
            />

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a
            href="/rider-login"
            className="text-orange-600 font-semibold hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

// Reusable Input Component
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
  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-orange-500 transition">
    <span className="text-orange-500 mr-3 text-sm">{icon}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
      required
    />
  </div>
);

export default RiderSignup;
