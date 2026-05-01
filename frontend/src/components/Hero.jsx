import React, { useState, useEffect } from "react"; // Thêm useState, useEffect
import { Play, Star, LayoutDashboard } from "lucide-react"; // Thêm LayoutDashboard
import { useNavigate } from "react-router-dom";

const Hero = ({ rating, reviewCount }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Lấy thông tin user
  useEffect(() => {
    const storedUser = localStorage.getItem("petUser");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <section className="bg-brandBlue text-white pt-16 pb-24 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Keep Your Pets{" "}
            <span className="text-blue-200">Healthy & Happy</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-lg">
            The most comprehensive pet health management platform. Track
            veterinary visits, medications, vaccinations, and wellness records —
            all in one place.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            {/* THAY ĐỔI NÚT DỰA VÀO ĐĂNG NHẬP */}
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-brandBlue px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
              >
                <LayoutDashboard size={20} />
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-white text-brandBlue px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
              >
                Get Started Free
              </button>
            )}

            <button className="border border-blue-300 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition flex items-center gap-2">
              <Play size={20} fill="currentColor" /> Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex text-brandYellow">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.round(rating) ? "currentColor" : "none"}
                  className={i < Math.round(rating) ? "" : "text-blue-300"}
                />
              ))}
            </div>
            <p className="text-blue-100 font-medium">
              {rating.toFixed(1)}/5 rating • {reviewCount.toLocaleString()} pet
              owners
            </p>
          </div>
        </div>

        <div className="relative z-10 hidden md:block">
          <div className="bg-white p-4 rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
            <img
              src="https://images.unsplash.com/photo-1581562324420-eff2f5aaa4b5"
              alt="Happy Dog"
              className="rounded-2xl w-full h-[500px] object-cover bg-gray-200"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
