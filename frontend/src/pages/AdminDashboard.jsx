import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  User,
  Filter,
  XCircle,
  X,
  Trash2,
} from "lucide-react"; // Thêm XCircle, X
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [pets, setPets] = useState([]);
  const [filter, setFilter] = useState("all");

  // State cho Modal Từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchAllPets = async () => {
      const token = localStorage.getItem("petToken");
      const res = await fetch("http://localhost:5000/api/pets/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPets(data);
    };
    fetchAllPets();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm("Are you sure you want to verify this profile?"))
      return;
    const token = localStorage.getItem("petToken");
    const res = await fetch(`http://localhost:5000/api/pets/${id}/verify`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPets(
        pets.map((p) => (p._id === id ? { ...p, status: "verified" } : p)),
      );
      toast.success("Profile has been successfully verified!");
    }
  };

  // Mở modal từ chối
  const openRejectModal = (id) => {
    setSelectedPetId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Xử lý gửi lý do từ chối
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petToken");

    try {
      const res = await fetch(
        `http://localhost:5000/api/pets/${selectedPetId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        },
      );

      if (res.ok) {
        setPets(
          pets.map((p) =>
            p._id === selectedPetId
              ? { ...p, status: "rejected", rejectReason }
              : p,
          ),
        );
        setIsRejectModalOpen(false);
        toast.error("Profile has been rejected.");
      } else {
        toast.error("Failed to reject profile.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error.");
    }
  };

  // Xử lý Xóa Pet
  const handleDeletePet = async (petId, petName) => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete ${petName}'s profile? This action cannot be undone.`,
      )
    )
      return;

    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Cập nhật lại danh sách trên màn hình
        setPets(pets.filter((p) => p._id !== petId));
        toast.success(`${petName}'s profile has been deleted.`);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error while deleting pet.");
    }
  };

  const filteredPets = pets.filter((pet) => {
    if (filter === "all") return true;
    return pet.status === filter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Clinic Staff Panel - Verification Queue
        </h1>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Filter Status:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border-none bg-transparent font-bold text-brandBlue focus:ring-0 cursor-pointer outline-none"
          >
            <option value="all">All Pets</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Owner</th>
              <th className="p-4">Pet Details</th>
              <th className="p-4">Care Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPets.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No pets found matching the filter.
                </td>
              </tr>
            ) : (
              filteredPets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {pet.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pet.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/pets/${pet._id}`}
                      className="flex items-center gap-3 group block w-max"
                    >
                      <img
                        src={pet.img}
                        alt={pet.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-brandBlue group-hover:underline transition">
                          {pet.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pet.breed} • {pet.age}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-brandBlue rounded-full text-xs font-bold border border-blue-100">
                      {pet.user?.plan || pet.plan || "Free"}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* HIỂN THỊ 3 LOẠI TRẠNG THÁI */}
                    {pet.status === "pending" && (
                      <span className="flex items-center gap-1.5 text-yellow-600 font-bold text-xs bg-yellow-50 px-2.5 py-1 rounded-full w-max border border-yellow-100">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                    {pet.status === "verified" && (
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-100">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                    {pet.status === "rejected" && (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-full w-max border border-red-100">
                        <XCircle size={14} /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/pets/${pet._id}`}
                        className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                      >
                        View Details
                      </Link>

                      {/* CHỈ HIỆN NÚT VERIFY / REJECT KHI ĐANG PENDING */}
                      {pet.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerify(pet._id)}
                            className="bg-brandBlue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => openRejectModal(pet._id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition border border-red-100"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* NÚT XÓA DÀNH CHO ADMIN (Luôn hiện dù ở trạng thái nào) */}
                      <button
                        onClick={() => handleDeletePet(pet._id, pet.name)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition ml-2"
                        title="Delete Pet"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL TỪ CHỐI HỒ SƠ --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-500 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <XCircle size={20} /> Reject Profile
              </h2>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="hover:bg-red-600 p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g., Image is unclear, weight seems incorrect..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                ></textarea>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
