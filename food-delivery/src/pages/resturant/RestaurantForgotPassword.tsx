import React, { useState, useRef } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RestaurantForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [step, setStep] = useState(1); // Step 1 = email, Step 2 = OTP + new password
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);

        const response = await fetch(
          "http://192.168.0.200:5020/resown/passwordreset",
          {
            method: "POST",
            body: formDataToSend,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStep(2);
          setSuccessMessage(data.message || "OTP sent to your email.");
          setError("");
        } else {
          setError(data.message || "Failed to send OTP. Try again.");
        }
      } catch {
        setError("Server error. Please try again.");
      }
    } else if (step === 2) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("otp", formData.otp);
        formDataToSend.append("new_password", formData.newPassword);

        const response = await fetch(
          "http://192.168.0.200:5020/resown/passwordreset",
          {
            method: "POST",
            body: formDataToSend,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message || "Password reset successful!");
          setError("");
          setTimeout(() => navigate("/restaurant-login"), 1500);
        } else {
          setError(data.message || "Invalid OTP. Try again.");
        }
      } catch {
        setError("Server error. Please try again.");
      }
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // only digits

    const otpArray = formData.otp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("").slice(0, 6);

    setFormData((prev) => ({ ...prev, otp: newOtp }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-3xl p-6 w-full max-w-sm">
        <div className="mb-6 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/857/857681.png"
            alt="Restaurant Logo"
            className="w-20 mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-orange-600">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? "Enter your registered email to receive an OTP"
              : "Enter the OTP and your new password"}
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-sm mb-4 text-center">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <InputField
              icon={<FaEnvelope />}
              placeholder="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          ) : (
            <>
              {/* OTP input fields */}
              <div className="grid grid-cols-6 gap-2 justify-center">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={formData.otp[i] || ""}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      ref={(el) => (otpRefs.current[i] = el!)}
                      className="w-full h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ))}
              </div>

              <InputField
                icon={<FaLock />}
                placeholder="New Password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                toggleIcon={
                  showPassword ? (
                    <FaEyeSlash onClick={() => setShowPassword(false)} />
                  ) : (
                    <FaEye onClick={() => setShowPassword(true)} />
                  )
                }
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-base hover:bg-orange-600 transition"
          >
            {step === 1 ? "Send OTP" : "Reset Password"}
          </button>
        </form>

        {step === 1 && (
          <p className="text-xs text-center text-gray-600 mt-4">
            Remembered your password?{" "}
            <a
              href="/restaurant-login"
              className="text-orange-600 font-semibold hover:underline"
            >
              Log In
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

// Reusable InputField
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
      <span className="ml-2 text-gray-500 cursor-pointer text-sm">
        {toggleIcon}
      </span>
    )}
  </div>
);

export default RestaurantForgotPassword;
