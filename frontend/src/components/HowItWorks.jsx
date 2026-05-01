import React from "react";
import { FileBadge, ImagePlus, BellRing } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Digitize Your Pet's Health Journey
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Transition from fragile paper records to a secure, centralized
            digital repository in three simple steps.
          </p>
        </div>

        {/* Khung chứa Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Đường kẻ dọc ở giữa (Desktop) hoặc sát trái (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2 rounded-full"></div>

          {/* Bước 1: Bên Trái (Desktop) */}
          <div className="relative flex flex-col md:flex-row items-center mb-16 md:mb-24">
            <div className="hidden md:flex flex-1 justify-end pr-16 text-right">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  1. Create Pet Profiles
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Register your pets and input their basic information (Name,
                  Breed, Age, Weight). Eliminate the risk of losing physical
                  health books by securing their digital identity.
                </p>
              </div>
            </div>

            {/* Cục tròn Timeline */}
            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full border-4 border-white shadow-md z-10 text-white">
              <FileBadge size={20} />
            </div>

            {/* Nội dung Mobile (Hiện bên phải đường kẻ) */}
            <div className="md:hidden pl-20 w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Step 1: Pet Profiles
              </h3>
              <p className="text-gray-500 text-sm">
                Register your pets and input basic info to secure their digital
                identity.
              </p>
            </div>

            <div className="hidden md:block flex-1 pl-16">
              {/* Trang trí khoảng trống bên phải */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm inline-block">
                <span className="text-blue-500 font-semibold tracking-wider text-sm uppercase">
                  Step 1
                </span>
              </div>
            </div>
          </div>

          {/* Bước 2: Bên Phải (Desktop) */}
          <div className="relative flex flex-col md:flex-row items-center mb-16 md:mb-24">
            <div className="hidden md:block flex-1 pr-16 text-right">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm inline-block">
                <span className="text-green-600 font-semibold tracking-wider text-sm uppercase">
                  Step 2
                </span>
              </div>
            </div>

            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-md z-10 text-white">
              <ImagePlus size={20} />
            </div>

            <div className="pl-20 md:pl-16 w-full md:flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                <span className="md:hidden">Step 2: </span>Upload Medical Assets
              </h3>
              <p className="text-gray-500 md:leading-relaxed text-sm md:text-base">
                Securely store high-resolution X-ray films, ultrasound scans,
                and digital copies of past prescriptions. Keep all diagnostic
                images in one lightweight, accessible place.
              </p>
            </div>
          </div>

          {/* Bước 3: Bên Trái (Desktop) */}
          <div className="relative flex flex-col md:flex-row items-center">
            <div className="hidden md:flex flex-1 justify-end pr-16 text-right">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  3. Track History & Reminders
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  View a chronological timeline of vet visits. Get automated
                  notifications for upcoming vaccination due dates so you never
                  miss an important checkup.
                </p>
              </div>
            </div>

            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full border-4 border-white shadow-md z-10 text-white">
              <BellRing size={20} />
            </div>

            <div className="md:hidden pl-20 w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Step 3: Track & Remind
              </h3>
              <p className="text-gray-500 text-sm">
                View chronological visit timelines and get automated vaccination
                alerts.
              </p>
            </div>

            <div className="hidden md:block flex-1 pl-16">
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm inline-block">
                <span className="text-purple-600 font-semibold tracking-wider text-sm uppercase">
                  Step 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
