import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const RiderProfileWindow = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const riderId = params.get("id");

  const [rider, setRider] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", vehicle: "", licensePlate: "" });
  const [ratingValue, setRatingValue] = useState(5);

  useEffect(() => {
    if (!riderId) return;
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/dashboard/get-rider/${riderId}`);
        setRider(res.data.rider);
        setForm({
          name: res.data.rider?.name || "",
          username: res.data.rider?.username || "",
          email: res.data.rider?.email || "",
          phone: res.data.rider?.phone || "",
          vehicle: res.data.rider?.vehicle || "",
          licensePlate: res.data.rider?.licensePlate || "",
        });
      } catch (err) {
        toast.error("Failed to load rider profile");
      }
    };
    load();
  }, [riderId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    try {
      const res = await axios.put(`http://localhost:5001/api/dashboard/update-rider/${riderId}`, form);
      setRider(res.data.rider);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update rider");
    }
  };

  const addRating = async () => {
    try {
      const res = await axios.put(`http://localhost:5001/api/dashboard/update-rider-rating/${riderId}`, { rating: Number(ratingValue) });
      setRider(res.data.rider);
      toast.success("Rating saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update rating");
    }
  };

  return (
    <div className="card max-w-lg mx-auto bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold">Driver Profile</h2>

        {!rider ? (
          <p className="text-sm text-muted mt-4">Loading...</p>
        ) : (
          <div className="space-y-4 mt-4">
            <p><strong>Name:</strong> {rider.name || rider.username}</p>
            <p><strong>Username:</strong> {rider.username || "-"}</p>
            <p><strong>Email:</strong> {rider.email}</p>
            <p><strong>Phone:</strong> {rider.phone}</p>
            <p><strong>Vehicle:</strong> {rider.vehicle || "-"}</p>
            <p><strong>License:</strong> {rider.licensePlate || "-"}</p>
            <p><strong>Rating:</strong> {typeof rider.rating === 'number' ? rider.rating.toFixed(2) : 0}</p>

            {editing ? (
              <div className="space-y-3">
                <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" />
                <input name="username" value={form.username} onChange={handleChange} className="input input-bordered w-full" />
                <input name="email" value={form.email} onChange={handleChange} className="input input-bordered w-full" />
                <input name="phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full" />
                <input name="vehicle" value={form.vehicle} onChange={handleChange} className="input input-bordered w-full" />
                <input name="licensePlate" value={form.licensePlate} onChange={handleChange} className="input input-bordered w-full" />
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={save}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn btn-outline">Edit Profile</button>
                <div className="flex items-center gap-2 ml-auto">
                  <input type="number" min="0" max="5" value={ratingValue} onChange={(e)=>setRatingValue(e.target.value)} className="input input-bordered w-24" />
                  <button className="btn btn-primary" onClick={addRating}>Save Rating</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderProfileWindow;
