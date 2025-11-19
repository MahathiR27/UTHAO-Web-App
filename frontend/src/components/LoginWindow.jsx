import React from "react";
import { Link } from "react-router";

const LoginWindow = () => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <div className="text-right">
            <a href="#" className="link link-primary text-sm">
              Forgot password?
            </a>
          </div>
          {/* send directly to the profile by clicking login */}
          <Link to="/profile/1" className="btn btn-primary w-full">
            Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginWindow;
