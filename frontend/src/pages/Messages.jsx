/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  X,
  Send,
  AlertCircle,
  ChevronRight,
  Shield,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [tickets, setTickets] = useState([]);
  const [pets, setPets] = useState([]); // Dành cho dropdown chọn thú cưng
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // Dùng cho cả View và Reply
  const [replyText, setReplyText] = useState("");

  const [formData, setFormData] = useState({
    petId: "",
    title: "",
    message: "",
  });
  const [filter, setFilter] = useState("All"); // All | Pending | Answered

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("petToken");
    const currentUser = JSON.parse(localStorage.getItem("petUser") || "{}");
    setUser(currentUser);

    try {
      // 1. Lấy danh sách Tickets
      const ticketRes = await fetch("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ticketRes.ok) {
        setTickets(await ticketRes.json());
      }

      // 2. Nếu là User, lấy danh sách Pets để cho vào thẻ Select lúc tạo Ticket
      if (currentUser.role === "user") {
        const petRes = await fetch("http://localhost:5000/api/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (petRes.ok) {
          const petsData = await petRes.json();
          setPets(petsData);
          if (petsData.length > 0) {
            setFormData((prev) => ({ ...prev, petId: petsData[0]._id }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tickets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Khách tạo Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (user.plan === "Free" || !user.plan) {
      setIsCreateOpen(false);
      return toast.error(
        <div className="flex flex-col gap-2">
          <b>Premium Feature!</b>
          <span className="text-sm">Upgrade to ask our vets directly.</span>
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

    const toastId = toast.loading("Sending ticket...");
    try {
      const token = localStorage.getItem("petToken");
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Ticket sent successfully!", { id: toastId });
        setIsCreateOpen(false);
        setFormData({ ...formData, title: "", message: "" });
        fetchData(); // Reload danh sách
      } else {
        // Backend chặn (VD: Premium hết lượt)
        toast.error(data.message, { id: toastId, duration: 5000 });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    }
  };

  // Vet trả lời Ticket
  const handleReplyTicket = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending reply...");
    try {
      const token = localStorage.getItem("petToken");
      const res = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply: replyText }),
        },
      );

      if (res.ok) {
        toast.success("Reply sent!", { id: toastId });
        setSelectedTicket(null);
        setReplyText("");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    }
  };

  const filteredTickets =
    filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading tickets...</div>
    );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-brandBlue" /> Ask a Vet
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === "user"
              ? "Consult with our veterinary professionals."
              : "Respond to customer inquiries."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brandBlue text-sm font-medium text-gray-700"
          >
            <option value="All">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="Answered">Answered</option>
          </select>
          {user.role === "user" && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-brandBlue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Ticket
            </button>
          )}
        </div>
      </div>

      {/* TICKETS LIST */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center">
            <MessageSquare size={48} className="text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">
              No tickets found
            </h3>
            <p className="text-gray-400 text-sm">
              When you ask a question, it will appear here.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={ticket.pet?.img || "https://via.placeholder.com/150"}
                  alt="pet"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-50 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">
                      {ticket.title}
                    </span>
                    {ticket.status === "Pending" ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-100">
                        <Clock size={10} /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle size={10} /> Answered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {ticket.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    For <b>{ticket.pet?.name}</b> •{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                    {user.role !== "user" && ` • Owner: ${ticket.user?.name}`}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-gray-400 group-hover:text-brandBlue transition">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL (Chỉ User) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-brandBlue p-4 flex justify-between items-center text-white">
              <h2 className="font-bold flex items-center gap-2">
                <MessageSquare size={18} /> New Consultation Ticket
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="hover:bg-blue-600 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {pets.length === 0 ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  <p>
                    You need to add a pet in your Dashboard before asking a
                    question.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Select Pet
                    </label>
                    <select
                      required
                      value={formData.petId}
                      onChange={(e) =>
                        setFormData({ ...formData, petId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue bg-gray-50"
                    >
                      {pets.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="E.g., Eye infection concern"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Detailed Message
                    </label>
                    <textarea
                      required
                      rows="4"
                      placeholder="Describe the symptoms or ask your question..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brandBlue resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                  >
                    <Send size={18} /> Submit Ticket
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Premium: 1/month • Professional: Unlimited
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* VIEW & REPLY MODAL (Chung cho User và Vet) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedTicket.status === "Pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-green-50 text-green-600 border-green-200"}`}
                >
                  {selectedTicket.status}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-800 p-1.5 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Info Header */}
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <img
                  src={selectedTicket.pet?.img}
                  alt="pet"
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                    Patient Info
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedTicket.pet?.name}
                  </p>
                </div>
                {(user.role === "admin" || user.role === "vet") && (
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                      Owner
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-1">
                      <Shield size={14} className="text-brandBlue" />{" "}
                      {selectedTicket.user?.name} ({selectedTicket.user?.plan})
                    </p>
                  </div>
                )}
              </div>

              {/* Message Khách */}
              <div>
                <h3 className="font-black text-xl text-gray-800 mb-2">
                  {selectedTicket.title}
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border border-gray-100">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Reply Bác sĩ */}
              {selectedTicket.status === "Answered" ? (
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl relative">
                  <div className="absolute -top-3 left-6 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck size={12} /> Vet's Response
                  </div>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mt-2">
                    {selectedTicket.reply}
                  </p>
                  <p className="text-xs font-medium text-indigo-500 mt-4 text-right">
                    — Dr. {selectedTicket.repliedBy?.name || "Staff"}
                  </p>
                </div>
              ) : /* Form nhập cho Vet nếu chưa trả lời */
              user.role === "admin" || user.role === "vet" ? (
                <form
                  onSubmit={handleReplyTicket}
                  className="border-t border-gray-100 pt-6 mt-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-brandBlue">
                    Your Professional Reply
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your advice or instructions here..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brandBlue text-sm resize-none mb-3"
                  />
                  <button
                    type="submit"
                    className="w-full bg-brandBlue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Send Reply
                  </button>
                </form>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Our veterinary team is reviewing your ticket and will reply
                    shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
