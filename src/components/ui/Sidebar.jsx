import { useState, useEffect } from "react";
import {
  FaBars,
  FaUtensils,
  FaClipboardList,
  FaPen,
  FaTags,
  FaUsers,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Link } from "react-router-dom";
import { MdTableRestaurant } from "react-icons/md";

const menuItems = [
  { icon: <MdDashboard size={20} />, label: "Dashboard", link: "/" },
  {
    icon: <FaClipboardList size={20} />,
    label: "Order List",
    link: "orderlist",
  },
  { icon: <FaUtensils size={20} />, label: "Menu Items", link: "menuitems" },
  { icon: <MdTableRestaurant size={20} />, label: "Tables", link: "tables" },
  { icon: <FaPen size={20} />, label: "Feedbacks", link: "feedbacks" },
  {
    icon: <FaTags size={20} />,
    label: "Components",
    link: "components",
  },
  { icon: <FaUsers size={20} />, label: "Staff", link: "staff" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState();

  // Load selected index from localStorage on component mount
  useEffect(() => {
    const storedIndex = localStorage.getItem("selectedIndex");
    if (storedIndex) {
      setSelectedIndex(Number(storedIndex));
    }
  }, []);

  const handleMenuItemClick = (index) => {
    setSelectedIndex(index);
    localStorage.setItem("selectedIndex", index);
  };

  return (
    <div
      className={`sticky top-0 h-screen bg-white shadow-md flex flex-col ${
        collapsed ? "w-[3.8rem] px-0 py-8" : "w-64 p-4"
      } transition-all duration-300`}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div>
            <div className="text-2xl font-bold">Food</div>
            <div className="text-sm text-gray-400">Experience Comfort</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-8 flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <Link
            to={item.link}
            key={index}
            onClick={() => handleMenuItemClick(index)}
            className={`flex items-center gap-4 p-3 rounded-md mx-2 transition-all
              ${
                selectedIndex === index
                  ? "bg-[#333] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {item.icon}
            {!collapsed && (
              <span className="text-md font-bold">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
