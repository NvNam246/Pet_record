import React, { useState } from "react";
import { X, Upload, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Dùng để chuyển trang

const AddPetModal = ({ isOpen, onClose, onPetAdded }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Đã xóa defaultPlan và useEffect vì không cần nữa

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("petToken");

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("breed", formData.breed);
    dataToSend.append("age", formData.age);
    dataToSend.append("weight", formData.weight);
    // Đã xóa dataToSend.append("plan", ...)

    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      const response = await fetch("http://localhost:5000/api/pets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pet added successfully!"); // Dùng toast thay alert
        setFormData({ name: "", breed: "", age: "", weight: "" });
        setImageFile(null);
        onPetAdded(data);
        onClose();
      } else {
        // 👉 ĐÂY LÀ NƠI XỬ LÝ LỖI SAAS (PLAN LIMIT)
        if (data.error === "PLAN_LIMIT_EXCEEDED") {
          toast.error(
            <div className="flex flex-col gap-2">
              <b>Limit Reached!</b>
              <span className="text-sm">{data.message}</span>
              <button
                onClick={() => {
                  toast.dismiss(); // Tắt thông báo
                  onClose(); // Đóng Modal Add Pet
                  navigate("/dashboard/pricing"); // Chuyển sang trang Pricing
                }}
                className="mt-2 bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold w-max flex items-center gap-1"
              >
                <Sparkles size={12} /> Upgrade Plan
              </button>
            </div>,
            { duration: 6000 }, // Hiện lâu hơn chút để khách kịp đọc và bấm nút
          );
        } else {
          toast.error(`Error: ${data.message}`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-brandBlue p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold">Add New Pet</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-600 p-1 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Nhập liệu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Fluffy"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brandBlue outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Breed *
            </label>
            <input
              type="text"
              name="breed"
              required
              value={formData.breed}
              onChange={handleChange}
              placeholder="e.g., Golden Retriever"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brandBlue outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="text"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 3 Years"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brandBlue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight *
              </label>
              <input
                type="text"
                name="weight"
                required
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 65 lbs"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brandBlue outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Photo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brandBlue transition cursor-pointer relative bg-gray-50">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer rounded-md font-medium text-brandBlue hover:text-blue-500">
                    <span>{imageFile ? imageFile.name : "Upload a file"}</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full mt-6 bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {isLoading ? "Saving..." : "Save Pet Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPetModal;
