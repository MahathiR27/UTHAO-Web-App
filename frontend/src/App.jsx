import React from "react";
import { Route, Routes } from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantCreatePage from "./pages/RestaurantCreatePage";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import SignupPage from "./pages/SignupPage";
import UserCreatePage from "./pages/UserCreatePage";

const App = () => {
  return (
    <div data-theme="luxury">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user-dashboard" element={<ProfilePage />} />{" "}
        <Route path="/create-restaurant" element={<RestaurantCreatePage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboardPage />} />
        <Route path="/create-user" element={<UserCreatePage />} />
      </Routes>
    </div>
  );
};

export default App;
