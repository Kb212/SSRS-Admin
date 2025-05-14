import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiRepeat,
  FiCheck,
} from "react-icons/fi";
import ShiftCalendarView from "./ShiftCalendarView";

const StaffShiftAssignment = () => {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    staff_id: "",
    shift_id: "",
    date: "",
    start_time: "",
    end_time: "",
    isRecurring: false,
    recurrenceType: "daily",
    weekdays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    endDate: "",
    overrideTime: false,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff and shifts in parallel
        const [staffResponse, shiftsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/admin/getStaff", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }),
          fetch("http://127.0.0.1:8000/api/shifts", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }),
        ]);

        if (staffResponse.ok && shiftsResponse.ok) {
          const staffData = await staffResponse.json();
          const shiftsData = await shiftsResponse.json();

          setStaff(staffData);
          setShifts(shiftsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name.startsWith("weekday-")) {
        const day = name.replace("weekday-", "");
        setFormData({
          ...formData,
          weekdays: {
            ...formData.weekdays,
            [day]: checked,
          },
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleShiftChange = (e) => {
    const shiftId = e.target.value;
    const selectedShift = shifts.find(
      (shift) => shift.id.toString() === shiftId
    );

    setFormData({
      ...formData,
      shift_id: shiftId,
      start_time: selectedShift ? selectedShift.start_time : "",
      end_time: selectedShift ? selectedShift.end_time : "",
    });
  };

  const generateDates = () => {
    const { date, endDate, recurrenceType, weekdays, isRecurring } = formData;

    if (!isRecurring) return [date];

    const dates = [];
    const start = new Date(date);
    const end = new Date(endDate);

    // Ensure valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [date];
    }

    const current = new Date(start);

    while (current <= end) {
      if (recurrenceType === "daily") {
        dates.push(formatDate(current));
      } else if (recurrenceType === "weekly") {
        // Use "long" for full weekday names
        const dayName = current
          .toLocaleDateString("en-US", {
            weekday: "long",
          })
          .toLowerCase(); // Convert to lowercase to match the keys in `weekdays`

        if (weekdays[dayName]) {
          dates.push(formatDate(current));
        }
      }

      // Move to the next day
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dates = generateDates();

    if (dates.length === 0) {
      alert(
        "No valid dates selected. Please check your date range and recurrence settings."
      );
      return;
    }

    try {
      setLoading(true);

      const basePayload = {
        staff_id: Number.parseInt(formData.staff_id),
        shift_id: Number.parseInt(formData.shift_id),
      };

      // Add override times if specified
      if (formData.overrideTime) {
        basePayload.start_time = formData.start_time;
        basePayload.end_time = formData.end_time;
      }

      // Create an array of promises for each date
      const assignmentPromises = dates.map((date) => {
        const payload = { ...basePayload, date };

        return fetch("http://127.0.0.1:8000/api/staff-shifts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(payload),
        });
      });

      // Execute all promises
      const results = await Promise.all(assignmentPromises);

      // Check if all requests were successful
      const allSuccessful = results.every((response) => response.ok);

      if (allSuccessful) {
        setSuccessMessage(
          `Successfully assigned shifts for ${dates.length} date(s)`
        );

        setReloadKey((prev) => prev + 1);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error assigning shifts:", error);
      alert("An error occurred while assigning shifts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && (staff.length === 0 || shifts.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <section className="p-6">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Staff Shift Assignment</h1>
            <p className="text-gray-500">
              Assign staff members to shifts they will work on!
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUsers className="inline mr-1" /> Staff Member
                  </label>
                  <select
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shift Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiClock className="inline mr-1" /> Shift Template
                  </label>
                  <select
                    name="shift_id"
                    value={formData.shift_id}
                    onChange={handleShiftChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                    required
                  >
                    <option value="">Select Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start_time} - {shift.end_time})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                    required
                  />
                </div>

                {/* Recurring Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#400] focus:ring-[#333] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isRecurring"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    <FiRepeat className="inline mr-1" /> Recurring Shift
                  </label>
                </div>

                {/* Recurring Options - Only show if recurring is checked */}
                {formData.isRecurring && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurrence Type
                      </label>
                      <select
                        name="recurrenceType"
                        value={formData.recurrenceType}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly (Select Days)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiCalendar className="inline mr-1" /> End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                        required={formData.isRecurring}
                      />
                    </div>

                    {/* Weekday Selection - Only show if recurrence type is weekly */}
                    {formData.recurrenceType === "weekly" && (
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Days of Week
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ].map((day) => (
                            <div
                              key={day}
                              className="flex flex-col items-center"
                            >
                              <label className="text-xs text-gray-500 capitalize mb-1">
                                {day.substring(0, 3)}
                              </label>
                              <input
                                type="checkbox"
                                id={`weekday-${day}`}
                                name={`weekday-${day}`}
                                checked={formData.weekdays[day]}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-[#444] focus:ring-[#333] border-gray-300 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Time Override Option */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="overrideTime"
                      name="overrideTime"
                      checked={formData.overrideTime}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#444] focus:ring-[#333] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="overrideTime"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Override Default Shift Times
                    </label>
                  </div>

                  {formData.overrideTime && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Start Time
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                          required={formData.overrideTime}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom End Time
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#333] focus:border-[#333]"
                          required={formData.overrideTime}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#333] hover:bg-[#444] text-white py-2 px-4 rounded-md flex items-center justify-center"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <FiCheck className="mr-2" /> Assign Shift
                      {formData.isRecurring ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <ShiftCalendarView reloadKey={reloadKey} />
    </>
  );
};

export default StaffShiftAssignment;
