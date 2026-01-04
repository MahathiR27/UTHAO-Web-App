import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { Calendar, Check, X, Tag } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const RestaurantDashboardWindow = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [menuItem, setMenuItem] = useState({ name: "", price: "", description: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    RestaurantName: "",
    OwnerName: "",
    email: "",
    RestaurantPhone: "",
    OwnerPhone: "",
    address: "",
    description: "",
    reservationLimit: 0
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editMenuForm, setEditMenuForm] = useState({ name: "", price: "", description: "" });
  const [reservationFilter, setReservationFilter] = useState("all"); // "all", "pending", "confirmed"
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [updatingReservation, setUpdatingReservation] = useState(false);
  
  // Offer management states
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: "", percentage: "", menuItemIndices: [] });
  const [editingOfferIndex, setEditingOfferIndex] = useState(null);
  const [editOfferForm, setEditOfferForm] = useState({ title: "", percentage: "", menuItemIndices: [] });

  // Fetch restaurant data on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const fetchRestaurant = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: "http://localhost:5001/api/dashboard/get-restaurant",
          headers: { token: getToken() }
        });
        setRestaurant(response.data.restaurant);
      } catch (error) {
        toast.error("Failed to load restaurant details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [currentUser, navigate]);

  // Handle adding a new menu item
  const handleAddMenuItem = async (e) => {
    e.preventDefault();

    if (!menuItem.name.trim()) {
      toast.error("Menu item name is required");
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: "http://localhost:5001/api/dashboard/add-menu",
        data: {
          name: menuItem.name,
          price: menuItem.price || 0,
          description: menuItem.description,
        },
        headers: { token: getToken() }
      });

      // Update local restaurant state with new menu
      setRestaurant({
        ...restaurant,
        menu: response.data.menu,
      });

      // Reset form
      setMenuItem({ name: "", price: "", description: "" });
      setShowForm(false);
      toast.success("Menu item added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add menu item");
      console.error(error);
    }
  };
  const handleToggleEditProfile = () => {
    if (!editingProfile) {
      // Populate form with current restaurant data when opening edit mode
      setEditForm({
        RestaurantName: restaurant.RestaurantName || "",
        OwnerName: restaurant.OwnerName || "",
        email: restaurant.email || "",
        RestaurantPhone: restaurant.RestaurantPhone || "",
        OwnerPhone: restaurant.OwnerPhone || "",
        address: restaurant.address || "",
        description: restaurant.description || "",
        reservationLimit: restaurant.reservationLimit || 0
      });
    }
    setEditingProfile(!editingProfile);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios({
        method: 'put',
        url: "http://localhost:5001/api/dashboard/update-restaurant",
        data: editForm,
        headers: { token: getToken() }
      });
      setRestaurant(res.data.restaurant);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    }
  };

  const startEditMenu = (index) => {
    setEditingIndex(index);
    const item = restaurant.menu[index];
    setEditMenuForm({ name: item.name || "", price: item.price || "", description: item.description || "" });
  };

  const cancelEditMenu = () => {
    setEditingIndex(null);
    setEditMenuForm({ name: "", price: "", description: "" });
  };

  const handleUpdateMenu = async (e, index) => {
    e.preventDefault();
    try {
      const res = await axios({
        method: 'put',
        url: `http://localhost:5001/api/dashboard/update-menu/${index}`,
        data: editMenuForm,
        headers: { token: getToken() }
      });
      setRestaurant((r) => ({ ...r, menu: res.data.menu }));
      setEditingIndex(null);
      toast.success("Menu updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update menu");
      console.error(err);
    }
  };

  const handleReservationStatusUpdate = async (reservationId, newStatus) => {
    setUpdatingReservation(true);
    // Close modal immediately
    setShowReservationModal(false);
    setSelectedReservation(null);

    try {
      const response = await axios({
        method: 'put',
        url: `http://localhost:5001/api/dashboard/update-reservation-status/${currentUser.id}`,
        data: {
          reservationId,
          status: newStatus
        },
        headers: { token: getToken() }
      });

      // Update local restaurant state
      setRestaurant(response.data.restaurant);
      toast.success(`Reservation ${newStatus} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update reservation status");
      console.error(error);
    } finally {
      setUpdatingReservation(false);
    }
  };

  const openReservationModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const closeReservationModal = () => {
    setShowReservationModal(false);
    setSelectedReservation(null);
  };

  const getFilteredReservations = () => {
    if (!restaurant?.reservations) return [];

    if (reservationFilter === "all") return restaurant.reservations;
    return restaurant.reservations.filter(r => r.status === reservationFilter);
  };

  // Offer handlers
  const handleAddOffer = async (e) => {
    e.preventDefault();

    if (!offerForm.title.trim() || !offerForm.percentage) {
      toast.error("Title and percentage are required");
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: "http://localhost:5001/api/dashboard/add-offer",
        data: offerForm,
        headers: { token: getToken() }
      });

      setRestaurant({ ...restaurant, offers: response.data.offers });
      setOfferForm({ title: "", percentage: "", menuItemIndices: [] });
      setShowOfferForm(false);
      toast.success("Offer added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add offer");
      console.error(error);
    }
  };

  const startEditOffer = (index) => {
    setEditingOfferIndex(index);
    const offer = restaurant.offers[index];
    setEditOfferForm({
      title: offer.title || "",
      percentage: offer.percentage || "",
      menuItemIndices: offer.menuItemIndices || []
    });
  };

  const cancelEditOffer = () => {
    setEditingOfferIndex(null);
    setEditOfferForm({ title: "", percentage: "", menuItemIndices: [] });
  };

  const handleUpdateOffer = async (e, index) => {
    e.preventDefault();
    try {
      const response = await axios({
        method: 'put',
        url: `http://localhost:5001/api/dashboard/update-offer/${index}`,
        data: editOfferForm,
        headers: { token: getToken() }
      });
      setRestaurant({ ...restaurant, offers: response.data.offers });
      setEditingOfferIndex(null);
      toast.success("Offer updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update offer");
      console.error(error);
    }
  };

  const handleDeleteOffer = async (index) => {
    try {
      const response = await axios({
        method: 'delete',
        url: `http://localhost:5001/api/dashboard/delete-offer/${index}`,
        headers: { token: getToken() }
      });
      setRestaurant({ ...restaurant, offers: response.data.offers });
      toast.success("Offer deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete offer");
      console.error(error);
    }
  };

  const toggleMenuItemInOffer = (menuIndex, isEditing = false) => {
    if (isEditing) {
      const currentIndices = [...editOfferForm.menuItemIndices];
      const indexPos = currentIndices.indexOf(menuIndex);
      if (indexPos > -1) {
        currentIndices.splice(indexPos, 1);
      } else {
        currentIndices.push(menuIndex);
      }
      setEditOfferForm({ ...editOfferForm, menuItemIndices: currentIndices });
    } else {
      const currentIndices = [...offerForm.menuItemIndices];
      const indexPos = currentIndices.indexOf(menuIndex);
      if (indexPos > -1) {
        currentIndices.splice(indexPos, 1);
      } else {
        currentIndices.push(menuIndex);
      }
      setOfferForm({ ...offerForm, menuItemIndices: currentIndices });
    }
  };

  if (loading) {
    return (
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">Restaurant Dashboard</h2>
          <p className="text-center text-error">Failed to load restaurant data. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    {/* Profile Card */}
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Restaurant Profile</h2>
          <div>
            <button className="btn btn-sm btn-outline" onClick={handleToggleEditProfile}>
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>
        </div>

        {editingProfile && (
          <form onSubmit={handleUpdateProfile} className="bg-base-200 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label"><span className="label-text">Restaurant Name</span></label>
                <input name="RestaurantName" value={editForm.RestaurantName} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Owner Name</span></label>
                <input name="OwnerName" value={editForm.OwnerName} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Email</span></label>
                <input name="email" value={editForm.email} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Restaurant Phone</span></label>
                <input name="RestaurantPhone" value={editForm.RestaurantPhone} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Owner Phone</span></label>
                <input name="OwnerPhone" value={editForm.OwnerPhone} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Address</span></label>
                <input name="address" value={editForm.address} onChange={handleEditFormChange} className="input input-bordered w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="label"><span className="label-text">Description</span></label>
                <textarea name="description" value={editForm.description} onChange={handleEditFormChange} className="textarea textarea-bordered w-full" />
              </div>
              <div>
                <label className="label"><span className="label-text">Reservation Limit</span></label>
                <input
                  name="reservationLimit"
                  type="number"
                  min="0"
                  value={editForm.reservationLimit}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Main Info */}
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-3">{restaurant.RestaurantName}</h3>
            <p className="text-sm mb-4">{restaurant.description || "No description provided"}</p>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Owner:</strong> {restaurant.OwnerName}
              </div>
              <div>
                <strong>Email:</strong> {restaurant.email}
              </div>
              <div>
                <strong>Phone:</strong> {restaurant.RestaurantPhone}
              </div>
              <div>
                <strong>Address:</strong> {restaurant.address}
              </div>
              {restaurant.OwnerPhone && (
                <div>
                  <strong>Owner Phone:</strong> {restaurant.OwnerPhone}
                </div>
              )}
              <div>
                <strong>Reservation Limit:</strong> {restaurant.reservationLimit || 0}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="bg-base-200 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg mb-3">Restaurant Statistics</h4>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Menu Items</div>
                  <div className="stat-value text-primary">
                    {restaurant.menu ? restaurant.menu.length : 0}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Current Reservations</div>
                  <div className="stat-value text-secondary">
                    {restaurant.currentReservations || 0}
                  </div>
                  <div className="stat-desc">of {restaurant.reservationLimit || 0} limit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Offers Card */}
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Offer Management</h2>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowOfferForm(!showOfferForm)}
          >
            {showOfferForm ? "Cancel" : "+ Add Offer"}
          </button>
        </div>

        {/* Add Offer Form */}
        {showOfferForm && (
          <form onSubmit={handleAddOffer} className="bg-base-200 p-4 rounded-lg mb-6">
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Offer Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekend Special"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="input input-bordered w-full focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Discount Percentage (0-100)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                  value={offerForm.percentage}
                  onChange={(e) => setOfferForm({ ...offerForm, percentage: e.target.value })}
                  className="input input-bordered w-full focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Select Menu Items (check to include in offer)</span>
                </label>
                <div className="bg-base-100 p-3 rounded-lg max-h-48 overflow-y-auto space-y-2">
                  {restaurant.menu && restaurant.menu.length > 0 ? (
                    restaurant.menu.map((item, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={offerForm.menuItemIndices.includes(index)}
                          onChange={() => toggleMenuItemInOffer(index, false)}
                        />
                        <span className="flex-1">{item.name} - ${item.price}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No menu items available. Add menu items first.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-secondary w-full">
                <Tag size={16} />
                Add Offer
              </button>
            </div>
          </form>
        )}

        {/* Offers List */}
        <div className="space-y-3">
          {!restaurant.offers || restaurant.offers.length === 0 ? (
            <div className="alert alert-info">
              <span>No offers yet. Add one to attract more customers!</span>
            </div>
          ) : (
            restaurant.offers.map((offer, index) => (
              <div key={index} className="bg-base-200 p-4 rounded-lg">
                {editingOfferIndex === index ? (
                  <form onSubmit={(e) => handleUpdateOffer(e, index)} className="space-y-3">
                    <div>
                      <label className="label"><span className="label-text">Title</span></label>
                      <input
                        value={editOfferForm.title}
                        onChange={(e) => setEditOfferForm({ ...editOfferForm, title: e.target.value })}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Percentage</span></label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editOfferForm.percentage}
                        onChange={(e) => setEditOfferForm({ ...editOfferForm, percentage: e.target.value })}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Menu Items</span></label>
                      <div className="bg-base-100 p-3 rounded-lg max-h-40 overflow-y-auto space-y-2">
                        {restaurant.menu && restaurant.menu.map((item, menuIndex) => (
                          <label key={menuIndex} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={editOfferForm.menuItemIndices.includes(menuIndex)}
                              onChange={() => toggleMenuItemInOffer(menuIndex, true)}
                            />
                            <span className="flex-1">{item.name} - ${item.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-sm btn-success">Save</button>
                      <button type="button" onClick={cancelEditOffer} className="btn btn-sm">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Tag size={18} className="text-secondary" />
                          {offer.title}
                        </h4>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {offer.percentage}% OFF
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-outline" onClick={() => startEditOffer(index)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-error" onClick={() => handleDeleteOffer(index)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">Applies to:</p>
                      {offer.menuItemIndices && offer.menuItemIndices.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {offer.menuItemIndices.map((menuIndex) => (
                            restaurant.menu[menuIndex] && (
                              <span key={menuIndex} className="badge badge-outline">
                                {restaurant.menu[menuIndex].name}
                              </span>
                            )
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No specific items selected</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    {/* Menu Card */}
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add Menu Item"}
          </button>
        </div>

        {/* Add Menu Form */}
        {showForm && (
          <form onSubmit={handleAddMenuItem} className="bg-base-200 p-4 rounded-lg mb-6">
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Item Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Margherita Pizza"
                  value={menuItem.name}
                  onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                  className="input input-bordered w-full focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">
                    <span className="label-text">Price</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={menuItem.price}
                    onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                    className="input input-bordered w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={menuItem.description}
                    onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                    className="input input-bordered w-full focus:outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success w-full">
                Add Menu Item
              </button>
            </div>
          </form>
        )}

        {/* Menu List */}
        <div className="space-y-3">
          {!restaurant.menu || restaurant.menu.length === 0 ? (
            <div className="alert alert-info">
              <span>No menu items yet. Add one to get started!</span>
            </div>
          ) : (
            restaurant.menu.map((item, index) => (
              <div key={index} className="bg-base-200 p-4 rounded-lg">
                {editingIndex === index ? (
                  <form onSubmit={(e) => handleUpdateMenu(e, index)} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="label"><span className="label-text">Name</span></label>
                      <input value={editMenuForm.name} onChange={(e) => setEditMenuForm((f) => ({ ...f, name: e.target.value }))} className="input input-bordered w-full" />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Price</span></label>
                      <input type="number" value={editMenuForm.price} onChange={(e) => setEditMenuForm((f) => ({ ...f, price: e.target.value }))} className="input input-bordered w-full" />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Description</span></label>
                      <input value={editMenuForm.description} onChange={(e) => setEditMenuForm((f) => ({ ...f, description: e.target.value }))} className="input input-bordered w-full" />
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                      <button type="submit" className="btn btn-sm btn-success">Save</button>
                      <button type="button" onClick={cancelEditMenu} className="btn btn-sm">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-primary">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </div>
                      <button className="btn btn-sm" onClick={() => startEditMenu(index)}>Edit</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    {/* Reservations Card */}
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Reservation Management</h2>
          <div className="flex gap-2">
            <select
              value={reservationFilter}
              onChange={(e) => setReservationFilter(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-base-200 rounded-lg max-h-96 overflow-y-auto">
          <div className="p-4">
            {getFilteredReservations().length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No {reservationFilter === "all" ? "" : reservationFilter} reservations
              </p>
            ) : (
              <div className="space-y-3">
                {getFilteredReservations().map((reservation, index) => (
                  <div
                    key={reservation._id || index}
                    className="bg-base-100 p-4 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                    onClick={() => openReservationModal(reservation)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold">{reservation.name}</h4>
                        <p className="text-sm text-gray-600">
                          {reservation.numberOfPeople} people • {new Date(reservation.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          reservation.status === 'pending' ? 'badge-warning' :
                          reservation.status === 'confirmed' ? 'badge-success' :
                          reservation.status === 'completed' ? 'badge-info' :
                          'badge-error'
                        }`}>
                          {reservation.status}
                        </span>
                        <Calendar size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Reservation Details Modal */}
    {showReservationModal && selectedReservation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Reservation Details</h3>
            <div className="space-y-3">
              <div>
                <strong>Name:</strong> {selectedReservation.name}
              </div>
              <div>
                <strong>Number of People:</strong> {selectedReservation.numberOfPeople}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedReservation.date).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`badge ${
                  selectedReservation.status === 'pending' ? 'badge-warning' :
                  selectedReservation.status === 'confirmed' ? 'badge-success' :
                  selectedReservation.status === 'completed' ? 'badge-info' :
                  'badge-error'
                }`}>
                  {selectedReservation.status}
                </span>
              </div>
              <div>
                <strong>Created:</strong> {new Date(selectedReservation.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="modal-action">
              {selectedReservation.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReservationStatusUpdate(selectedReservation._id, 'confirmed')}
                    className="btn btn-success gap-2"
                    disabled={updatingReservation}
                  >
                    <Check size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReservationStatusUpdate(selectedReservation._id, 'cancelled')}
                    className="btn btn-error gap-2"
                    disabled={updatingReservation}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}
              {selectedReservation.status === 'confirmed' && (
                <button
                  onClick={() => handleReservationStatusUpdate(selectedReservation._id, 'completed')}
                  className="btn btn-primary gap-2"
                  disabled={updatingReservation}
                >
                  <Check size={16} />
                  Complete
                </button>
              )}
              <button onClick={closeReservationModal} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default RestaurantDashboardWindow;
