import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "../Topbar";

function DashboardLayout({
  role,
  unreadCount = 0,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:ml-64 min-h-screen">
        <Topbar
          role={role}
          unreadCount={unreadCount}
          setMobileOpen={setMobileOpen}
        />

        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;