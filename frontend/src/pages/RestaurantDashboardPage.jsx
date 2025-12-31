import React from "react";
import RestaurantDashboardWindow from "../components/RestaurantDashboardWindow";
import Navbar from "../components/Navbar";

const RestaurantDashboardPage = () => {
  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center">
          <RestaurantDashboardWindow />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
