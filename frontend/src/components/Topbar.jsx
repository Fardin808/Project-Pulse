import { Bell, Menu, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Topbar({
  role,
  unreadCount = 0,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const notificationPath =
    role === "admin"
      ? "/admin/notifications"
      : "/staff/notifications";

  const dashboardPath =
    role === "admin"
      ? "/admin/dashboard"
      : "/staff/dashboard";

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-5 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm text-gray-400">
            Welcome back,
          </p>

          <h2 className="font-semibold text-gray-800">
            {user.name || (role === "admin" ? "Admin" : "Staff")}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate(notificationPath)}
          className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition"
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase">
            {(user.name || role || "U").charAt(0)}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800">
              {user.name || (role === "admin" ? "Admin User" : "Staff User")}
            </p>

            <p className="text-xs text-gray-400 capitalize">
              {role}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden md:block text-gray-400"
          />
        </button>
      </div>
    </header>
  );
}

export default Topbar;