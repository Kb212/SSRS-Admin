import { useEffect, useState } from "react";
import DynamicTable from "../ui/DynamicTable";
import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

function MenuItems() {
  const [menuitems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuItemsResponse = await fetch("http://127.0.0.1:8000/api/menuitems");
        const menuItemsData = await menuItemsResponse.json();

        setMenuItems(menuItemsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

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
    <section className="p-6 space-y-6">
      <div className="flex justify-between items-center pr-8">
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
      <DynamicTable columns={columns} data={data} />
    </section>
  );
}

export default MenuItems;
