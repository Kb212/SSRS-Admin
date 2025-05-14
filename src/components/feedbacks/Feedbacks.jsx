import { useState, useEffect } from "react";
import { FiSearch, FiCalendar } from "react-icons/fi";
import { format } from "date-fns";

function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // New state for date filter
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/feedbacks`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.customer_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      feedback.feedback_message
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesDate =
      !selectedDate || feedback.created_at.startsWith(selectedDate);

    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      formatted: format(date, "MMMM dd, yyyy"), // Example: May 13, 2025
      raw: date,
    };
  };

  return (
    <section className="p-6">
      <div className="bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Feedback</h1>
            <p className="text-gray-500">
              User's feedbacks can be seen in this page
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-[30rem]">
            <input
              type="text"
              placeholder="Search for feedbacks"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Date Filter */}
          <div className="relative w-full md:w-[15rem]">
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            Error: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,_minmax(25rem,_1fr))] gap-6">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((feedback) => {
                const date = formatDate(feedback.created_at);
                return (
                  <div
                    key={feedback.customer_name}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        {feedback.name || "Guest User"}
                      </h3>
                      <p className="text-sm text-gray-500">{date.formatted}</p>
                    </div>
                    <p className="text-gray-700">{feedback.feedback_message}</p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No feedbacks found. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Feedbacks;
