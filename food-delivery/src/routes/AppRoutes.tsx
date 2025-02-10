import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUp from '../pages/user/SignUp';
import Login from '../pages/user/Login';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/user/HomePage';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/user/CartPage';
import OrderTrackingPage from '../pages/user/OrderTrackingPage';
import OrderHistoryPage from '../pages/user/OrderHistoryPage';
import UserProfile from '../pages/user/UserProfile';
import RestaurantMenuPage from '../pages/user/RestaurantMenuPage';
import RestaurantSignup from '../pages/resturant/RestaurantSignup';
import RestaurantLogin from '../pages/resturant/RestaurantLogin';
import RestaurantDashboard from '../pages/resturant/RestaurantDashboard';
import CreateRestaurant from '../pages/resturant/CreateRestaurantDetails';
import ListOfRestaurants from '../pages/user/ListOfRestaurants';
import CreateMenu from '../pages/resturant/CreateMenu';
import RestaurantDetails from '../pages/resturant/RestaurantDetails';
import RestaurantOrders from '../pages/resturant/RestaurantOrders';
import GetMenuByOwnerId from '../pages/resturant/MenuByRestaurant';
import OrderAnalytics from '../pages/resturant/OrderAnalytics';
import FavoriteRestaurantsPage from '../pages/user/FavoriteRestaurantsPage';
import UserTransactionHistory from '../pages/user/UserTransactionHistory';


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
    <Route path="/restaurant-create" element={<CreateRestaurant />} />
    <Route path="/restaurant-list" element={<ListOfRestaurants />} />
    <Route path="/create-menu" element={<CreateMenu />} />
    <Route path="/restaurant-details" element={<RestaurantDetails />} />
    <Route path="/restaurant-orders" element={<RestaurantOrders />} />
    <Route path="/existingmenu" element={<GetMenuByOwnerId />} />
    <Route path="/report" element={<OrderAnalytics />} />
    <Route path="/favourites" element={<FavoriteRestaurantsPage />} />
    <Route path="/user-transaction" element={<UserTransactionHistory />} />




  </Routes>
);

export default AppRoutes;
