import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Activity,
  CalendarCheck,
  Phone,
  Info,
  UserPlus,
  CalendarClock,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]); // Danh sách bác sĩ
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "today", "all"
  const [selectedApptId, setSelectedApptId] = useState(null);

  const [showOnlyMyAppts, setShowOnlyMyAppts] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("petUser") || "{}");
  const isVet = currentUser.role === "vet";

  // States cho các Modal thao tác
  const [modalType, setModalType] = useState(null); // 'cancel', 'reschedule', 'assign', 'confirm'
  const [formData, setFormData] = useState({
    cancelReason: "",
    date: "",
    time: "",
    vetId: "",
  });

  const todayStr = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    fetchAppointments();
    fetchVets();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(
        "http://localhost:5000/api/appointments/admin/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
        // Tự động chọn lịch hẹn đầu tiên nếu có
        if (data.length > 0) setSelectedApptId(data[0]._id);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching appointments.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVets = async () => {
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const users = await res.json();
        setVets(users.filter((u) => u.role === "admin" || u.role === "vet"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petToken");

    // Tạo payload dựa trên loại hành động
    let payload = {};
    if (modalType === "cancel")
      payload = { status: "cancelled", cancelReason: formData.cancelReason };
    if (modalType === "reschedule")
      payload = { date: formData.date, time: formData.time };
    if (modalType === "assign" || modalType === "confirm") {
      payload = { status: "confirmed" };
      if (formData.vetId) payload.vet = formData.vetId;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${selectedApptId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const updatedAppt = await res.json();
        setAppointments(
          appointments.map((a) => (a._id === selectedApptId ? updatedAppt : a)),
        );
        toast.success(`Appointment successfully updated!`);
        closeModal();
      } else {
        toast.error("Failed to update appointment.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error.");
    }
  };

  const openModal = (type) => {
    const currentAppt = appointments.find((a) => a._id === selectedApptId);
    setFormData({
      cancelReason: "",
      date: currentAppt?.date || "",
      time: currentAppt?.time || "",
      vetId: currentAppt?.vet?._id || "",
    });
    setModalType(type);
  };
  const closeModal = () => setModalType(null);

  // --- LOGIC LỌC TABS ---
  const filteredAppointments = appointments.filter((appt) => {
    // Lọc theo Tab (Today/Pending/All)
    let matchesTab = true;
    if (activeTab === "today") matchesTab = appt.date === todayStr;
    else if (activeTab === "pending") matchesTab = appt.status === "pending";

    // 👉 Lọc theo "Lịch của tôi"
    let matchesOwner = true;
    if (showOnlyMyAppts) matchesOwner = appt.vet?._id === currentUser._id;

    return matchesTab && matchesOwner;
  });

  // --- 4 THẺ SUMMARY ---
  const todayCount = appointments.filter((a) => a.date === todayStr).length;
  const pendingCount = appointments.filter(
    (a) => a.status === "pending",
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const selectedAppt = appointments.find((a) => a._id === selectedApptId);

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 h-[calc(100vh-80px)] flex flex-col">
      {/* PHẦN 1: SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-brandBlue">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Total Today
            </p>
            <p className="text-xl font-black text-gray-900">{todayCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm flex items-center gap-4 bg-orange-50/50">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-orange-600 font-bold uppercase">
              Action Needed
            </p>
            <p className="text-xl font-black text-orange-700">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Confirmed
            </p>
            <p className="text-xl font-black text-gray-900">{confirmedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-500">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Cancelled
            </p>
            <p className="text-xl font-black text-gray-900">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* PHẦN 2: TABS */}
      <div className="bg-white p-1.5 rounded-xl inline-flex gap-1 border border-gray-100 shadow-sm shrink-0 w-max">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === "pending" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Needs Action{" "}
          {pendingCount > 0 && (
            <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("today")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "today" ? "bg-brandBlue text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Today's Schedule
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "all" ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          All Records
        </button>
        {isVet && (
          <button
            onClick={() => setShowOnlyMyAppts(!showOnlyMyAppts)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              showOnlyMyAppts
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <User size={18} />
            {showOnlyMyAppts
              ? "Showing My Schedule"
              : "Show All Clinic Schedule"}
          </button>
        )}
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden pb-8">
        {/* PHẦN 3: DANH SÁCH LỊCH HẸN (BÊN TRÁI) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-800 shrink-0 bg-gray-50">
            Appointment List
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {isLoading ? (
              <div className="text-center p-8 text-gray-400">Loading...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                No appointments found.
              </div>
            ) : (
              filteredAppointments.map((appt) => (
                <div
                  key={appt._id}
                  onClick={() => setSelectedApptId(appt._id)}
                  className={`p-4 rounded-xl cursor-pointer border transition ${selectedApptId === appt._id ? "border-brandBlue bg-blue-50/50 shadow-sm" : "border-gray-50 hover:bg-gray-50 hover:border-gray-200"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={appt.pet?.img || "https://via.placeholder.com/40"}
                        alt="pet"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">
                          {appt.pet?.name || "Pet"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User size={12} /> {appt.user?.name?.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-brandBlue text-sm">
                        {appt.time}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">
                        {new Date(appt.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      {appt.reason}
                    </span>
                    {appt.status === "pending" && (
                      <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                    {appt.status === "confirmed" && (
                      <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        Confirmed
                      </span>
                    )}
                    {appt.status === "cancelled" && (
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        Cancelled
                      </span>
                    )}
                    {appt.status === "completed" && (
                      <span className="text-[10px] font-black uppercase text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PHẦN 4: DETAIL PANEL (BÊN PHẢI) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-y-auto">
          {selectedAppt ? (
            <div className="p-6 sm:p-8 flex flex-col h-full">
              {/* STATUS HEADER */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Visit Details
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Requested on{" "}
                    {new Date(selectedAppt.createdAt).toLocaleDateString(
                      "en-GB",
                    )}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl border ${selectedAppt.status === "pending" ? "bg-orange-50 border-orange-200 text-orange-700" : selectedAppt.status === "confirmed" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider block mb-0.5 text-center">
                    Status
                  </span>
                  <span className="font-black text-lg capitalize flex justify-center items-center gap-2">
                    {selectedAppt.status === "pending" && <Clock size={18} />}
                    {selectedAppt.status === "confirmed" && (
                      <CheckCircle size={18} />
                    )}
                    {selectedAppt.status}
                  </span>
                </div>
              </div>

              {/* THÔNG TIN CHI TIẾT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                {/* Pet & Owner */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity size={16} /> Pet Info
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl flex gap-4 items-center">
                      <img
                        src={selectedAppt.pet?.img}
                        alt="pet"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          {selectedAppt.pet?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedAppt.pet?.breed} • {selectedAppt.pet?.age} •{" "}
                          {selectedAppt.pet?.weight}
                        </p>
                      </div>
                      <Link
                        to={`/pets/${selectedAppt.pet?._id}`}
                        className="bg-white border border-gray-200 text-brandBlue text-xs font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition"
                      >
                        View Records
                      </Link>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={16} /> Client Info
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-bold text-gray-900">
                        {selectedAppt.user?.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone size={14} />{" "}
                        {selectedAppt.user?.phone || "No phone provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule & Notes */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CalendarClock size={16} /> Schedule
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="font-bold text-brandBlue text-lg">
                        {new Date(selectedAppt.date).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      <p className="font-black text-gray-900 text-2xl mt-1">
                        {selectedAppt.time}
                      </p>
                      <p className="text-sm font-bold text-gray-600 mt-2 pt-2 border-t border-blue-100 border-dashed">
                        Reason: {selectedAppt.reason}
                      </p>
                    </div>
                  </div>
                  {/* Doctor & Notes */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Assigned Vet
                    </p>
                    <p className="font-bold text-gray-900 mb-3">
                      {selectedAppt.vet?.name || "Unassigned"}
                    </p>

                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Client Notes
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      {selectedAppt.notes || "None"}
                    </p>

                    {selectedAppt.cancelReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                        <span className="font-bold block mb-1">
                          Cancellation Reason:
                        </span>{" "}
                        {selectedAppt.cancelReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CÁC NÚT HÀNH ĐỘNG (Dính chặt ở dưới) */}
              <div className="mt-auto pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                {selectedAppt.status === "pending" && (
                  <>
                    <button
                      onClick={() => openModal("confirm")}
                      className="flex-1 bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={18} /> Confirm Visit
                    </button>
                    <button
                      onClick={() => openModal("cancel")}
                      className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 flex justify-center items-center gap-2"
                    >
                      <XCircle size={18} /> Cancel
                    </button>
                  </>
                )}
                {selectedAppt.status === "confirmed" && (
                  <button
                    onClick={() =>
                      handleActionSubmit({ preventDefault: () => {} })
                    }
                    onMouseEnter={() => setModalType("complete")}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition flex justify-center items-center gap-2"
                  >
                    Mark as Completed
                  </button>
                )}

                {/* Luôn hiện nếu chưa Cancel/Complete */}
                {selectedAppt.status !== "cancelled" &&
                  selectedAppt.status !== "completed" && (
                    <>
                      <button
                        onClick={() => openModal("reschedule")}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => openModal("assign")}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center gap-2"
                      >
                        <UserPlus size={18} />{" "}
                        {selectedAppt.vet ? "Change Vet" : "Assign Vet"}
                      </button>
                    </>
                  )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Info size={48} className="mb-4 opacity-50" />
              <p className="font-medium">
                Select an appointment from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- CÁC MODALS THAO TÁC --- */}
      {modalType && modalType !== "complete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div
              className={`p-4 text-white flex justify-between items-center font-bold text-lg ${modalType === "cancel" ? "bg-red-500" : "bg-brandBlue"}`}
            >
              {modalType === "cancel" && "Cancel Appointment"}
              {modalType === "reschedule" && "Reschedule Visit"}
              {modalType === "assign" && "Assign Veterinarian"}
              {modalType === "confirm" && "Confirm & Assign Vet"}
            </div>
            <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
              {/* Form Cancel */}
              {modalType === "cancel" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.cancelReason}
                    onChange={(e) =>
                      setFormData({ ...formData, cancelReason: e.target.value })
                    }
                    placeholder="This reason will be sent to the client..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  ></textarea>
                </div>
              )}

              {/* Form Reschedule */}
              {modalType === "reschedule" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brandBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brandBlue"
                    />
                  </div>
                </div>
              )}

              {/* Form Assign / Confirm */}
              {(modalType === "assign" || modalType === "confirm") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Veterinarian (Optional)
                  </label>
                  <select
                    value={formData.vetId}
                    onChange={(e) =>
                      setFormData({ ...formData, vetId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brandBlue bg-gray-50"
                  >
                    <option value="">-- Unassigned --</option>
                    {vets.map((v) => (
                      <option key={v._id} value={v._id}>
                        Dr. {v.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecting a vet will notify them of their new schedule.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white py-3 rounded-xl font-bold transition shadow-lg ${modalType === "cancel" ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-brandBlue hover:bg-blue-700 shadow-blue-500/30"}`}
                >
                  {modalType === "cancel" ? "Confirm Cancel" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
