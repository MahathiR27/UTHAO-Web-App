import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const UserDashboardWindow = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("id");

  const [name, setName] = useState("");

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/dashboard/get-user/${userId}`);
        setName(res.data.user?.UserName || "");
      } catch (err) {
        // don't spam toast for missing id in dev — show console
        console.warn(err?.response?.data?.message || "Failed to load user");
      }
    };
    load();
  }, [userId]);

  return (
    <div className="card max-w-4xl mx-auto bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold">Passenger Dashboard</h2>
        {name ? (
          <p className="mt-2 text-lg">Welcome, <strong>{name}</strong></p>
        ) : (
          <p className="mt-2 text-sm text-muted">Welcome — your dashboard is ready (name will appear after signup)</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboardWindow;
