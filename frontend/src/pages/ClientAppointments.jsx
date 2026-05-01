import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Plus,
  AlertCircle,
} from "lucide-react";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import toast from "react-hot-toast";

const ClientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error fetching appointments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAdded = (newAppt) => {
    setAppointments([newAppt, ...appointments]);
    fetchAppointments();
  };

  // HÀM XỬ LÝ HỦY LỊCH
  const handleCancel = async (apptId, apptDate, apptTime) => {
    // 1. Kiểm tra nhanh ở Frontend cho UX mượt (không cần gọi API nếu đã trễ)
    const apptDateTime = new Date(`${apptDate}T${apptTime}`);
    const now = new Date();
    const diffInHours = (apptDateTime - now) / (1000 * 60 * 60);

    if (diffInHours < 2) {
      return toast.error(
        "Cancellations must be made at least 2 hours in advance. Please call the clinic.",
        { duration: 5000 },
      );
    }

    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    // 2. Gửi yêu cầu lên Backend
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${apptId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("Appointment cancelled successfully.");
        // Cập nhật lại UI ngay lập tức
        setAppointments(
          appointments.map((a) =>
            a._id === apptId ? { ...a, status: "cancelled" } : a,
          ),
        );
      } else {
        const errorData = await res.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection error. Could not cancel.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentAdded={handleAppointmentAdded}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="text-brandBlue" size={32} /> My Appointments
          </h1>
          <p className="text-gray-500 mt-1">
            Track your upcoming clinic visits and history.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brandBlue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> Book New Visit
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Loading your schedule...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You don't have any clinic visits scheduled.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-brandBlue font-bold hover:underline"
            >
              Click here to book one
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Pet</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">
                      {new Date(appt.date).toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                      <Clock size={12} /> {appt.time}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={appt.pet?.img || "https://via.placeholder.com/40"}
                        alt="pet"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-bold text-brandBlue">
                        {appt.pet?.name || "Pet"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800 text-sm">
                      {appt.reason}
                    </p>
                    {appt.vet && (
                      <p className="text-xs text-gray-500 mt-1">
                        Vet: Dr. {appt.vet.name}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    {appt.status === "pending" && (
                      <span className="flex items-center gap-1.5 text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full w-max border border-orange-100">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                    {appt.status === "confirmed" && (
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-100">
                        <CheckCircle size={14} /> Confirmed
                      </span>
                    )}
                    {appt.status === "cancelled" && (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-full w-max border border-red-100">
                        <XCircle size={14} /> Cancelled
                      </span>
                    )}
                    {appt.status === "completed" && (
                      <span className="flex items-center gap-1.5 text-gray-600 font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-full w-max border border-gray-200">
                        <Activity size={14} /> Completed
                      </span>
                    )}
                  </td>

                  {/* CỘT NÚT HỦY DÀNH CHO KHÁCH */}
                  <td className="p-4 text-center">
                    {appt.status === "pending" ||
                    appt.status === "confirmed" ? (
                      <button
                        onClick={() =>
                          handleCancel(appt._id, appt.date, appt.time)
                        }
                        className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg transition"
                      >
                        Cancel Visit
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;
