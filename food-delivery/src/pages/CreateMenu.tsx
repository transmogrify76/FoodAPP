import React, { useState, useEffect } from 'react';

const CreateMenu: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuData, setMenuData] = useState({
    menuname: '',
    menudescription: '',
    menuprice: '',
    menutype: '',
    foodtype: '',
    images: [] as File[],
  });

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem('restaurantId');
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setMenuData((prevData) => ({ ...prevData, images: Array.from(files) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!restaurantId) {
      alert('Restaurant ID not found');
      return;
    }
  
    const formData = new FormData();
    formData.append('menuname', menuData.menuname || '');
    formData.append('menudescription', menuData.menudescription || '');
    formData.append('menuprice', menuData.menuprice || '');
    formData.append('menutype', menuData.menutype || '');
    formData.append('foodtype', menuData.foodtype || '');
    formData.append('restaurantid', restaurantId || '');
  
    menuData.images.forEach((image) => {
      formData.append('images', image);
    });
  
    try {
      const response = await fetch('http://localhost:5000/resops/createmenu', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create menu');
        return;
      }
  
      const data = await response.json();
      alert(data.message || 'Menu created successfully');
    } catch (error) {
      alert('Error creating menu');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
        Create Menu for Restaurant {restaurantId}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Menu Name</label>
            <input
              type="text"
              name="menuname"
              value={menuData.menuname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Description</label>
            <textarea
              name="menudescription"
              value={menuData.menudescription}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Price</label>
            <input
              type="text"
              name="menuprice"
              value={menuData.menuprice}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Menu Type</label>
            <input
              type="text"
              name="menutype"
              value={menuData.menutype}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Food Type</label>
            <input
              type="text"
              name="foodtype"
              value={menuData.foodtype}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Images</label>
            <input
              type="file"
              name="images"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Create Menu
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMenu;
