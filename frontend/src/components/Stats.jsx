import React from "react";
import { Users, FileText, Stethoscope, CheckCircle } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: <Users size={32} className="text-white" />,
      bg: "bg-blue-600",
      label: "Happy Pet Owners",
      value: "Many",
      subtext: "Trusted community",
    },
    {
      icon: <FileText size={32} className="text-white" />,
      bg: "bg-green-600",
      label: "Health Records Tracked",
      value: "Millions",
      subtext: "Data secured",
    },
    {
      icon: <Stethoscope size={32} className="text-white" />,
      bg: "bg-purple-600",
      label: "Veterinary Partners",
      value: "Hundreds",
      subtext: "Professional network",
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      bg: "bg-yellow-500",
      label: "Uptime Reliability",
      value: "High",
      subtext: "Always available",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Pet Owners Worldwide
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Join thousands of pet owners who have transformed their pet care
            with PetHealhRecord.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:transform hover:-translate-y-1 transition duration-300"
            >
              <div className={`${stat.bg} p-4 rounded-full mb-6 shadow-md`}>
                {stat.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-sm text-gray-400">{stat.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
