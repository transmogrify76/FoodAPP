import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resturantname: "",
    location: "",
    cuisin_type: "",
    address: "",
    totalseats: "",
    restaurantphone: "",
    gst: "False", // Default False
    resprocchrg: "",
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [owenerid, setOwenerId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setOwenerId(decodedToken.owenerid);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnail) {
      alert("Please upload a thumbnail.");
      return;
    }

    const data = new FormData();
    data.append("owenerid", owenerid);
    data.append("resturantname", formData.resturantname);
    data.append("location", formData.location);
    data.append("cuisintype", formData.cuisin_type); // backend expects 'cuisintype'
    data.append("address", formData.address);
    data.append("totalseats", formData.totalseats);
    data.append("restaurantphone", formData.restaurantphone);
    data.append("gst", formData.gst); // "True" or "False"
    data.append("resprocchrg", formData.resprocchrg);
    data.append("thumbnail", thumbnail);

    if (images) {
      Array.from(images).forEach((file) => {
        data.append("images", file);
      });
    }

    try {
      const response = await axios.post(
        "http://192.168.0.200:5020/resown/createresurantdetails",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Restaurant details created successfully!");
        navigate(-1);
      } else {
        alert("Failed to create restaurant details.");
      }
    } catch (error) {
      console.error("Error creating restaurant details:", error);
      alert("An error occurred while creating the restaurant details.");
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-orange-500 text-white px-5 py-4 flex items-center rounded-b-3xl shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="text-white mr-4 hover:opacity-80"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Create Restaurant</h1>
      </div>

      {/* Form */}
      <div className="p-5 flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-lg max-w-xl mx-auto space-y-4"
          encType="multipart/form-data"
        >
          <InputField
            label="Restaurant Name"
            name="resturantname"
            value={formData.resturantname}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Cuisine Type"
            name="cuisin_type"
            value={formData.cuisin_type}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Total Seats"
            type="number"
            name="totalseats"
            value={formData.totalseats}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Restaurant Phone"
            name="restaurantphone"
            value={formData.restaurantphone}
            onChange={handleInputChange}
            required
          />
          <SelectField
            label="GST Applied?"
            name="gst"
            value={formData.gst}
            onChange={handleInputChange}
            options={[
              { value: "True", label: "True" },
              { value: "False", label: "False" },
            ]}
          />
          <InputField
            label="Restaurant Processing Charge"
            type="number"
            name="resprocchrg"
            value={formData.resprocchrg}
            onChange={handleInputChange}
            required
          />

          <FileInput label="Thumbnail" onChange={handleThumbnailChange} required />
          <FileInput label="Images" onChange={handleImagesChange} multiple />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 px-4 rounded-xl shadow-md hover:opacity-90 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required,
}: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
    />
  </div>
);

const FileInput = ({ label, onChange, multiple = false, required = false }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      type="file"
      onChange={onChange}
      multiple={multiple}
      required={required}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default CreateRestaurant;
