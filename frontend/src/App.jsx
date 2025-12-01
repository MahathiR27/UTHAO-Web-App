import React from "react";
import { Route, Routes } from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantCreatePage from "./pages/RestaurantCreatePage";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import SignupPage from "./pages/SignupPage";
import UserCreatePage from "./pages/UserCreatePage";
import RiderCreatePage from "./pages/RiderCreatePage";
import RiderProfilePage from "./pages/RiderProfilePage";
import UserProfilePage from "./pages/UserProfilePage";

const App = () => {
  return (
    <div data-theme="luxury">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />{" "}
        {/* :id will be able to change dynamically for different profiles */}
        <Route path="/create-restaurant" element={<RestaurantCreatePage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboardPage />} />
        <Route path="/create-user" element={<UserCreatePage />} />
        <Route path="/create-rider" element={<RiderCreatePage />} />
        <Route path="/rider-profile" element={<RiderProfilePage />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
