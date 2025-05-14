import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DynamicTable from "../ui/DynamicTable";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/orders`
        );
        const ordersData = await ordersResponse.json();

        const tablesResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/tables`
        );
        const tablesData = await tablesResponse.json();
        const sortedTables = Array.isArray(tablesData)
          ? tablesData.sort((a, b) => a.table_number - b.table_number)
          : [];

        setOrders(ordersData.orders);
        setTables(sortedTables);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.order_status === "completed"
  ).length;
  const canceledOrders = orders.filter(
    (order) => order.order_status === "canceled"
  ).length;
  const readyOrders = orders.filter(
    (order) => order.order_status === "ready"
  ).length;
  const processingOrders = orders.filter(
    (order) => order.order_status === "processing"
  ).length;
  const pendingOrders = orders.filter(
    (order) => order.order_status === "pending"
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date_time) - new Date(a.order_date_time))
    .slice(0, 3);

  const freeTables = tables.filter(
    (table) => table.table_status === "free"
  ).length;
  const occupiedTables = tables.filter(
    (table) => table.table_status !== "free"
  ).length;

  const generateWeeklySalesData = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const completedOrdersByDay = new Map();
    days.forEach((day) => completedOrdersByDay.set(day, 0));

    orders
      .filter((order) => order.order_status === "completed")
      .forEach((order) => {
        const date = new Date(order.order_date_time);
        const day = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
        const currentAmount = completedOrdersByDay.get(day) || 0;
        completedOrdersByDay.set(
          day,
          currentAmount + parseFloat(order.total_price)
        );
      });

    return days.map((day) => ({
      name: day.substring(0, 3),
      sales: completedOrdersByDay.get(day),
    }));
  };

  const weeklySalesData = generateWeeklySalesData();

  const completedVsTotal = [
    { name: "Completed", value: completedOrders },
    { name: "Other", value: totalOrders - completedOrders },
  ];

  const processingVsTotal = [
    { name: "Processing", value: processingOrders },
    { name: "Other", value: totalOrders - processingOrders },
  ];

  const readyVsTotal = [
    { name: "Ready", value: readyOrders },
    { name: "Other", value: totalOrders - readyOrders },
  ];

  const COLORS = {
    completed: ["#333333", "#e0e0e0"],
    processing: ["#f59e0b", "#fff3e0"],
    ready: ["#10b981", "#e6f7ef"],
  };

  // Define columns for the DynamicTable
  const columns = [
    { header: "Order ID", accessor: "id" },
    { header: "Table No", accessor: "table" },
    { header: "Total Price", accessor: "total_price" },
    { header: "Order Status", accessor: "order_status" },
  ];

  // Process the orders data to ensure we can access nested table data
  const data = recentOrders.map((order) => ({
    id: `#${order.id}`,
    table: order.table ? order.table.table_number : "N/A", // Handle missing table data
    total_price: parseFloat(order.total_price).toFixed(2), // Formatting total price
    order_status:
      order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1), // Capitalize the first letter
  }));

  const renderCustomLabel = ({ cx, cy, percent }) => {
    return (
      <text
        x={cx}
        y={cy}
        fill="#333"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Orders", count: totalOrders },
          { title: "Completed Orders", count: completedOrders },
          { title: "Canceled Orders", count: canceledOrders },
          { title: "Ready Orders", count: readyOrders },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow text-center"
          >
            <div className="text-5xl font-bold">{item.count}</div>
            <div className="mt-2 text-xl font-bold">{item.title}</div>
          </div>
        ))}
      </div>

      {/* Orders and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <DynamicTable columns={columns} data={data} paginate={false} />
        </div>

        {/* Tables Status */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4">Tables</h2>
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(4rem,_1fr))] gap-2">
              {tables.map((table) => (
                <div
                  key={table.table_number}
                  className={`flex items-center justify-center rounded-md text-md font-medium aspect-square w-16 h-16 ${
                    table.table_status === "free"
                      ? "bg-white border-2 border-[#333]"
                      : "bg-[#333] text-white"
                  }`}
                >
                  {table.table_number}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
              <span>Occupied ({occupiedTables})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
              <span>Free ({freeTables})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Charts */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Order Status</h2>
          <div className="flex flex-wrap justify-around h-64">
            {[completedVsTotal, processingVsTotal, readyVsTotal].map(
              (data, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={50}
                        dataKey="value"
                        label={renderCustomLabel} // Add custom label
                        labelLine={false} // Disable label lines
                      >
                        {data.map((entry, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={Object.values(COLORS)[idx][i]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">
                      {idx === 0
                        ? "Completed"
                        : idx === 1
                        ? "Processing"
                        : "Ready"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Weekly Sales</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ETB`, "Sales"]} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
