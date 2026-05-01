import React from "react";
import {
  Activity,
  Image as ImageIcon,
  FileText,
  Search,
  Bell,
} from "lucide-react";

const Features = () => {
  // 5 tính năng
  const features = [
    {
      icon: <Activity size={28} />,
      color: "bg-blue-100 text-blue-600",
      title: "Medical History Tracking",
      desc: "View a chronological timeline of visits, detailed diagnosis, treatments, and doctor's notes in one place.",
    },
    {
      icon: <ImageIcon size={28} />,
      color: "bg-green-100 text-green-600",
      title: "Digital Asset Management",
      desc: "Securely upload and store high-quality diagnostic images like X-rays and ultrasound scans.",
    },
    {
      icon: <FileText size={28} />,
      color: "bg-purple-100 text-purple-600",
      title: "Prescription Viewer",
      desc: "Access digital copies of past and current prescriptions instantly, saving you from keeping physical scattered copies.",
    },
    {
      icon: <Search size={28} />,
      color: "bg-yellow-100 text-yellow-600",
      title: "Smart Search & Filter",
      desc: "Quickly find specific records by date, disease name, or vaccination type with our intuitive search engine.",
    },
    {
      icon: <Bell size={28} />,
      color: "bg-red-100 text-red-600",
      title: "Vaccination Reminders",
      desc: "Get automated notifications for upcoming vaccination due dates. Never miss a critical shot for your pet.",
    },
  ];

  return (
    // ID "features" giúp thanh Navbar tìm thấy để trượt xuống
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Core Platform Features
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Everything you need to manage your pet's health records efficiently,
            eliminating the fragility of physical notebooks.
          </p>
        </div>

        {/* Lưới hiển thị: 3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {features.map((feature, index) => (
            <div
              key={index}
              // Dòng code dưới đây giúp 2 ô cuối cùng nằm căn giữa trên màn hình lớn (lg)
              className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 ${
                index === 3 ? "lg:col-start-1 lg:ml-auto lg:mr-[-50%]" : ""
              } ${
                index === 4 ? "lg:col-start-2 lg:ml-[50%] lg:mr-[-100%]" : ""
              }`}
              style={index >= 3 ? { maxWidth: "100%" } : {}}
            >
              <div
                className={`w-14 h-14 ${feature.color} rounded-full flex items-center justify-center mb-6 shadow-sm`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
