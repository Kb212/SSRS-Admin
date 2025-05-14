import { useEffect, useState } from "react";
import DynamicTable from "../ui/DynamicTable";
import { FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ui/ConfirmationDialog";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderToDelete, setorderToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const ordersResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders`);
      const ordersData = await ordersResponse.json();

      setOrders(ordersData.orders);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
      console.error("Error fetching data:", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setShowConfirmation(false);
        console.log(data);
        return;
      }

      setShowConfirmation(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting order:", error);
      setShowConfirmation(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recentOrders = [...orders].sort(
    (a, b) => new Date(b.order_date_time) - new Date(a.order_date_time)
  );

  // Define columns for the DynamicTable
  const columns = [
    { header: "Order ID", accessor: "id" },
    { header: "Table No", accessor: "table" },
    { header: "Order Date and Time", accessor: "order_date" },
    { header: "Order Location", accessor: "order_location" },
    { header: "Total Price", accessor: "total_price" },
    { header: "Order Status", accessor: "order_status" },
    { header: "Payment Status", accessor: "payment_status" },
    { header: "Actions", accessor: "actions" },
  ];

  // Process the orders data to ensure we can access nested table data
  const data = recentOrders.map((order) => ({
    id: `#${order.id}`,
    table: order.table ? order.table.table_number : "waiting",
    order_date: order.order_date_time,
    order_location: order.order_type,
    total_price: parseFloat(order.total_price).toFixed(2),
    order_status:
      order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1),
    payment_status:
      order.payment_status.charAt(0).toUpperCase() +
      order.payment_status.slice(1),
    actions: "delete",
  }));

  const handleRowClick = (id) => {
    navigate(`/orders/${id}`); // Navigate to the UpdateMenuItems page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading order data...
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
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-gray-500">This is the order data you have</p>
        </div>
        <Link
          className="bg-[#333] w-10 h-10 flex justify-center items-center rounded-md cursor-pointer"
          to="add-order"
        >
          <FaPlus className="text-white text-2xl" />
        </Link>
      </div>
      <DynamicTable
        columns={columns}
        data={data}
        rowsPerPage={6}
        onDelete={(id) => {
          setorderToDelete(id); // Store the id of the menu item to delete
          setShowConfirmation(true); // Show the confirmation dialog
        }}
        onRowClick={handleRowClick}
      />

      {showConfirmation && (
        <ConfirmationDialog
          message="Are you sure you want to delete This Order?"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            deleteOrder(orderToDelete); // Pass the correct id
            setMenuItemToDelete(null); // Clear the state after deletion
          }}
        />
      )}
    </section>
  );
}

export default OrderList;
