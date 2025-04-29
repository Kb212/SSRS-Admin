import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/logout", {
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

  return (
    <div className="sticky top-0 w-full bg-white py-4 px-14 flex justify-end items-center">
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
        <div className="flex items-center gap-2">
          <span>
            Hello, <strong>Naod</strong>
          </span>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="https://i.pravatar.cc/300" alt="avatar" />
          </div>
        </div>
      </div>
    </div>
  );
}
