import React from 'react';
import { useLocation } from 'react-router-dom';

const RestaurantMenu: React.FC = () => {
  const location = useLocation();
  const { menu } = location.state || { menu: [] };

  if (!menu || menu.length === 0) {
    return <p>No menu available.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((item: any) => (
          <div key={item.menuid} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold text-red-600">{item.menuname}</h3>
            <p className="text-gray-600">{item.menudescription}</p>
            <p className="text-gray-500">₹{item.menuprice}</p>
            {item.images && item.images.length > 0 && (
              <img
                src={`data:image/png;base64,${item.images[0].image_data}`}
                alt={item.menuname}
                className="mt-2 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
