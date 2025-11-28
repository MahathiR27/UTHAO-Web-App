import React from "react";
import { Link } from "react-router";

const SignupWindow = () => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <p className="text-center mb-4">Choose your account type</p>

        <div className="space-y-4">
          <Link to="/create-user" className="btn btn-primary w-full">
            User
          </Link>

          <Link to="/create-rider" className="btn btn-secondary w-full">
            Rider
          </Link>

          <Link to="/create-restaurant" className="btn btn-accent w-full">
            Restaurant
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupWindow;
