import React from "react";
import { Route, Routes, Navigate } from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantCreatePage from "./pages/RestaurantCreatePage";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import SignupPage from "./pages/SignupPage";
import UserCreatePage from "./pages/UserCreatePage";
import MenuBrowserPage from "./pages/MenuBrowserPage";
import DriverCreatePage from "./pages/DriverCreatePage";
import DriverDashboardPage from "./pages/DriverDashboardPage";
import RideRequestPage from "./pages/RideRequestPage";
import DriverRideRequestsPage from "./pages/DriverRideRequestsPage";
import RideStatusPage from "./pages/RideStatusPage";
import DriverActiveRidePage from "./pages/DriverActiveRidePage";
import BrowseRestaurantsPage from "./pages/BrowseRestaurantsPage";

const App = () => {
  return (
    <div data-theme="forest">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user-dashboard" element={<ProfilePage />} />
        <Route path="/create-restaurant" element={<RestaurantCreatePage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboardPage />} />
        <Route path="/create-user" element={<UserCreatePage />} />
        <Route path="/create-driver" element={<DriverCreatePage />} />
        <Route path="/driver-dashboard" element={<DriverDashboardPage />} />
        <Route path="/ride-request" element={<RideRequestPage />} />
        <Route path="/ride-status/:rideId" element={<RideStatusPage />} />
        <Route path="/driver-ride-requests" element={<DriverRideRequestsPage />} />
        <Route path="/driver-active-ride/:rideId" element={<DriverActiveRidePage />} />
        <Route path="/menu-browser" element={<MenuBrowserPage />} />
        <Route path="/browse-restaurants" element={<BrowseRestaurantsPage />} />
      </Routes>
    </div>
  );
};

export default App;
