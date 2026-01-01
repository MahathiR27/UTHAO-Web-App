import React from "react";
import UserDashboardWindow from "../components/UserDashboardWindow";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="flex items-center justify-center p-4">
        <UserDashboardWindow />
      </div>
    </div>
  );
};

export default ProfilePage;
