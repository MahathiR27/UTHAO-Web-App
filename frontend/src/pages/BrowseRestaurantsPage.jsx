import React from "react";
import Navbar from "../components/Navbar";
import BrowseRestaurantsWindow from "../components/BrowseRestaurantsWindow";

const BrowseRestaurantsPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <BrowseRestaurantsWindow />
      </div>
    </>
  );
};

export default BrowseRestaurantsPage;
