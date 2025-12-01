import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const DriverDashboardWindow = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const id = params.get("id");

  const [name, setName] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/dashboard/get-rider/${id}`);
        setName(res.data.rider?.name || res.data.rider?.username || "");
      } catch (err) {
        console.warn(err?.response?.data?.message || "Failed to load rider");
      }
    };
    load();
  }, [id]);

  return (
    <div className="card max-w-4xl mx-auto bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold">Driver Dashboard</h2>
        {name ? (
          <p className="mt-2 text-lg">Welcome, <strong>{name}</strong></p>
        ) : (
          <p className="mt-2 text-sm text-muted">Welcome — your driver dashboard is ready (name will appear after signup)</p>
        )}
      </div>
    </div>
  );
};

export default DriverDashboardWindow;
