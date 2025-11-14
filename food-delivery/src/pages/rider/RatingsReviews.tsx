import React, { useState } from "react";
import {
  FaStar,
  FaArrowLeft,
  FaChartLine,
  FaUser,
  FaUtensils,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RatingsReviews = () => {
  const navigate = useNavigate();
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [customerRating, setCustomerRating] = useState(0);
  const [feedback, setFeedback] = useState("");
   
  const riderPerformance = {
    rating: 4.7,
    totalRatings: 128,
    breakdown: [50, 40, 25, 10, 3],
    recentReviews: [
      {
        id: 1,
        reviewer: "Customer A",
        rating: 5,
        comment: "Great service! Very punctual and polite.",
      },
      {
        id: 2,
        reviewer: "Customer B",
        rating: 4,
        comment: "Good delivery, but slightly late.",
      },
    ],
  };

  const handleRestaurantRating = (rating: number) => setRestaurantRating(rating);
  const handleCustomerRating = (rating: number) => setCustomerRating(rating);

  const submitFeedback = () => {
    alert("Thank you for your feedback!");
    setRestaurantRating(0);
    setCustomerRating(0);
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-red-200 to-orange-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full bg-white/90 backdrop-blur-md p-4 shadow-md flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-red-100 transition"
        >
          <FaArrowLeft className="text-xl text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Ratings & Reviews</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Reusable Card Component */}
        {[
          {
            title: "Rate the Restaurant",
            icon: <FaUtensils className="text-red-500 text-xl" />,
            rating: restaurantRating,
            handler: handleRestaurantRating,
          },
          {
            title: "Rate the Customer",
            icon: <FaUser className="text-red-500 text-xl" />,
            rating: customerRating,
            handler: handleCustomerRating,
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-5 border border-red-50 hover:shadow-xl transition"
          >
            <div className="flex items-center space-x-3 mb-4">
              {item.icon}
              <h2 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h2>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.2 }}
                  key={star}
                  onClick={() => item.handler(star)}
                  className={`text-3xl transition ${
                    star <= item.rating
                      ? "text-yellow-400 drop-shadow-md"
                      : "text-gray-300"
                  }`}
                >
                  <FaStar />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Feedback Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-5 border border-red-50 hover:shadow-xl transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Feedback
          </h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-300 outline-none transition text-gray-700"
            rows={4}
          />
          <button
            onClick={submitFeedback}
            className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:opacity-95 transition"
          >
            Submit Feedback
          </button>
        </motion.div>

        {/* Performance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-5 border border-red-50 hover:shadow-xl transition"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FaChartLine className="text-red-500 text-xl" />
            <h2 className="text-lg font-semibold text-gray-800">
              Your Performance
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-800">
              {riderPerformance.rating}
            </div>
            <div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-xl ${
                      star <= Math.floor(riderPerformance.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {riderPerformance.totalRatings} ratings
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star, index) => (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-sm w-8 text-gray-600">{star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${
                        (riderPerformance.breakdown[index] /
                          riderPerformance.totalRatings) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-5 border border-red-50 hover:shadow-xl transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Reviews
          </h2>
          <div className="space-y-4">
            {riderPerformance.recentReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-3 last:border-none"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800">{review.reviewer}</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-sm ${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RatingsReviews;
