import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Syringe,
  Scissors,
  HeartPulse,
  FileText,
  Plus,
  ShieldCheck,
  Clock,
  X,
  Edit2,
  Shield,
  MessageSquare,
  Send,
  Download,
  Bot,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Gộp chung 1 Modal cho cả Add và Edit Record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // Mặc định là ngày hôm nay
    type: "Checkup",
    diagnosis: "",
    treatment: "",
    notes: "",
    internalNotes: "",
  });

  // State cho Owner's Journal
  const [ownerNotes, setOwnerNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // State cho AI
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("petUser") || "{}");
    setUser(storedUser);
    fetchData(storedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async (currentUser) => {
    setIsLoading(true);
    const token = localStorage.getItem("petToken");
    try {
      const isStaff =
        currentUser.role === "admin" || currentUser.role === "vet";
      const apiEndpoint = isStaff
        ? "http://localhost:5000/api/pets/admin/all"
        : "http://localhost:5000/api/pets";

      const petRes = await fetch(apiEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pets = await petRes.json();
      const currentPet = pets.find((p) => p._id === id);

      if (currentPet) {
        setPet(currentPet);
        if (currentPet.status === "pending" && !isStaff) {
          setRecords([]);
        } else {
          fetchMedicalRecords();
          fetchOwnerNotes();
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(`http://localhost:5000/api/records/pet/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setRecords(data);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  };

  const fetchOwnerNotes = async () => {
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(
        `http://localhost:5000/api/ownernotes/pet/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setOwnerNotes(await res.json());
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddOwnerNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch("http://localhost:5000/api/ownernotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pet_id: id, content: newNote }),
      });

      if (res.ok) {
        setNewNote("");
        fetchOwnerNotes();
        toast.success("Note added successfully!");
      } else {
        toast.error("Failed to add note.");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Connection error.");
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petToken");

    const url = isEditMode
      ? `http://localhost:5000/api/records/${editRecordId}`
      : "http://localhost:5000/api/records";
    const method = isEditMode ? "PUT" : "POST";

    const payload = { pet: id, ...formData };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchMedicalRecords();
        closeModal();
        toast.success(
          isEditMode
            ? "Medical record updated successfully!"
            : "Medical record added successfully!",
        );
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save the record due to a connection error.");
    }
  };

  const handleAskAI = async () => {
    if (user.plan === "Free" || user.plan === "Premium" || !user.plan) {
      return toast.error(
        <div className="flex flex-col gap-2">
          <b>Professional Feature!</b>
          <span className="text-sm">
            Upgrade to Professional to unlock AI Health Insights.
          </span>
          <button
            onClick={() => {
              toast.dismiss();
              navigate("/dashboard/pricing");
            }}
            className="mt-2 bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold w-max"
          >
            Go Pro
          </button>
        </div>,
        { duration: 5000 },
      );
    }

    setIsAiLoading(true);
    setAiResponse("");
    const token = localStorage.getItem("petToken");

    try {
      const res = await fetch("http://localhost:5000/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petName: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          symptoms: newNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.insight);
      } else {
        toast.error(`AI Error: ${data.message}`);
      }
    } catch (error) {
      console.error("AI Request Error:", error);
      toast.error("Failed to connect to AI server.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (user.plan === "Free" || !user.plan) {
      return toast.error(
        <div className="flex flex-col gap-2">
          <b>Premium Feature!</b>
          <span className="text-sm">
            Upgrade to Premium to export medical records to PDF.
          </span>
          <button
            onClick={() => {
              toast.dismiss();
              navigate("/dashboard/pricing");
            }}
            className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold w-max"
          >
            Upgrade Now
          </button>
        </div>,
        { duration: 5000 },
      );
    }

    const toastId = toast.loading("Generating medical document...");

    try {
      const element = document.getElementById("pdf-template");
      element.style.display = "block";
      element.style.position = "absolute";
      element.style.left = "-9999px";

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${pet.name}_Medical_Record.pdf`);

      element.style.display = "none";
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "Checkup",
      diagnosis: "",
      treatment: "",
      notes: "",
      internalNotes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setIsEditMode(true);
    setEditRecordId(record._id);
    setFormData({
      date: record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      type: record.type,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes || "",
      internalNotes: record.internalNotes || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const getIcon = (type) => {
    switch (type) {
      case "Vaccination":
        return <Syringe size={20} className="text-purple-500" />;
      case "Surgery":
        return <Scissors size={20} className="text-red-500" />;
      case "Emergency":
        return <HeartPulse size={20} className="text-red-600" />;
      default:
        return <Activity size={20} className="text-brandBlue" />;
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading pet details...
      </div>
    );
  if (!pet)
    return <div className="p-8 text-center text-gray-500">Pet not found.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <Link
        to={
          user.role === "admin" || user.role === "vet" ? "/admin" : "/dashboard"
        }
        className="inline-flex items-center gap-2 text-gray-500 hover:text-brandBlue transition font-medium"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      {/* --- INFO HEADER --- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <img
            src={pet.img}
            alt={pet.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {pet.name}
            </h1>
            {pet.status === "verified" ? (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                <ShieldCheck size={16} /> Verified Patient
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-sm font-bold border border-yellow-100">
                <Clock size={16} /> Pending Review
              </span>
            )}
            <p className="text-gray-500 font-medium mt-2">
              {pet.breed} • {pet.age}
            </p>
          </div>
        </div>

        {/* RIGHT CONTROLS: Huy hiệu Plan & Nút chức năng */}
        <div className="flex flex-col items-end gap-3">
          {/* HIỂN THỊ PLAN CỦA KHÁCH HÀNG (Chỉ Admin/Vet mới thấy) */}
          {(user.role === "admin" || user.role === "vet") && (
            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-right w-full sm:w-auto">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                Customer Plan
              </p>
              <p className="font-black text-brandBlue flex items-center justify-end gap-1">
                <Shield size={16} /> {pet.user?.plan || "Free"}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${
                user.plan === "Free" || !user.plan
                  ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white"
              }`}
            >
              <Download size={20} /> Export PDF
            </button>

            {(user.role === "admin" || user.role === "vet") &&
              pet.status === "verified" && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-brandBlue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  <Plus size={20} /> Add Record
                </button>
              )}
          </div>
        </div>
      </div>

      {/* --- CHIA CỘT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- CỘT TRÁI: MEDICAL HISTORY --- */}
        <div className="lg:col-span-2 relative">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="text-brandBlue" /> Medical History
          </h2>

          {pet.status === "pending" ? (
            <div className="bg-gray-50 p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-400">
                Information Restricted
              </h3>
              <p className="text-gray-400">
                Medical records are only available for verified profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {records.map((r) => (
                    <div
                      key={r._id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white bg-gray-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {getIcon(r.type)}
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition relative">
                        {(user.role === "admin" || user.role === "vet") && (
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(r)}
                              className="p-1.5 bg-blue-50 text-brandBlue hover:bg-brandBlue hover:text-white rounded-lg transition"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4 pr-10">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                              {new Date(r.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <h3 className="font-bold text-lg text-gray-900">
                              {r.type}
                            </h3>
                          </div>
                          <span className="bg-blue-50 text-brandBlue text-xs font-bold px-3 py-1 rounded-full">
                            {r.vet?.name || "Clinic Staff"}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700 block">
                              Diagnosis:
                            </span>
                            <p className="text-gray-600">{r.diagnosis}</p>
                          </div>
                          {r.treatment && (
                            <div>
                              <span className="font-semibold text-gray-700 block">
                                Treatment:
                              </span>
                              <p className="text-gray-600">{r.treatment}</p>
                            </div>
                          )}
                          {r.notes && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                              <span className="font-semibold text-brandBlue text-xs uppercase block mb-1">
                                Doctor's Note
                              </span>
                              <p className="text-blue-800">{r.notes}</p>
                            </div>
                          )}
                          {(user.role === "admin" || user.role === "vet") &&
                            r.internalNotes && (
                              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400 mt-3">
                                <span className="font-black text-amber-800 text-xs uppercase flex items-center gap-1 mb-1">
                                  <Shield size={12} /> Staff Secret Note
                                </span>
                                <p className="text-amber-700 italic text-xs">
                                  {r.internalNotes}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500 font-medium">
                    No medical records found for this pet yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: OWNER'S JOURNAL & AI --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="text-purple-500" /> Owner's Journal
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Track symptoms, diet, or behaviors. Ask AI for quick insights!
            </p>

            {user.role === "user" && pet.status === "verified" && (
              <div className="mb-6">
                <form onSubmit={handleAddOwnerNote} className="relative">
                  <textarea
                    required
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Describe symptoms... (e.g., Fluffy threw up)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none pr-24"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleAskAI}
                      disabled={isAiLoading || !newNote.trim()}
                      title="Ask AI for Insights"
                      className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200 transition shadow-sm disabled:opacity-50 flex items-center justify-center"
                    >
                      {isAiLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Bot size={16} />
                      )}
                    </button>
                    <button
                      type="submit"
                      title="Save to Journal"
                      className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition shadow-sm flex items-center justify-center"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>

                {aiResponse && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl relative animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => setAiResponse("")}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                    <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1 mb-2">
                      <Bot size={14} /> AI Health Insight
                    </h4>
                    <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {ownerNotes.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4 italic border border-dashed border-gray-200 rounded-xl">
                  No notes recorded yet.
                </p>
              ) : (
                ownerNotes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50"
                  >
                    <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                      {note.content}
                    </p>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      {new Date(note.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-brandBlue p-4 flex justify-between items-center text-white shrink-0">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Medical Record" : "New Medical Record"}
              </h2>
              <button
                onClick={closeModal}
                className="hover:bg-blue-600 p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSaveRecord}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {/* Thêm ô chọn ngày */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Visit Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                >
                  <option value="Checkup">General Checkup</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Diagnosis
                </label>
                <input
                  required
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Treatment
                </label>
                <textarea
                  rows="2"
                  value={formData.treatment}
                  onChange={(e) =>
                    setFormData({ ...formData, treatment: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Notes (Visible to Client)
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                ></textarea>
              </div>

              {(user.role === "admin" || user.role === "vet") && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <label className="block text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
                    <Shield size={16} /> Internal Notes (Staff Only)
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        internalNotes: e.target.value,
                      })
                    }
                    placeholder="E.g: Pet is aggressive, owner prefers cheap meds..."
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    rows="2"
                  />
                  <p className="text-[10px] text-amber-600 mt-1 italic">
                    * Customers will NOT see this note.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 mt-4 transition shadow-lg shadow-blue-500/30"
              >
                {isEditMode ? "Update Record" : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HIDDEN PDF TEMPLATE --- */}
      <div
        id="pdf-template"
        className="hidden bg-white w-[800px] p-12 text-gray-900 font-sans"
      >
        <div className="flex justify-between items-start border-b-2 border-brandBlue pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black text-brandBlue mb-1">
              {user.plan === "Enterprise"
                ? `${user.name} Care`
                : "PetAware Care"}
            </h1>
            <p className="text-gray-500 text-sm">Official Medical Record</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Document ID: PA-{pet._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 flex items-center gap-6">
          <img
            src={pet.img}
            alt={pet.name}
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
          />
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 flex-grow">
            <div>
              <span className="text-gray-500 text-xs uppercase font-bold">
                Patient Name
              </span>
              <p className="font-black text-xl">{pet.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase font-bold">
                Owner
              </span>
              <p className="font-bold">{pet.user?.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase font-bold">
                Breed
              </span>
              <p className="font-medium">{pet.breed}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase font-bold">
                Age & Weight
              </span>
              <p className="font-medium">
                {pet.age} • {pet.weight}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wider">
          Medical History
        </h2>
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-brandBlue text-white">
              <th className="p-3 font-bold text-sm">Date</th>
              <th className="p-3 font-bold text-sm">Visit Type</th>
              <th className="p-3 font-bold text-sm">Diagnosis / Details</th>
              <th className="p-3 font-bold text-sm">Attending Vet</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-500 border border-gray-200"
                >
                  No medical records found.
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr
                  key={r._id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3 border border-gray-200 text-sm whitespace-nowrap align-top">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 border border-gray-200 text-sm font-bold align-top">
                    {r.type}
                  </td>
                  <td className="p-3 border border-gray-200 text-sm align-top">
                    <p className="font-semibold text-gray-800">{r.diagnosis}</p>
                    {r.treatment && (
                      <p className="text-gray-600 mt-1">Tr: {r.treatment}</p>
                    )}
                  </td>
                  <td className="p-3 border border-gray-200 text-sm text-gray-500 align-top">
                    {r.vet?.name || "Clinic Staff"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-16 border-t border-gray-200 pt-6 flex justify-between items-end">
          {/* Gói Enterprise sẽ KHÔNG có dòng quảng cáo này */}
          {user.plan !== "Enterprise" ? (
            <p className="text-xs text-gray-400">
              This document is electronically generated by PetAware SaaS.
              <br />
              Not valid for legal prescriptions without a vet's physical
              signature.
            </p>
          ) : (
            <p className="text-xs text-gray-400">Internal Medical Document.</p>
          )}
          <div className="text-center">
            <div className="w-48 h-px bg-gray-300 mb-2"></div>
            <p className="text-sm font-bold text-gray-800">
              Veterinarian Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
