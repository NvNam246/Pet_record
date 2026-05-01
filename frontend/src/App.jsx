import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PetDetails from "./pages/PetDetails";
import AdminAppointments from "./pages/AdminAppointments";
import AdminUsers from "./pages/AdminUsers";
import ClientAppointments from "./pages/ClientAppointments";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import Messages from "./pages/Messages";
// Component xử lý cuộn trang
const ScrollToHash = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);
  return null;
};

const HomePage = () => {
  const [ratingData, setRatingData] = useState({ average: 4.8, count: 12 });
  const handleAddNewReview = (newStarRating) => {
    setRatingData((prev) => {
      const newCount = prev.count + 1;
      const newAverage = (prev.average * prev.count + newStarRating) / newCount;
      return { average: newAverage, count: newCount };
    });
  };
  return (
    <>
      <Hero rating={ratingData.average} reviewCount={ratingData.count} />
      <Stats />
      <Features />
      <HowItWorks />
      <Blog onSubmitReview={handleAddNewReview} />
      <Contact />
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToHash />

      {/* 2. Đặt Toaster ở đây, cấu hình hiển thị ở góc trên bên phải */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000, // Tự động ẩn sau 3 giây
          style: {
            background: "#fff",
            color: "#363636",
            fontWeight: "bold",
            borderRadius: "12px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        }}
      />

      <div className="min-h-screen font-sans bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* SETTINGS ROUTES */}
            <Route
              path="/admin/settings"
              element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <DashboardLayout>
                  <AdminAppointments />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              }
            />

            {/* CLIENT ROUTES */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/appointments"
              element={
                <DashboardLayout>
                  <ClientAppointments />
                </DashboardLayout>
              }
            />
            <Route
              path="/pets/:id"
              element={
                <DashboardLayout>
                  <PetDetails />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/pricing"
              element={
                <DashboardLayout>
                  <Pricing />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/messages"
              element={
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
