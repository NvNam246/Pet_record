/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Star, MessageSquareHeart, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Blog = ({ onSubmitReview }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  // State lưu danh sách review lấy từ DB
  const [reviewsList, setReviewsList] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data.reviews);
        // Cập nhật lên App.jsx để đổi số sao trên phần Hero
        if (onSubmitReview) {
          onSubmitReview(data.average, data.total);
        }
      }
    } catch (error) {
      console.log("Error fetching reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petToken");

    // Yêu cầu đăng nhập trước khi đánh giá
    if (!token) {
      toast.error("Please log in to submit a review!");
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a star rating!");
      return;
    }

    const toastId = toast.loading("Submitting your review...");

    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Thank you for your valuable feedback!", { id: toastId });
        setRating(0);
        setHover(0);
        setName("");
        setComment("");
        fetchReviews(); // Tải lại danh sách
      } else {
        toast.error(data.message, { id: toastId }); // Báo lỗi nếu đã review rồi
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    }
  };

  return (
    <section id="blog" className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Pet Owners
          </h2>
          <p className="text-gray-500">
            See what our community says, and share your own experience!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* CỘT TRÁI: FORM ĐÁNH GIÁ */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-blue-100 sticky top-24">
            <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <MessageSquareHeart className="text-brandBlue" /> Leave a Review
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={starValue}
                        className={`transition-transform duration-200 hover:scale-110 focus:outline-none ${
                          starValue <= (hover || rating)
                            ? "text-brandYellow"
                            : "text-gray-200"
                        }`}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star
                          size={32}
                          fill={
                            starValue <= (hover || rating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Linh & Milo"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Experience
                </label>
                <textarea
                  rows="4"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did PetAware help you?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue outline-none transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="mt-2 bg-brandBlue text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Submit
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: DANH SÁCH REVIEW (GRID) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviewsList.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                Be the first one to leave a review!
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-brandBlue">
                        <UserCircle2 size={24} />
                      </div>
                      <h4 className="font-bold text-gray-900">{rev.name}</h4>
                    </div>
                    <div className="flex text-brandYellow">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? "currentColor" : "none"}
                          className={i < rev.rating ? "" : "text-gray-200"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-bold">
                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
