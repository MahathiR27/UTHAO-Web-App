import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5001/api";

const DriverProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicleInfo: "",
    licenseNumber: "",
  });

  useEffect(() => {
    fetchDriverProfile();
  }, [userId]);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`);
      setUser(response.data.user);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRecentReviews(response.data.recentReviews || []);
      setFormData({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
        phone: response.data.user.phone || "",
        address: response.data.user.address || "",
        vehicleInfo: response.data.user.vehicleInfo || "",
        licenseNumber: response.data.user.licenseNumber || "",
      });
      setPreviewImage(null);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const fileInput = document.getElementById("profilePictureInput");
    const file = fileInput?.files[0];

    if (!file) {
      toast.error("Please select an image");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        `${API_BASE_URL}/profile/${userId}/upload-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile picture updated successfully");
      setUser((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));
      setPreviewImage(null);
      fileInput.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/profile/${userId}`,
        formData
      );
      setUser(response.data.user);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-400 text-xl">☆</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300 text-xl">★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error">Driver not found</div>
      </div>
    );
  }

  const profileImageUrl = user.profilePicture
    ? `http://localhost:5001${user.profilePicture}`
    : "https://via.placeholder.com/150";

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={previewImage || profileImageUrl}
                    alt="Profile"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="card-title text-3xl mb-2">{user.name}</h2>
                <p className="text-base-content/70">{user.email}</p>

                {/* Rating Display */}
                {averageRating !== null && (
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                      <div className="text-center md:text-left">
                        <div className="text-4xl font-bold text-primary">
                          {averageRating}
                        </div>
                        <div className="text-sm text-base-content/70">
                          Average Rating
                        </div>
                      </div>
                      <div className="flex-1">
                        {renderStars(parseFloat(averageRating))}
                        <div className="text-sm text-base-content/70 mt-1">
                          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Profile
                  </button>
                  <label className="btn btn-secondary btn-sm">
                    Change Photo
                    <input
                      type="file"
                      id="profilePictureInput"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {previewImage && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleImageUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="divider"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Phone</span>
                </label>
                <p className="text-base-content/80">
                  {user.phone || "Not provided"}
                </p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <p className="text-base-content/80">{user.email}</p>
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Address</span>
                </label>
                <p className="text-base-content/80">
                  {user.address || "Not provided"}
                </p>
              </div>

              {/* Driver-specific fields */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Vehicle Info</span>
                </label>
                <p className="text-base-content/80">
                  {user.vehicleInfo || "Not provided"}
                </p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    License Number
                  </span>
                </label>
                <p className="text-base-content/80">
                  {user.licenseNumber || "Not provided"}
                </p>
              </div>
            </div>

            {/* Recent Reviews Section */}
            {recentReviews.length > 0 && (
              <>
                <div className="divider"></div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div
                        key={review._id}
                        className="card bg-base-200 shadow-sm"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start gap-4">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img
                                  src={
                                    review.userId?.profilePicture
                                      ? `http://localhost:5001${review.userId.profilePicture}`
                                      : "https://via.placeholder.com/48"
                                  }
                                  alt={review.userId?.name || "User"}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {review.userId?.name || "Anonymous"}
                                </span>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-base-content/80 text-sm">
                                  {review.comment}
                                </p>
                              )}
                              <p className="text-xs text-base-content/60 mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Vehicle Info</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleInfo"
                    value={formData.vehicleInfo}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    placeholder="e.g., Honda Civic 2020"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">License Number</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;

