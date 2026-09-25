import { Outlet } from "react-router-dom";
import Sidebar from "../partial/Sidebar";
import LandingFooter from "../Home/LandingFooter";

/**
 * Dashboard chrome (Sidebar + content area + Footer) around the matched child
 * route. The footer is the same one used on the public site (same links),
 * just the `compact` sizing — and it lives inside the scrollable area so it
 * only appears once a page is scrolled to the bottom instead of permanently
 * eating space on every screen.
 *
 * The per-route loading state lives on each route's own element (see
 * `dashboardRoute` in App.tsx), not here — a boundary at this level stays
 * mounted across navigations, and an already-mounted boundary does not show
 * its fallback during a transition.
 */
const DashboardLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <div className="flex-1 min-w-0 h-screen overflow-hidden sm:ml-60 flex flex-col bg-white">
      <div className="app-content flex-1 overflow-y-auto flex flex-col">
        {/* <main> so screen-reader users can jump past the sidebar to the
            page body — the document previously had no main landmark at all. */}
        <main className="p-4 sm:p-6 w-full max-w-9xl mx-auto flex-1">
          <Outlet />
        </main>
        <LandingFooter compact />
      </div>
    </div>
  </div>
);

export default DashboardLayout;
