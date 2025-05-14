import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Sidebar from "./components/ui/Sidebar";
import TopNavbar from "./components/ui/TopNavbar";
import OrderList from "./components/orderlist/OrderList";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/auth/PrivateRoute";
import ForgotPassword from "./components/auth/ForgotPassword";
import AddOrders from "./components/orderlist/AddOrders";
import MenuItems from "./components/menuitems/Menuitems";
import AddMenuItems from "./components/menuitems/AddMenuItems";
import AddIngredientsTagsCategories from "./components/IngredientsTagsCategories/AddIngredientsTagsCategories";
import Tables from "./components/tables/Tables";
import PasswordReset from "./components/auth/PasswordReset";
import UpdateMenuItem from "./components/menuitems/UpdateMenuItem";
import UpdateOrder from "./components/orderlist/UpdateOrder";
import StaffManagement from "./components/staff/StaffManagement";
import Attendance from "./components/staff/Attendance";
import Feedbacks from "./components/feedbacks/Feedbacks";
import StaffShiftAssignment from "./components/staff/StaffShiftAssignment";
import ShiftTemplateManagement from "./components/staff/ShiftTemplateManagement";
import ShiftCalendarView from "./components/staff/ShiftCalendarView";

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 sm:p-6">
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
            <Route
              path="/orders/:orderid"
              element={
                <PrivateRoute>
                  <UpdateOrder />
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
                  <AddMenuItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/menuitems/:menuitemsid"
              element={
                <PrivateRoute>
                  <UpdateMenuItem />
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
            {/* Staff */}
            <Route
              path="/staff"
              element={
                <PrivateRoute>
                  <StaffManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/attendance"
              element={
                <PrivateRoute>
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/add-to-shift"
              element={
                <PrivateRoute>
                  <StaffShiftAssignment />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/create-shift"
              element={
                <PrivateRoute>
                  <ShiftTemplateManagement />
                </PrivateRoute>
              }
            />
            {/* Feedbacks */}
            <Route
              path="/feedbacks"
              element={
                <PrivateRoute>
                  <Feedbacks />
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
  const isAuthPage = ["/login", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );

  return (
    <div className="App">
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<PasswordReset />} />
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
