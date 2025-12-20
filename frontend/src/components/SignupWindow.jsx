import React from "react";
import { Link } from "react-router";
import { UserCircle, Store, Bike } from "lucide-react";

const SignupWindow = () => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <p className="text-center text-sm mb-6">Choose your account type</p>

        <div className="space-y-3">
          <Link to="/create-user" className="btn btn-primary w-full gap-2 text-white">
            <UserCircle className="w-5 h-5" />
            Customer
          </Link>

          <Link to="/create-rider" className="btn btn-secondary w-full gap-2 text-white">
            <Bike className="w-5 h-5" />
            Rider
          </Link>

          <Link to="/create-restaurant" className="btn btn-accent w-full gap-2 text-white">
            <Store className="w-5 h-5" />
            Restaurant
          </Link>
        </div>

        <div className="divider"></div>

        <div className="text-center">
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
