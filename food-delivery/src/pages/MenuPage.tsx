import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]); 
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

 
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/resown/getallmenus'); 
        console.log('API Response:', response.data); 
        setMenuItems(response.data.menus); 
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const addToCart = (item: any) => {
    setCart([...cart, item]);
  };

  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.menuid} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold text-red-600">{item.menuname}</h3>
          <p className="text-gray-600">
            ₹{Number(item.menuprice).toFixed(2)} {/* Ensure menuprice is a number */}
          </p>
          <button
            onClick={() => addToCart(item)}
            className="mt-4 w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-all"
          >
            Add to Cart
          </button>
        </div>
        
        ))}
      </div>
      
    </div>
  );
};

export default MenuPage;
