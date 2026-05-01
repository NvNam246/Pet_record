import Review from "../models/Review.js";

// Khách hàng Gửi đánh giá
export const addReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    // KIỂM TRA: 1 người chỉ được 1 đánh giá
    const alreadyReviewed = await Review.findOne({ user: req.user._id });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already submitted a review. Thank you!" });
    }

    const review = await Review.create({
      user: req.user._id,
      name,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy danh sách đánh giá và Thống kê (Dành cho trang chủ, không cần đăng nhập)
export const getReviews = async (req, res) => {
  try {
    // Lấy 6 đánh giá mới nhất để hiển thị cho đẹp
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(6);

    const total = await Review.countDocuments();

    // Tính số sao trung bình bằng MongoDB Aggregate
    const agg = await Review.aggregate([
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);
    const average = agg.length > 0 ? Math.round(agg[0].average * 10) / 10 : 5.0;

    res.status(200).json({ reviews, total, average });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
