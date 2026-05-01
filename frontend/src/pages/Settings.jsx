/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { User, Lock, Mail, Camera, Save } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("petUser") || "{}"),
  );
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setIsLoading(true);
    const token = localStorage.getItem("petToken");

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem("petUser", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully!");
        // Reset mật khẩu sau khi đổi xong
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">
          Manage your profile information and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI: AVATAR TRỰC QUAN */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-brandBlue text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 shadow-inner">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-gray-200 shadow-sm text-gray-600 hover:text-brandBlue transition">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500 uppercase font-bold mt-1 tracking-wider">
              {user.role}
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* PHẦN THÔNG TIN CƠ BẢN */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2">
                  <User size={20} className="text-brandBlue" /> Personal
                  Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN BẢO MẬT */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2">
                  <Lock size={20} className="text-brandBlue" /> Security
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                disabled={isLoading}
                type="submit"
                className="bg-brandBlue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Save size={20} /> {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
