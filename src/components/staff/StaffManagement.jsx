import { useState, useEffect } from "react";
import MessageModal from "../ui/MessageModal";
import {
  FiSearch,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiPlusCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    total_salary: "",
    overtime_rate: "",
  });

  const itemsPerPage = 6;
  const baseUrl = `${import.meta.env.VITE_BASE_URL}/api`;

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/admin/getStaff`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffMembers(data);
        setFilteredStaff(data);
      } else {
        console.error("Failed to fetch staff data");
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStaff(staffMembers);
    } else {
      const filtered = staffMembers.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, staffMembers]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh staff list
        await fetchStaff();

        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "",
          total_salary: "",
          overtime_rate: "",
        });

        // Show success message
        setModalMessage("Staff member added successfully!");
        setModalStatus(true);
        setTimeout(() => {
          setModalStatus(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        setModalMessage(errorData.message || "Failed to add staff member.");
        setModalStatus(false);
      }
    } catch (error) {
      console.error("Error adding staff member:", error);
      setModalMessage("An unexpected error occurred. Please try again.");
      setModalStatus(false);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="p-6 bg-gray-100 min-h-screen">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-gray-500">
              Your control panel for order management is here
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section */}
          <div className="w-full lg:w-2/3">
            {/* Action Buttons */}
            <div className="bg-white p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/staff/payroll" className="flex items-center justify-center gap-2 p-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                  <FiCreditCard className="h-5 w-5" />
                  <span className="font-medium">Payroll</span>
                </Link>
                <Link to="/staff/attendance" className="flex items-center justify-center gap-2 p-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                  <FiCalendar className="h-5 w-5" />
                  <span className="font-medium">Attendance</span>
                </Link>
                <Link to="/staff/create-shift" className="flex items-center justify-center gap-2 p-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                  <FiClock className="h-5 w-5" />
                  <span className="font-medium">Create Shift</span>
                </Link>
                <Link to="/staff/add-to-shift" className="flex items-center justify-center gap-2 p-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                  <FiPlusCircle className="h-5 w-5" />
                  <span className="font-medium">Add to Shift</span>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for staff members"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg animate-pulse"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : paginatedStaff.length > 0 ? (
                paginatedStaff.map((staff) => (
                  <div key={staff.id} className="bg-white p-4 rounded-lg flex">
                    <div className="mr-4">
                      <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            staff.name
                          )}&background=random`}
                          alt={staff.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Name: {staff.name}</div>
                      <div className="text-sm text-gray-600">
                        Role: {staff.role}
                      </div>
                      <div className="text-sm text-gray-600">
                        Salary:{" "}
                        {Number.parseFloat(staff.total_salary).toLocaleString()}{" "}
                        ETB
                      </div>
                      <div className="text-sm text-gray-600">
                        Overtime Rate: {staff.overtime_rate}x
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No staff members found
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredStaff.length > 0 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-md ${
                          currentPage === pageNumber
                            ? "bg-gray-200 font-medium"
                            : "border border-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Right Section - Add Staff Form */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Add Staff</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="role"
                    placeholder="Role"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="total_salary"
                    placeholder="Monthly Salary"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.total_salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="overtime_rate"
                    placeholder="Overtime Rate"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.overtime_rate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full p-2.5 rounded-md text-white transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {modalStatus !== null && (
        <MessageModal
          isItError={!modalStatus}
          message={modalMessage}
          closeMessageBackdrop={() => {
            setModalStatus(null);
            setModalMessage("");
          }}
        />
      )}
    </section>
  );
};

export default StaffManagement;
