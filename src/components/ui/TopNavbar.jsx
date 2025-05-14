import { useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState();

  useEffect(() => {
    handleProfileData();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Even if the logout fails, we clear localStorage anyway
      localStorage.removeItem("auth_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("auth_token");
      navigate("/login");
    }
  };

  const handleProfileData = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  return (
    <div className="sticky top-0 w-full bg-white py-4 px-14 flex justify-end items-center z-10">
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-gray-100 bg-[#333] hover:text-white p-2 rounded"
        >
          <FiLogOut size={20} />
        </button>

        {"|"}

        {/* User Greeting */}
        <div className="flex items-center text-lg gap-4">
          <span>
            Hello, <strong>{userData?.name}</strong>
          </span>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="https://i.pravatar.cc/300" alt="avatar" />
          </div>
        </div>
      </div>
    </div>
  );
}
