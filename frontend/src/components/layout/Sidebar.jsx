import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Bell,
  ClipboardList,
  LogOut,
  Users,
  X,
} from "lucide-react";

function Sidebar({ role, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/admin/projects",
      icon: FolderKanban,
    },
    {
      name: "Task Requests",
      path: "/admin/task-requests",
      icon: ClipboardList,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },
    {
      name: "Staff",
      path: "#",
      icon: Users,
      disabled: true,
    },
  ];

  const staffLinks = [
    {
      name: "Dashboard",
      path: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Projects",
      path: "/staff/projects",
      icon: FolderKanban,
    },
    {
      name: "My Tasks",
      path: "/staff/tasks",
      icon: ListTodo,
    },
    {
      name: "Task Requests",
      path: "/staff/my-requests",
      icon: ClipboardList,
    },
    {
      name: "Notifications",
      path: "/staff/notifications",
      icon: Bell,
    },
  ];

  const links = role === "admin" ? adminLinks : staffLinks;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() =>
              navigate(
                role === "admin"
                  ? "/admin/dashboard"
                  : "/staff/dashboard"
              )
            }
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              P
            </div>

            <div className="text-left">
              <h1 className="font-bold text-gray-900">
                Project Pulse
              </h1>

              <p className="text-xs text-gray-400">
                Project Management
              </p>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-500"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                >
                  <Icon size={19} />

                  <span>{item.name}</span>

                  <span className="ml-auto text-[10px] bg-gray-100 px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />

                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={19} />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;