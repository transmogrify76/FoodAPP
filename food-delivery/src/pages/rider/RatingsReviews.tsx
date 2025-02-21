import React, { useState } from 'react';
import { 
  FaStar, 
  FaSmile, 
  FaFrown, 
  FaArrowLeft,
  FaChartLine,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RatingsReviews = () => {
  const navigate = useNavigate();
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [customerRating, setCustomerRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const riderPerformance = {
    rating: 4.7,
    totalRatings: 128,
    breakdown: [5, 4, 3, 2, 1], 
    recentReviews: [
      {
        id: 1,
        reviewer: 'Customer A',
        rating: 5,
        comment: 'Great service! Very punctual and polite.'
      },
      {
        id: 2,
        reviewer: 'Customer B',
        rating: 4,
        comment: 'Good delivery, but slightly late.'
      }
    ]
  };

  const handleRestaurantRating = (rating: React.SetStateAction<number>) => {
    setRestaurantRating(rating);
  };

  const handleCustomerRating = (rating: React.SetStateAction<number>) => {
    setCustomerRating(rating);
  };

  const submitFeedback = () => {
    alert('Thank you for your feedback!');
    setRestaurantRating(0);
    setCustomerRating(0);
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 pb-16">

      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-red-50">
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Ratings & Reviews</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FaUtensils className="text-red-500 text-xl" />
            <h2 className="text-lg font-semibold">Rate the Restaurant</h2>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRestaurantRating(star)}
                className={`text-2xl ${
                  star <= restaurantRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <FaStar />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FaUser className="text-red-500 text-xl" />
            <h2 className="text-lg font-semibold">Rate the Customer</h2>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleCustomerRating(star)}
                className={`text-2xl ${
                  star <= customerRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <FaStar />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Additional Feedback</h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-2 border rounded-lg mb-4"
          />
          <button
            onClick={submitFeedback}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Submit Feedback
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FaChartLine className="text-red-500 text-xl" />
            <h2 className="text-lg font-semibold">Your Performance</h2>
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
                        ? 'text-yellow-400'
                        : 'text-gray-300'
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
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-sm w-8">{star} Star</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${(riderPerformance.breakdown[5 - star] / riderPerformance.totalRatings) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {riderPerformance.recentReviews.map((review) => (
              <div key={review.id} className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{review.reviewer}</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-sm ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsReviews;