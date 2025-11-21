import React from "react";
import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantCreatePage from "./pages/RestaurantCreatePage";

const App = () => {
  return (
    <div data-theme="luxury">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />{" "}
        {/* :id will be able to change dynamically for different profiles */}
        <Route path="/create-restaurant" element={<RestaurantCreatePage />} />
      </Routes>
    </div>
  );
};

export default App;
