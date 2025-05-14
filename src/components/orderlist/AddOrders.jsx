import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MessageModal from "../ui/MessageModal";

function AddOrders() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in"); // Default to dine-in
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState(null);
  const navigate = useNavigate();

  const customerIp = "0.0.0.0";
  const customerTempId = "adminPage";

  useEffect(() => {
    // Fetch menu items from the API
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/menuitems`);
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  // Group menu items by category_id
  const groupedMenuItems = menuItems.reduce((acc, menuItem) => {
    const category = menuItem.category_id;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menuItem);
    return acc;
  }, {});

  const handleMenuItemToggle = (menuItemId) => {
    setSelectedOrderItems((prev) => {
      const existingItem = prev.find(
        (item) => item.menu_item_id === menuItemId
      );

      if (existingItem) {
        // Remove the item if it already exists
        return prev.filter((item) => item.menu_item_id !== menuItemId);
      } else {
        // Add the item with a default quantity of 1
        return [...prev, { menu_item_id: menuItemId, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (menuItemId, quantity) => {
    setSelectedOrderItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === "remote") {
      setTableNumber(""); // Clear table number if order type is remote
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure all required fields are present
    if (
      (orderType === "dine-in" && !tableNumber) ||
      !customerIp ||
      !customerTempId ||
      selectedOrderItems.length === 0
    ) {
      setModalStatus(false);
      setModalMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const orderData = {
      table_number: orderType === "dine-in" ? tableNumber : null,
      order_items: selectedOrderItems,
      customer_ip: customerIp,
      customer_temp_id: customerTempId,
      order_type: orderType,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setModalStatus(true);
      setModalMessage(data.message || "Order placed successfully!");
      setTimeout(() => {
        navigate("/orderlist");
      }, 1000);
    } catch (error) {
      console.error("Error placing order:", error);
      setModalStatus(false);
      setModalMessage(error.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add Order</h1>
            <p className="text-gray-500">
              Create a new order by selecting menu items and specifying details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Table Number */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Table Number</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  placeholder={
                    orderType === "remote"
                      ? "Table number is only given for dine-in orders at order time!"
                      : "Enter table number"
                  }
                  disabled={orderType === "remote"} // Disable if order type is remote
                />
              </div>

              {/* Order Type */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Order Type</label>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["dine-in", "remote"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleOrderTypeChange(type)}
                      className={`px-3 py-1 border rounded-md ${
                        orderType === type
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Menu Items */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Menu Items</label>
                <div className="space-y-6 mt-4">
                  {Object.entries(groupedMenuItems).map(
                    ([categoryId, items]) => (
                      <div key={categoryId}>
                        {/* Category Header */}
                        <h2 className="text-lg font-bold mb-2">
                          {`${items[0]?.category.name}s` || `Category ${categoryId}`}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {items.map((menuItem) => (
                            <div
                              key={menuItem.id}
                              className="flex items-center gap-1"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleMenuItemToggle(menuItem.id)
                                }
                                className={`px-3 py-1 border rounded-md ${
                                  selectedOrderItems.some(
                                    (item) => item.menu_item_id === menuItem.id
                                  )
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-gray-800"
                                }`}
                              >
                                {menuItem.name}
                              </button>
                              {selectedOrderItems.some(
                                (item) => item.menu_item_id === menuItem.id
                              ) && (
                                <input
                                  type="number"
                                  value={
                                    selectedOrderItems.find(
                                      (item) =>
                                        item.menu_item_id === menuItem.id
                                    )?.quantity || ""
                                  }
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      menuItem.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Qty"
                                  className="w-16 h-8 p-1 border border-gray-300 rounded-md"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>

        {modalStatus !== null && (
          <MessageModal
            isItError={!modalStatus}
            message={modalMessage}
            closeMessageBackdrop={() => setModalStatus(null)}
          />
        )}
      </div>
    </section>
  );
}

export default AddOrders;
