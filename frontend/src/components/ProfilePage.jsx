import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";
import UserProfile from "../components/UserProfile";
import DriverProfile from "../components/DriverProfile";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5001/api";

const ProfilePage = () => {
  const { id } = useParams();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, [id]);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/${id}`);
      setUserRole(response.data.user.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      {userRole === "driver" ? (
        <DriverProfile userId={id} />
      ) : (
        <UserProfile userId={id} />
      )}
    </>
  );
};

export default ProfilePage;
