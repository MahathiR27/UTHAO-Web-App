import React from "react";
import Navbar from "../components/Navbar";
import BrowseRestaurantsWindow from "../components/BrowseRestaurantsWindow";

const BrowseRestaurantsPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Navbar />
      <BrowseRestaurantsWindow />
    </div>
  );
};

export default BrowseRestaurantsPage;
