import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

const Contact = () => {
  // Trạng thái lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ở đây sau này bạn sẽ nối với Backend (Node.js) để gửi email thật
    toast.success(
      `Thank you, ${formData.name}! Your message has been sent successfully.`,
    );
    setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
  };

  return (
    // ID="contact" để Navbar cuộn xuống đúng chỗ
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Have questions about PetAware or need technical support? Our team is
            here to help you and your furry friends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {/* Cột trái: Thông tin liên hệ */}
          <div className="bg-brandBlue p-10 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-blue-100 mb-10 leading-relaxed">
                Fill up the form and our Team will get back to you within 24
                hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Call Us</p>
                    <p className="font-semibold">+48 729 370 787</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Email Us</p>
                    <p className="font-semibold">support@petaware.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Visit Us</p>
                    <p className="font-semibold">Rzeszow, Poland</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hình tròn trang trí cho đẹp */}
            <div className="relative h-32 mt-12 hidden md:block">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
              <div className="absolute right-10 bottom-10 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-lg opacity-50"></div>
            </div>
          </div>

          {/* Cột phải: Form nhập liệu */}
          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Linh Cute"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Linh@example.com"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 bg-brandBlue text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
