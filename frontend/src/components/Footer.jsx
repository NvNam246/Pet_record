import React from "react";
import {
  PawPrint,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#18181b] pt-20 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-8">
        {/* Phần 1: Các cột thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Cột 1: Logo & Thông tin */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-6 cursor-pointer"
            >
              <div className="bg-brandBlue p-2 rounded-full text-white">
                <PawPrint size={24} />
              </div>
              <span className="text-2xl font-bold text-white">PetAware</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed pr-8">
              Comprehensive pet health management platform helping pet owners
              track medications, veterinary visits, and wellness records for
              healthier, happier pets.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-gray-800 p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-brandBlue transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-brandBlue transition"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-brandBlue transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-brandBlue transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Cột 2: Product */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Product</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white transition"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-400 hover:text-white transition"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Support */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Community Forum
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Video Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Company */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="text-gray-400 hover:text-white transition"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Partners
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Investors
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Phần 2: Hộp Newsletter giống mẫu */}
        <div className="bg-[#27272a] rounded-3xl p-10 flex flex-col items-center text-center mb-16 border border-gray-700">
          <div className="bg-gray-800 p-4 rounded-2xl text-white mb-6">
            <Mail size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Stay Updated with Pet Health Tips
          </h3>
          <p className="text-gray-400 mb-8 max-w-xl">
            Get expert veterinary advice, health tips, and the latest updates
            about PetAware delivered straight to your inbox.
          </p>

          <form
            className="w-full max-w-2xl flex flex-col sm:flex-row gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Your full name"
              className="flex-1 bg-white text-gray-900 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brandBlue placeholder-gray-500"
            />
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white text-gray-900 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brandBlue placeholder-gray-500"
            />
          </form>
          <button className="w-full max-w-2xl mt-4 bg-transparent border border-gray-500 text-white hover:bg-gray-800 hover:border-gray-400 py-4 rounded-xl font-bold transition">
            Subscribe
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Join 1,200+ pet owners who trust our expert advice. Unsubscribe
            anytime.
          </p>
        </div>

        {/* Phần 3: Bản quyền & Links */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 PetAware. All rights reserved. Made with 🤍 for pet lovers
            worldwide.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition">
              Cookie Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition">
              GDPR
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
