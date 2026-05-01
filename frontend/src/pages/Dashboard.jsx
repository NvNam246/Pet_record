import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Plus,
  Activity,
  Syringe,
  Pill,
  Weight,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Clock,
  Sparkles,
  Download, // 👉 Thêm icon Download cho nút Export
} from "lucide-react";
import AddPetModal from "../components/modals/AddPetModal";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("petUser");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const [pets, setPets] = useState([]);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [dynamicReminders, setDynamicReminders] = useState([]);

  const location = useLocation();
  const preSelectedPlan = location.state?.preSelectedPlan || "Free";

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("petToken");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("petUser", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const generateReminders = useCallback((petsList) => {
    let generated = [];

    petsList.forEach((pet) => {
      if (Array.isArray(pet.records) && pet.records.length > 0) {
        pet.records.forEach((record) => {
          const dateString = record.date
            ? record.date.split("T")[0]
            : new Date().toISOString().split("T")[0];
          const recordDate = new Date(dateString + "T00:00:00");
          let nextDueDate = new Date(recordDate);

          if (record.type === "Vaccine" || record.type === "Vaccination") {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            generated.push({
              title: `Upcoming Vaccine: ${record.diagnosis || "Vaccine"}`,
              pet: pet.name,
              dateObj: nextDueDate,
              dateStr: nextDueDate.toLocaleDateString("en-GB"),
              icon: <Syringe size={18} />,
              color: "bg-purple-100 text-purple-600",
            });
          } else if (record.type === "Medication") {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            generated.push({
              title: `Follow-up: ${record.diagnosis || "Medication"}`,
              pet: pet.name,
              dateObj: nextDueDate,
              dateStr: nextDueDate.toLocaleDateString("en-GB"),
              icon: <Pill size={18} />,
              color: "bg-blue-100 text-blue-600",
            });
          }
        });
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = generated
      .filter((r) => r.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 4);

    setDynamicReminders(upcoming);
  }, []);

  const fetchPets = useCallback(async () => {
    const token = localStorage.getItem("petToken");
    if (!token) return;

    try {
      const petRes = await fetch("http://localhost:5000/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (petRes.ok) {
        const petsData = await petRes.json();

        const petsWithRecords = await Promise.all(
          petsData.map(async (pet) => {
            try {
              const recRes = await fetch(
                `http://localhost:5000/api/records/pet/${pet._id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (recRes.ok) {
                pet.records = await recRes.json();
              } else {
                pet.records = [];
              }
            } catch (error) {
              console.log("Error fetching records for pet:", error);
              pet.records = [];
            }
            return pet;
          }),
        );

        setPets(petsWithRecords);
        generateReminders(petsWithRecords);
      } else {
        if (petRes.status === 401) {
          localStorage.removeItem("petToken");
          window.location.href = "/auth";
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [generateReminders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
    fetchPets();

    window.addEventListener("userUpdated", fetchUser);

    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("petUser") || "{}"));
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userUpdated", fetchUser);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchPets, fetchUser]);

  const handlePetAdded = (newPet) => {
    setPets([...pets, newPet]);
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to remove ${petName}?`)) return;

    const token = localStorage.getItem("petToken");
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPets(pets.filter((pet) => pet._id !== petId));
        toast.success(`${petName}'s profile has been removed.`);
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to connect to the server.");
    }
  };

  // 👉 HÀM XUẤT EXCEL CHO GÓI ENTERPRISE
  const handleExportCSV = () => {
    if (user.plan !== "Enterprise") {
      return toast.error("Only Enterprise users can bulk export data.");
    }

    let csvContent =
      "Pet Name,Breed,Age,Weight,Status,Total Records,Next Vaccine Date\n";

    pets.forEach((pet) => {
      let nextVaccine = "N/A";
      if (pet.records && pet.records.length > 0) {
        const vaccines = pet.records.filter(
          (r) => r.type === "Vaccine" || r.type === "Vaccination",
        );
        if (vaccines.length > 0) {
          const lastVacDate = new Date(vaccines[vaccines.length - 1].date);
          lastVacDate.setFullYear(lastVacDate.getFullYear() + 1);
          nextVaccine = lastVacDate.toLocaleDateString("en-GB");
        }
      }

      csvContent += `"${pet.name}","${pet.breed}","${pet.age}","${pet.weight}","${pet.status}","${pet.records?.length || 0}","${nextVaccine}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${user.name || "Enterprise"}_Pets_Data.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data exported successfully!");
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 relative">
      <AddPetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onPetAdded={handlePetAdded}
        defaultPlan={preSelectedPlan}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {user.name?.split(" ")[0] || "There"}! 👋
            {user.plan && user.plan !== "Free" && (
              <span className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-brandBlue text-white px-3 py-1 rounded-full font-bold shadow-sm">
                <Sparkles size={14} /> {user.plan}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your pets and view your clinic records.
          </p>
        </div>

        {/* 👉 VÙNG CHỨA NÚT EXPORT VÀ ADD PET */}
        <div className="flex flex-col sm:flex-row gap-3">
          {user.plan === "Enterprise" && (
            <button
              onClick={handleExportCSV}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold hover:bg-green-100 transition"
            >
              <Download size={20} /> Export Excel
            </button>
          )}

          <button
            onClick={() => setIsPetModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brandBlue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Add New Pet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-brandBlue" size={22} /> My Pets (
              {pets.length})
            </h2>
          </div>

          {pets.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
              <AlertCircle size={48} className="text-gray-300 mb-4" />
              <h4 className="text-lg font-bold text-gray-600 mb-2">
                No pets added yet
              </h4>
              <p className="text-gray-500 mb-6">
                Start building your digital pet health record by adding your
                first furry friend.
              </p>
              <button
                onClick={() => setIsPetModalOpen(true)}
                className="text-brandBlue font-bold hover:underline"
              >
                + Add your first pet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pets.map((pet) => (
                <div
                  key={pet._id}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    {pet.status === "verified" && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                    {pet.status === "pending" && (
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-100">
                        <Clock size={14} /> Pending Review
                      </span>
                    )}
                    {pet.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100">
                        <AlertCircle size={14} /> Rejected
                      </span>
                    )}

                    {pet.status !== "verified" && (
                      <button
                        onClick={() => handleDeletePet(pet._id, pet.name)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Remove Pet"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/pets/${pet._id}`}
                    className="flex items-center gap-4 mb-4 cursor-pointer block"
                  >
                    <img
                      src={pet.img}
                      alt={pet.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-gray-50"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-brandBlue transition">
                        {pet.name}
                      </h4>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                    </div>
                  </Link>

                  {pet.status === "rejected" && (
                    <p className="mb-4 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                      Reason: {pet.rejectReason}
                    </p>
                  )}

                  <div className="flex justify-between border-t border-gray-50 pt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                        Age
                      </p>
                      <p className="font-semibold text-gray-800">{pet.age}</p>
                    </div>
                    <div className="text-center border-l border-gray-100 pl-6">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1 justify-center">
                        <Weight size={12} /> Weight
                      </p>
                      <p className="font-semibold text-gray-800">
                        {pet.weight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-brandBlue" size={20} /> System Reminders
            </h3>

            <div className="space-y-4">
              {dynamicReminders.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No upcoming reminders.
                </p>
              ) : (
                dynamicReminders.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        For {item.pet} • {item.dateStr}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
