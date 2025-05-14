import React, { useState, useEffect } from "react";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import { FaTrash } from "react-icons/fa6";
import MessageModal from "../ui/MessageModal";

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  // Form states
  const [bulkAddForm, setBulkAddForm] = useState({
    startTableNumber: "",
    endTableNumber: "",
    baseLink: "",
  });

  const [singleAddForm, setSingleAddForm] = useState({
    tableNumber: "",
    baseLink: "",
  });

  const [bulkDeleteForm, setBulkDeleteForm] = useState({
    startTableNumber: "",
    endTableNumber: "",
  });

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch all tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch all tables
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const sortedTables = Array.isArray(data)
        ? data.sort((a, b) => a.table_number - b.table_number)
        : [];
      setTables(sortedTables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      setError("Failed to load tables. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add tables in amount
  const addSingleTable = async (e) => {
    e.preventDefault();
    if (!singleAddForm.tableNumber) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: parseInt(singleAddForm.tableNumber),
          base_link: singleAddForm.baseLink,
          table_status: "free",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setModalStatus(false);
        setModalMessage(
          data.message || "Failed to add table. Please try again."
        );
        return;
      }

      // Reset form and refresh tables
      setSingleAddForm({
        tableNumber: "",
        baseLink: "",
      });
      fetchTables();
    } catch (error) {
      console.error("Error adding table:", error);
      setModalStatus(false);
      setModalMessage("An unexpected error occurred. Please try again.");
    }
  };

  // Add tables in Range
  const addBulkTables = async (e) => {
    e.preventDefault();
    if (!bulkAddForm.startTableNumber || !bulkAddForm.endTableNumber) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tables/range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_table_number: parseInt(bulkAddForm.startTableNumber),
          end_table_number: parseInt(bulkAddForm.endTableNumber),
          base_link: bulkAddForm.baseLink,
          table_status: "free",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setModalStatus(false);
        setModalMessage(
          data.message || "Failed to add tables in range. Please try again."
        );
        return;
      }

      // Reset form and refresh tables
      setBulkAddForm({
        startTableNumber: "",
        endTableNumber: "",
        baseLink: "",
      });
      fetchTables();
    } catch (error) {
      console.error("Error adding tables in range:", error);
      setModalStatus(false);
      setModalMessage("An unexpected error occurred. Please try again.");
    }
  };

  // Delete a single table
  const deleteSingleTable = async (tableNumber) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tables/${tableNumber}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setModalStatus(false);
        setModalMessage(
          data.message || "Failed to the table. Please try again."
        );
        return;
      }

      fetchTables();
    } catch (error) {
      console.error("Error deleting the table:", error);
      setModalStatus(false);
      setModalMessage("An unexpected error occurred. Please try again.");
    }
  };

  // Delete table in range
  const deleteBulkTables = async (e) => {
    e.preventDefault();
    if (!bulkDeleteForm.startTableNumber || !bulkDeleteForm.endTableNumber)
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tables/batch`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_table_number: parseInt(bulkDeleteForm.startTableNumber),
          end_table_number: parseInt(bulkDeleteForm.endTableNumber),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setModalStatus(false);
        setModalMessage(
          data.message || "Failed to delete tables in range. Please try again."
        );
        return;
      }

      // Reset form and refresh tables
      setBulkDeleteForm({
        startTableNumber: "",
        endTableNumber: "",
      });
      fetchTables();
    } catch (error) {
      console.error("Error deleting tables in range:", error);
      setModalStatus(false);
      setModalMessage("An unexpected error occurred. Please try again.");
    }
  };

  // Delete all tables
  const deleteAllTables = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables/all`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setModalStatus(false);
        setModalMessage(
          data.message || "Failed to delete all tables. Please try again."
        );
        return;
      }

      // Close confirmation dialog and refresh tables
      setShowConfirmation(false);
      fetchTables();
    } catch (error) {
      console.error("Error deleting all tables:", error);
      setModalStatus(false);
      setModalMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tables</h1>
            <p className="text-gray-500">
              Handle the tables in your restaurant in this page
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmation(true)}
              className="px-4 py-2 bg-[#333] text-white rounded-md"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tables Grid */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 max-h-[42rem] overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(5rem,_1fr))] gap-4 relative">
              {tables.length === 0 && <p className="absolute text-center w-full">No Tables Available!<br />You can add them here using the input fields!</p>}
              {tables.map((table) => (
                <div
                  key={table.table_number}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-md ${
                    table.table_status === "occupied"
                      ? "bg-[#333] text-white"
                      : "border-2 border-[#333] text-[#333]"
                  }`}
                >
                  <span className="font-bold">{table.table_number}</span>
                  <button
                    onClick={() => deleteSingleTable(table.table_number)}
                    disabled={table.table_status === "occupied"}
                    className={`${
                      table.table_status === "occupied"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-red-500"
                    }`}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="flex flex-col gap-6 md:w-1/2 lg:w-2/5">
            {/* Add Tables in Bulk */}
            <div className="bg-[#333] px-8 py-6 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-4">
                Add Tables In Range
              </h2>
              <form onSubmit={addBulkTables} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Starting Table Number (inclusive)"
                      value={bulkAddForm.startTableNumber}
                      onChange={(e) =>
                        setBulkAddForm({
                          ...bulkAddForm,
                          startTableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Ending Table Number (inclusive)"
                      value={bulkAddForm.endTableNumber}
                      onChange={(e) =>
                        setBulkAddForm({
                          ...bulkAddForm,
                          endTableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder='Base link with a "/" at the end'
                    value={bulkAddForm.baseLink}
                    onChange={(e) =>
                      setBulkAddForm({
                        ...bulkAddForm,
                        baseLink: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-md text-black"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Add a Single Table */}
            <div className="bg-[#333] p-6 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-4">
                Add a Table or In Bulk
              </h2>
              <form onSubmit={addSingleTable} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Table Amount You Want to Add"
                      value={singleAddForm.tableNumber}
                      onChange={(e) =>
                        setSingleAddForm({
                          ...singleAddForm,
                          tableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder='Base link with a "/" at the end'
                      value={singleAddForm.baseLink}
                      onChange={(e) =>
                        setSingleAddForm({
                          ...singleAddForm,
                          baseLink: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Delete table in range */}
            <div className="bg-[#333] p-6 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-4">
                Delete Tables In Range
              </h2>
              <form onSubmit={deleteBulkTables} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Starting Table Number (inclusive)"
                      value={bulkDeleteForm.startTableNumber}
                      onChange={(e) =>
                        setBulkDeleteForm({
                          ...bulkDeleteForm,
                          startTableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Ending Table Number (inclusive)"
                      value={bulkDeleteForm.endTableNumber}
                      onChange={(e) =>
                        setBulkDeleteForm({
                          ...bulkDeleteForm,
                          endTableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-md text-black"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationDialog
          message={
            <>
              Are you sure you want to delete every table?
              <br />
              The tables will be <span className="text-red-600">deleted even if</span> they are <span className="text-red-600">occupied</span>!
            </>
          }
          onCancel={() => setShowConfirmation(false)}
          onConfirm={deleteAllTables}
          isLoading={isDeleting}
        />
      )}

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

export default Tables;
