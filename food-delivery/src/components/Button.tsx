import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  isPrimary?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, isPrimary = true }) => (
  <button
    onClick={onClick}
    className={`w-full py-2 rounded-lg font-semibold {
      isPrimary
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : 'bg-gray-300 text-black hover:bg-gray-400'
    }`}
  >
    {label}
  </button>
);

export default Button;
