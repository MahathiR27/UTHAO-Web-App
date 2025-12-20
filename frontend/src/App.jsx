import React from "react";
import { Route, Routes } from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantCreatePage from "./pages/RestaurantCreatePage";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import SignupPage from "./pages/SignupPage";
import UserCreatePage from "./pages/UserCreatePage";
import MenuBrowserPage from "./pages/MenuBrowserPage";
import DriverCreatePage from "./pages/DriverCreatePage";
import DriverDashboardPage from "./pages/DriverDashboardPage";

const App = () => {
  return (
    <div data-theme="forest">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user-dashboard" element={<ProfilePage />} />{" "}
        <Route path="/create-restaurant" element={<RestaurantCreatePage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboardPage />} />
        <Route path="/create-user" element={<UserCreatePage />} />
        <Route path="/create-driver" element={<DriverCreatePage />} />
        <Route path="/driver-dashboard" element={<DriverDashboardPage />} />
        <Route path="/menu-browser" element={<MenuBrowserPage />} />
      </Routes>
    </div>
  );
};

export default App;
