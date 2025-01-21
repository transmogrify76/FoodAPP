import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateRestaurant: React.FC = () => {
  const [formData, setFormData] = useState({
    resturantname: "",
    location: "",
    cuisin_type: "",
    address: "",
    totalseats: "",
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [owenerid, setOwenerId] = useState<string>("");

  useEffect(() => {
    // Retrieve the owner ID from the token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decoding JWT payload
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
    data.append("owenerid", owenerid); // Add owner ID automatically
    data.append("resturantname", formData.resturantname);
    data.append("location", formData.location);
    data.append("cuisintype", formData.cuisin_type);
    data.append("address", formData.address);
    data.append("totalseats", formData.totalseats);
    data.append("thumbnail", thumbnail);

    if (images) {
      Array.from(images).forEach((file) => {
        data.append("images", file);
      });
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/resown/createresurantdetails",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Restaurant details created successfully!");
      } else {
        alert("Failed to create restaurant details.");
      }
    } catch (error) {
      console.error("Error creating restaurant details:", error);
      alert("An error occurred while creating the restaurant details.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">
        Create Restaurant
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
        encType="multipart/form-data"
      >
        <div className="mb-4">
          <label className="block text-gray-700">Restaurant Name</label>
          <input
            type="text"
            name="resturantname"
            value={formData.resturantname}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Cuisine Type</label>
          <input
            type="text"
            name="cuisin_type"
            value={formData.cuisin_type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Total Seats</label>
          <input
            type="number"
            name="totalseats"
            value={formData.totalseats}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Thumbnail</label>
          <input
            type="file"
            onChange={handleThumbnailChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Images</label>
          <input
            type="file"
            multiple
            onChange={handleImagesChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateRestaurant;
