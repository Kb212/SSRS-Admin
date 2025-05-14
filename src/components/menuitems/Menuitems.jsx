import { useEffect, useState } from "react";
import DynamicTable from "../ui/DynamicTable";
import { FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ui/ConfirmationDialog";

function MenuItems() {
  const [menuitems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const menuItemsResponse = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/menuitems`
      );
      const menuItemsData = await menuItemsResponse.json();

      setMenuItems(menuItemsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
      console.error("Error fetching data:", err);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/menuitems/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setShowConfirmation(false);
        console.log(data);
        return;
      }

      setShowConfirmation(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      setShowConfirmation(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Define columns for the DynamicTable
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Description", accessor: "description" },
    { header: "Category", accessor: "category" },
    { header: "Price", accessor: "price" },
    { header: "Calories", accessor: "calorie" },
    { header: "Actions", accessor: "actions" },
  ];

  // Process the orders data to ensure we can access nested table data
  const data = menuitems.map((menuitem) => ({
    id: `#${menuitem.id}`,
    name: menuitem.name,
    description: menuitem.description,
    category: menuitem.category_id,
    price: menuitem.price,
    calorie: menuitem.total_calorie,
    actions: "delete",
  }));

  const handleRowClick = (id) => {
    navigate(`/menuitems/${id}`); // Navigate to the UpdateMenuItems page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading menu Items data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <section className="p-6">
      <div className="flex justify-between items-center pr-8 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-gray-500">
            Foods and drinks that are displayed on the customer menu are here
          </p>
        </div>
        <Link
          className="bg-[#333] w-10 h-10 flex justify-center items-center rounded-md cursor-pointer"
          to="add-menuitem"
        >
          <FaPlus className="text-white text-2xl" />
        </Link>
      </div>
      <DynamicTable
        columns={columns}
        data={data}
        onDelete={(id) => {
          setMenuItemToDelete(id); // Store the id of the menu item to delete
          setShowConfirmation(true); // Show the confirmation dialog
        }}
        onRowClick={handleRowClick} // Pass the row click handler
      />

      {showConfirmation && (
        <ConfirmationDialog
          message="Are you sure you want to delete This Menu Item?"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            deleteMenuItem(menuItemToDelete); // Pass the correct id
            setMenuItemToDelete(null); // Clear the state after deletion
          }}
        />
      )}
    </section>
  );
}

export default MenuItems;
