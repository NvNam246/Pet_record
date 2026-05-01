import React, { useState, useEffect } from "react";
import {
  PawPrint,
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Users,
  Sparkles, // 👉 ĐÃ FIX: Import thêm Sparkles
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("petToken");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("petUser")) || { name: "User" };
  const isAdmin = user.role === "admin";
  const isVet = user.role === "vet";

  const handleLogout = () => {
    localStorage.removeItem("petToken");
    localStorage.removeItem("petUser");
    navigate("/");
  };

  // 👉 MENU THÔNG MINH PHÂN QUYỀN
  let menuItems = [];

  if (isAdmin) {
    menuItems = [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Verification Queue",
        path: "/admin",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Patient Tickets", // Đổi tên cho hợp ngữ cảnh bác sĩ
        path: "/admin/messages",
      },
      {
        icon: <Calendar size={20} />,
        label: "Appointments",
        path: "/admin/appointments",
      },
      {
        icon: <Users size={20} />,
        label: "User Management",
        path: "/admin/users",
      },
      {
        icon: <Settings size={20} />,
        label: "Settings",
        path: "/admin/settings",
      },
    ];
  } else if (isVet) {
    menuItems = [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Verification Queue",
        path: "/admin",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Patient Tickets", // Đổi tên cho hợp ngữ cảnh bác sĩ
        path: "/admin/messages",
      },
      {
        icon: <Calendar size={20} />,
        label: "Appointments",
        path: "/admin/appointments",
      },
      {
        icon: <Settings size={20} />,
        label: "Settings",
        path: "/admin/settings",
      },
    ];
  } else {
    menuItems = [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: <Calendar size={20} />,
        label: "My Appointments",
        path: "/dashboard/appointments",
      },
      {
        icon: <Settings size={20} />,
        label: "Settings",
        path: "/dashboard/settings",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Ask a Vet",
        path: "/dashboard/messages",
      },
      // 👉 ĐÃ FIX: Chuyển Upgrade Plan thành Object kèm cờ isUpgrade
      {
        icon: <Sparkles size={16} />,
        label: "Upgrade Plan",
        path: "/dashboard/pricing",
        isUpgrade: true,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white w-64 shadow-sm border-r border-gray-100 transform transition-transform duration-300 z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-2">
            <div className="bg-brandBlue p-2 rounded-xl text-white">
              <PawPrint size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">PetAware</span>
          </div>

          {isAdmin && (
            <div className="px-6 mb-2">
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          )}

          <nav className="flex-1 px-4 space-y-2 mt-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              // 👉 ĐÃ FIX: Hiển thị giao diện đặc biệt nếu là nút Upgrade
              if (item.isUpgrade) {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4 text-gray-600 hover:bg-gray-50 transition border border-purple-100 bg-purple-50/30"
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-1.5 rounded-lg shadow-sm">
                      {item.icon}
                    </div>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              // Render các nút menu bình thường
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? "bg-brandBlue text-white shadow-md shadow-blue-500/20" : "text-gray-500 hover:bg-blue-50 hover:text-brandBlue"}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-medium rounded-xl hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        {/* Top Header */}
        <header className="bg-white h-20 border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 focus:outline-none bg-gray-50 p-2 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-gray-800">
              Welcome back, {user.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-sm text-gray-500">
              {isAdmin
                ? "Here's the clinic overview for today."
                : isVet
                  ? "Here are your patients for today."
                  : "Here is what's happening with your pets today."}
            </p>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative text-gray-400 hover:text-brandBlue transition">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-brandBlue text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8">
          {children}
        </main>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
