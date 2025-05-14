import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import MessageModal from "../ui/MessageModal";

function Attendance() {
  const [mode, setMode] = useState("clock_in"); // Default mode
  const [toleranceMinutes, setToleranceMinutes] = useState(15); // Default tolerance
  const [staffShifts, setStaffShifts] = useState([]);
  const [selectedStaffShiftId, setSelectedStaffShiftId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalStatus, setModalStatus] = useState(null); // Modal status
  const [scanning, setScanning] = useState(true); // Controls scan processing
  const [isScannerRunning, setIsScannerRunning] = useState(false); // Tracks scanner state
  const scannerRef = useRef(null); // Reference to the scanner instance
  const scanningRef = useRef(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader"); // Initialize the scanner
    scannerRef.current = scanner;

    return () => {
      // Stop and clear the scanner on unmount
      if (scanner && scanner.getState && scanner.getState() === "started") {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, shiftsRes, staffShiftsRes] = await Promise.all([
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
        fetch("http://127.0.0.1:8000/api/staff-shifts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }),
      ]);

      if (staffRes.ok && shiftsRes.ok && staffShiftsRes.ok) {
        const staffData = await staffRes.json();
        const shiftsData = await shiftsRes.json();
        const staffShiftsData = await staffShiftsRes.json();

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Filter staff shifts to include only today's shifts
        const todaysShifts = staffShiftsData.filter(
          (staffShift) => staffShift.date === today
        );

        // Combine data for dropdown options
        const combinedData = todaysShifts.map((staffShift) => {
          const staff = staffData.find((s) => s.id === staffShift.staff_id);
          const shift = shiftsData.find((s) => s.id === staffShift.shift_id);
          return {
            id: staffShift.id,
            label: `${staff?.name || "Unknown Staff"} - ${
              shift?.name || "Unknown Shift"
            } (${staffShift.start_time} - ${staffShift.end_time})`,
          };
        });

        setStaffShifts(combinedData);
      } else {
        throw new Error("Failed to fetch data for dropdown");
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startScanner = async () => {
    if (scannerRef.current && !isScannerRunning) {
      try {
        const cameras = await Html5Qrcode.getCameras(); // Get available cameras
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id; // Use the first available camera
          scannerRef.current
            .start(
              { deviceId: { exact: cameraId } }, // Use the selected camera
              { fps: 10, qrbox: 250 }, // Configuration options
              async (decodedText) => {
                if (!scanningRef.current) return;

                scanningRef.current = false;
                await handleScan(decodedText);

                // Cooldown period
                setTimeout(() => {
                  scanningRef.current = true;
                }, 2000);
              },
              (errorMessage) => {
                if (!errorMessage.includes("NotFoundException")) {
                  console.error("QR Code Scan Error:", errorMessage);
                }
              }
            )
            .then(() => {
              setIsScannerRunning(true); // Mark scanner as running
            })
            .catch((err) => console.error("Error starting scanner:", err));
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Error accessing cameras:", err);
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScannerRunning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScannerRunning(false); // Mark scanner as stopped
        })
        .catch((err) => console.error("Error stopping scanner:", err));
    }
  };

  const setModeAndRestartScanner = (newMode) => {
    if (scannerRef.current && isScannerRunning) {
      stopScanner(); // Stop the scanner before changing the mode
    }

    setMode(newMode); // Update the mode
  };

  const handleScan = async (staffId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            staff_id: staffId,
            staff_shift_id: selectedStaffShiftId,
            mode,
            tolerance_minutes: toleranceMinutes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Scan recorded successfully!");
        setError("");
        setModalStatus(true); // Show success modal
      } else {
        throw new Error(data.message || "Failed to record attendance.");
      }
    } catch (err) {
      console.error("Error recording attendance:", err);
      setMessage("");
      setError(err.message || "An unexpected error occurred.");
      setModalStatus(false); // Show error modal
    } finally {
      // Restart scanning after a 2-second breathing period
      setTimeout(() => {
        setScanning(true); // Re-enable scanning
        setModalStatus(null);
      }, 2000);
    }
  };

  return (
    <section className="p-6 bg-gray-100">
      <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Attendance</h1>
        <p className="text-gray-500 mb-6">
          Use the scanner to record attendance for staff.
        </p>

        {/* Mode Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Mode</label>
          <div className="flex gap-4">
            <button
              onClick={() => setModeAndRestartScanner("clock_in")}
              className={`px-4 py-2 rounded-md ${
                mode === "clock_in"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Clock In
            </button>
            <button
              onClick={() => setModeAndRestartScanner("clock_out")}
              className={`px-4 py-2 rounded-md ${
                mode === "clock_out"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Clock Out
            </button>
          </div>
        </div>

        {/* Tolerance Time */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Tolerance Time (minutes)
          </label>
          <input
            type="number"
            value={toleranceMinutes}
            onChange={(e) => {setToleranceMinutes(Number(e.target.value)); setModeAndRestartScanner(mode)}}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            min="0"
          />
        </div>

        {/* Scanner */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Scanner</label>
          <div id="reader" className="border border-gray-300 rounded-md"></div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Start Scanning
            </button>
            <button
              onClick={stopScanner}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Stop Scanning
            </button>
          </div>
        </div>

        {/* Message Modal */}
        {modalStatus !== null && (
          <MessageModal
            isItError={!modalStatus}
            message={modalStatus ? message : error}
            closeMessageBackdrop={() => {
              setModalStatus(null);
              setMessage("");
              setError("");
            }}
          />
        )}
      </div>
    </section>
  );
}

export default Attendance;
