import React, { useState, useEffect } from "react";
import { PawPrint, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const storedUser = localStorage.getItem("petUser");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleGetStarted = () => {
    setIsOpen(false);
    navigate("/auth");
  };

  const handleLogout = () => {
    localStorage.removeItem("petToken");
    localStorage.removeItem("petUser");
    setUser(null);
    setIsOpen(false);
    navigate("/");
  };

  const renderNavItem = (href, text, mobile = false) => {
    const baseClass = mobile
      ? "text-gray-600 font-medium py-2 w-full text-center block"
      : "hover:text-brandBlue transition";

    if (isHomePage) {
      return (
        <a href={href} className={baseClass} onClick={() => setIsOpen(false)}>
          {text}
        </a>
      );
    } else {
      return (
        <Link
          to={`/${href}`}
          className={baseClass}
          onClick={() => setIsOpen(false)}
        >
          {text}
        </Link>
      );
    }
  };

  return (
    <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 cursor-pointer z-50">
        <div className="bg-brandBlue p-2 rounded-full text-white">
          <PawPrint size={24} />
        </div>
        <span className="text-xl font-bold text-gray-800">PetAware</span>
      </Link>

      <div className="hidden lg:flex gap-8 text-gray-600 font-medium items-center">
        {renderNavItem("#features", "Features")}
        {renderNavItem("#how-it-works", "How It Works")}
        {renderNavItem("#blog", "Blog")}
        <Link to="/pricing" className="hover:text-brandBlue transition">
          Pricing
        </Link>
        {renderNavItem("#contact", "Contact")}
      </div>

      {/* --- DESKTOP MENU --- */}
      {user ? (
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {/* Nút Admin Desktop */}
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold hover:bg-purple-700 transition shadow-sm"
            >
              Admin Panel
            </Link>
          )}

          <div className="flex items-center gap-2 text-gray-700 font-semibold bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <UserIcon size={18} className="text-brandBlue" />
            <span>Hi, {user.name.split(" ")[0]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-full font-semibold hover:bg-red-100 transition border border-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleGetStarted}
          className="hidden lg:block bg-brandBlue text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 shrink-0"
        >
          Get Started Free
        </button>
      )}

      {/* NÚT MỞ MENU MOBILE */}
      <button
        className="lg:hidden text-gray-800 focus:outline-none z-50 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* --- MOBILE MENU --- */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 flex flex-col items-center lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[500px] py-6 opacity-100 visible"
            : "max-h-0 py-0 opacity-0 invisible"
        }`}
      >
        {renderNavItem("#features", "Features", true)}
        {renderNavItem("#how-it-works", "How It Works", true)}
        {renderNavItem("#blog", "Blog", true)}
        <Link
          to="/pricing"
          className="text-gray-600 font-medium py-2"
          onClick={() => setIsOpen(false)}
        >
          Pricing
        </Link>
        {renderNavItem("#contact", "Contact", true)}

        {/* NÚT MOBILE TÙY THEO TRẠNG THÁI ĐĂNG NHẬP */}
        {user ? (
          <div className="w-full flex flex-col items-center mt-4 border-t border-gray-100 pt-4 gap-3">
            {/* Nút Admin Mobile */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition w-3/4 text-center"
              >
                Admin Panel
              </Link>
            )}

            <p className="text-gray-700 font-bold">Logged in as {user.name}</p>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-8 py-3 rounded-full font-semibold w-3/4 flex justify-center items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleGetStarted}
            className="bg-brandBlue text-white px-8 py-3 rounded-full font-semibold w-3/4 mt-4"
          >
            Get Started Free
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
