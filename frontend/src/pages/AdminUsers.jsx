import React, { useState, useEffect } from "react";
// 1. Thêm icon Trash2
import { Users, Shield, User, Stethoscope, Trash2 } from "lucide-react";
// 2. Import react-hot-toast
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy ID của Admin đang đăng nhập để ẩn nút xóa của chính họ trên UI
  const currentUser = JSON.parse(localStorage.getItem("petUser") || "{}");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole, newRole) => {
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`,
      )
    )
      return;

    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (res.ok) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
        toast.success(`User role updated to ${newRole}!`); // Dùng toast thay alert
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error.");
    }
  };

  // 3. HÀM XỬ LÝ XÓA USER
  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to completely remove ${userName}'s account? This action cannot be undone.`,
      )
    )
      return;

    const token = localStorage.getItem("petToken");
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        toast.success(`${userName}'s account has been deleted.`);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection error while deleting user.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-brandBlue p-3 rounded-xl text-white">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Promote staff members and manage clinic access.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>

                  <td className="p-4">
                    {u.role === "admin" && (
                      <span className="flex items-center gap-1 w-max bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                        <Shield size={14} /> Admin
                      </span>
                    )}
                    {u.role === "vet" && (
                      <span className="flex items-center gap-1 w-max bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        <Stethoscope size={14} /> Vet / Staff
                      </span>
                    )}
                    {u.role === "user" && (
                      <span className="flex items-center gap-1 w-max bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        <User size={14} /> Client
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* CÁC NÚT PROMOTE / DEMOTE */}
                      {u.role !== "admin" ? (
                        <>
                          {u.role === "user" && (
                            <button
                              onClick={() =>
                                handleRoleChange(u._id, u.role, "vet")
                              }
                              className="bg-brandBlue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                            >
                              Promote to Vet
                            </button>
                          )}
                          {u.role === "vet" && (
                            <button
                              onClick={() =>
                                handleRoleChange(u._id, u.role, "user")
                              }
                              className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 transition"
                            >
                              Revoke Vet
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm italic mr-2">
                          Protected
                        </span>
                      )}

                      {/* 4. NÚT XÓA (Chỉ hiện nếu không phải tài khoản đang đăng nhập) */}
                      {u._id !== currentUser._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
