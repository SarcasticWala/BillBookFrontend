import { Outlet } from "react-router-dom";
import Sidebar from "../partial/Sidebar";
import Footer from "../Footer/Footer";

/** Dashboard chrome (Sidebar + content area + Footer) around the matched child route. */
const DashboardLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <div className="flex-1 min-w-0 h-screen overflow-hidden sm:ml-60 flex flex-col bg-white">
      <div className="app-content flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-9xl mx-auto">
        <Outlet />
      </div>
      <Footer />
    </div>
  </div>
);

export default DashboardLayout;
