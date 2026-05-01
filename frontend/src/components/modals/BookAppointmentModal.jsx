import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

const BookAppointmentModal = ({ isOpen, onClose, onAppointmentAdded }) => {
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    pet: "",
    date: "",
    time: "",
    reason: "General Checkup",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách thú cưng của khách hàng để thả vào thẻ <select>
  useEffect(() => {
    if (isOpen) {
      fetchUserPets();
    }
  }, [isOpen]);

  const fetchUserPets = async () => {
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch("http://localhost:5000/api/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPets(data);
        // Tự động chọn bé pet đầu tiên nếu có
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, pet: data[0]._id }));
        }
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách pet:", error);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("petToken");

    if (!formData.pet) {
      alert("Please add a pet to your profile first before booking.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Appointment booked successfully!");
        onAppointmentAdded(data); // Gửi dữ liệu về cho Dashboard cập nhật
        onClose();
        setFormData({
          pet: pets[0]?._id || "",
          date: "",
          time: "",
          reason: "General Checkup",
          notes: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-brandBlue p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={20} /> Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-600 p-1 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* CHỌN THÚ CƯNG */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Pet *
            </label>
            <select
              name="pet"
              value={formData.pet}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
            >
              {pets.length === 0 ? (
                <option value="">No pets found</option>
              ) : null}
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} ({pet.breed})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Visit *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
            >
              <option value="General Checkup">General Checkup</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Illness/Injury">Illness / Injury</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows="2"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any symptoms or questions?"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
            ></textarea>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full mt-4 bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {isLoading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
