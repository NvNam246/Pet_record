import React, { useState } from "react";
import { PawPrint, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Biến lưu trữ dữ liệu người nhập
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Chọn đường dẫn API tùy theo đang ở form nào
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Nếu là login thì không gửi name
        body: JSON.stringify(
          isLogin
            ? { email: formData.email, password: formData.password }
            : formData,
        ),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isLogin) {
          toast.success("Registration Successful! Please Sign In.");
          setIsLogin(true); // Chuyển sang màn đăng nhập
        } else {
          toast.success("Login Successful!");
          // Lưu token vào máy người dùng để giữ đăng nhập
          localStorage.setItem("petToken", data.token);
          localStorage.setItem("petUser", JSON.stringify(data.user));
          // Đẩy về trang chủ (Sau này có thể đẩy về trang Dashboard)
          navigate("/");
        }
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      toast.error("Failed to connect to the server. Is Backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-white relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-brandBlue p-3 rounded-xl text-white mb-4 shadow-lg shadow-blue-500/30 transform -rotate-6">
            <PawPrint size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            {isLogin
              ? "Sign in to access your pet records"
              : "Join us to manage your pet health"}
          </p>
        </div>

        {/* Form đã được gắn hàm handleSubmit */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name" // THÊM NAME
                required={!isLogin}
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              type="email"
              name="email" // THÊM NAME
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              type="password"
              name="password" // THÊM NAME
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brandBlue text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brandBlue font-bold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition mt-6 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
