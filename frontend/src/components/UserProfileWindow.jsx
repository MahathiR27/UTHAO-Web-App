import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const UserProfileWindow = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("id");

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ UserName: "", email: "", phone: "", address: "" });

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/dashboard/get-user/${userId}`);
        setUser(res.data.user);
        setForm({
          UserName: res.data.user?.UserName || "",
          email: res.data.user?.email || "",
          phone: res.data.user?.phone || "",
          address: res.data.user?.address || "",
        });
      } catch (err) {
        toast.error("Failed to load user profile");
      }
    };
    load();
  }, [userId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    try {
      const res = await axios.put(`http://localhost:5001/api/dashboard/update-user/${userId}`, form);
      setUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="card max-w-lg mx-auto bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold">User Profile</h2>
        {!user ? (
          <p className="text-sm text-muted mt-4">Loading...</p>
        ) : (
          <div className="space-y-4 mt-4">
            <p><strong>Username:</strong> {user.UserName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address || "-"}</p>

            {editing ? (
              <div className="space-y-3">
                <input name="UserName" value={form.UserName} onChange={handleChange} className="input input-bordered w-full" />
                <input name="email" value={form.email} onChange={handleChange} className="input input-bordered w-full" />
                <input name="phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full" />
                <input name="address" value={form.address} onChange={handleChange} className="input input-bordered w-full" />
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={save}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn btn-outline">Edit Profile</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileWindow;
