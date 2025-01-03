import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUp from '../pages/SignUp';
import Login from '../pages/Login';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/CartPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import UserProfile from '../pages/UserProfile';
import RestaurantMenuPage from '../pages/RestaurantMenuPage';
import RestaurantSignup from '../pages/RestaurantSignup';
import RestaurantLogin from '../pages/RestaurantLogin';
import RestaurantDashboard from '../pages/RestaurantDashboard';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/login" element={<Login />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/track-order" element={<OrderTrackingPage />} />
    <Route path="/history" element={<OrderHistoryPage />} />
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/restaurant-menu" element={<RestaurantMenuPage />} />
    <Route path="/restaurant-signup" element={<RestaurantSignup />} />
    <Route path="/restaurant-login" element={<RestaurantLogin />} />
    <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />

  </Routes>
);

export default AppRoutes;
