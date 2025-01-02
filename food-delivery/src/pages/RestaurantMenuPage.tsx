import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
}

const RestaurantMenuPage: React.FC = () => {
  const location = useLocation(); // Get location from react-router
  const restaurantId = location.state?.restaurantId; // Access restaurantId from state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/resown/menu/${restaurantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu.');
        }
        const data = await response.json();
        if (data.menu && Array.isArray(data.menu)) {
          setMenuItems(data.menu);
        } else {
          throw new Error('Unexpected API response format.');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong!');
      }
    };

    if (restaurantId) {
      fetchMenu();
    }
  }, [restaurantId]);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-red-600 text-center mb-6">Restaurant Menu</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl font-semibold text-red-600">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-gray-500">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
