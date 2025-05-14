import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MessageModal from "../ui/MessageModal";

function UpdateOrder() {
  const { orderid } = useParams(); // Get order ID from URL
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState(null);

  useEffect(() => {
    // Fetch order details and menu items
    const fetchData = async () => {
      try {
        const [menuItemsRes, orderRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BASE_URL}/api/menuitems`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/${orderid}`),
        ]);

        const menuItemsData = await menuItemsRes.json();
        const orderData = await orderRes.json();

        setMenuItems(menuItemsData);
        setOrderStatus(orderData.order.order_status);
        setSelectedOrderItems(
          orderData.order.order_items.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [orderid]);

  const handleMenuItemToggle = (menuItemId) => {
    if (orderStatus !== "pending") return; // Disable if order is not pending

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
    if (orderStatus !== "pending") return; // Disable if order is not pending

    setSelectedOrderItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (orderStatus !== "pending") {
      setModalStatus(false);
      setModalMessage("Order cannot be updated as it is not pending.");
      setLoading(false);
      return;
    }

    const orderData = {
      order_items: selectedOrderItems,
    };

    console.log("Order Data to Submit:", orderData); // Debugging log

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/orders/${orderid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setModalStatus(true);
      setModalMessage(data.message || "Order updated successfully!");
      setTimeout(() => {
        navigate("/orderlist");
      }, 1000);
    } catch (error) {
      console.error("Error updating order:", error);
      setModalStatus(false);
      setModalMessage(error.message || "Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Update Order</h1>
            <p className="text-gray-500">
              Update the menu items for the order here.
            </p>
          </div>
          <p
            className={`${
              orderStatus === "pending"
                ? "bg-gray-500"
                : orderStatus === "processing"
                ? "bg-yellow-500"
                : orderStatus === "ready"
                ? "bg-green-700"
                : orderStatus === "completed"
                ? "bg-[#333]"
                : orderStatus === "canceled"
                ? "bg-red-500"
                : ""
            } h-10 flex justify-center items-center rounded-md text-white font-semibold px-5`}
            to="add-order"
          >
            {orderStatus}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Menu Items */}
          <div className="bg-white rounded-md p-4">
            <label className="block font-medium mb-1">
              Menu Items{" "}
              <span className="text-red-500">
                {orderStatus === "pending" ? "" : "(Editing is not allowed!)"}
              </span>
            </label>
            <div className="space-y-6 mt-4">
              {Object.entries(
                menuItems.reduce((acc, menuItem) => {
                  const category = menuItem.category_id;
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(menuItem);
                  return acc;
                }, {})
              ).map(([categoryId, items]) => (
                <div key={categoryId}>
                  {/* Category Header */}
                  <h2 className="text-lg font-bold mb-2">
                    {`${items[0]?.category?.name || `Category ${categoryId}`}s`}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {items.map((menuItem) => (
                      <div
                        key={menuItem.id}
                        className="flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={() => handleMenuItemToggle(menuItem.id)}
                          className={`px-3 py-1 border rounded-md ${
                            selectedOrderItems.some(
                              (item) => item.menu_item_id === menuItem.id
                            )
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-800"
                          }`}
                          disabled={orderStatus !== "pending"} // Disable if not pending
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
                                (item) => item.menu_item_id === menuItem.id
                              )?.quantity || ""
                            }
                            onChange={(e) =>
                              handleQuantityChange(menuItem.id, e.target.value)
                            }
                            placeholder="Qty"
                            className="w-16 h-8 p-1 border border-gray-300 rounded-md"
                            disabled={orderStatus !== "pending"} // Disable if not pending
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md ${
                loading || orderStatus !== "pending"
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={loading || orderStatus !== "pending"} // Disable if not pending
            >
              {loading ? "Updating Order..." : "Update Order"}
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

export default UpdateOrder;
