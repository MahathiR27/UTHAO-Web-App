import React from "react";
import MenuBrowserWindow from "../components/MenuBrowserWindow";
import Navbar from "../components/Navbar";

const MenuBrowserPage = () => {
  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <MenuBrowserWindow />
    </div>
  );
};

export default MenuBrowserPage;
