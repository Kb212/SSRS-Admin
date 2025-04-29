import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Sidebar from "./components/ui/Sidebar";
import TopNavbar from "./components/ui/TopNavbar";
import OrderList from "./components/orderlist/OrderList";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/auth/PrivateRoute"; 
import ForgotPassword from "./components/auth/ForgotPassword";
import AddOrders from "./components/orderlist/AddOrders";
import MenuItems from "./components/menuitems/Menuitems";
import AddMenuItem from "./components/menuitems/AddMenuItem";
import AddIngredientsTagsCategories from "./components/IngredientsTagsCategories/AddIngredientsTagsCategories";
import Tables from "./components/tables/Tables";

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6">
          <Routes>
            {/* Protected Pages */}
            {/* Dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* Order List */}
            <Route
              path="/orderlist"
              element={
                <PrivateRoute>
                  <OrderList />
                </PrivateRoute>
              }
            />
            <Route
              path="/orderlist/add-order"
              element={
                <PrivateRoute>
                  <AddOrders />
                </PrivateRoute>
              }
            />
            {/* Menu Items */}
            <Route
              path="/menuitems"
              element={
                <PrivateRoute>
                  <MenuItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/menuitems/add-menuitem"
              element={
                <PrivateRoute>
                  <AddMenuItem />
                </PrivateRoute>
              }
            />
            {/* Tables */}
            <Route
              path="/tables"
              element={
                <PrivateRoute>
                  <Tables />
                </PrivateRoute>
              }
            />
            {/* Components for Menu Item */}
            <Route
              path="/components"
              element={
                <PrivateRoute>
                  <AddIngredientsTagsCategories />
                </PrivateRoute>
              }
            />
            {/* You can add more protected routes easily here later */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/forgot-password";

  return (
    <div className="App">
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <Layout />
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
