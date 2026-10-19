import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  ClipboardList,
  Bell,
  Users,
  ArrowRight,
  Plus,
  ListTodo,
  ShieldAlert,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { getMyNotifications } from "../services/notificationApi";


function AdminDashboard() {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);


  // Load notification information
  useEffect(() => {
    fetchNotifications();
  }, []);


  const fetchNotifications = async () => {
    try {
      const notifications = await getMyNotifications();

      const count = notifications.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(count);

      // Show only latest notifications on dashboard
      setRecentNotifications(
        notifications.slice(0, 4)
      );

    } catch (error) {
      console.log(
        "Failed to load notifications:",
        error
      );
    }
  };


  const getNotificationStyle = (type) => {
    if (type === "task_updated") {
      return {
        icon: ListTodo,
        iconStyle: "bg-blue-50 text-blue-600",
      };
    }

    if (type === "request_submitted") {
      return {
        icon: ClipboardList,
        iconStyle: "bg-orange-50 text-orange-600",
      };
    }

    return {
      icon: Bell,
      iconStyle: "bg-indigo-50 text-indigo-600",
    };
  };


  return (
    <DashboardLayout
      role="admin"
      unreadCount={unreadCount}
    >

      {/* Page heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your projects, tasks and staff activity.
          </p>
        </div>


        <button
          onClick={() =>
            navigate("/admin/projects/create")
          }
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} />
          Create Project
        </button>

      </div>


      {/* Quick overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

        {/* Projects */}
        <button
          onClick={() =>
            navigate("/admin/projects")
          }
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Projects
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Manage Projects
              </h2>
            </div>

            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={21} />
            </div>

          </div>

          <div className="flex items-center gap-1 text-sm text-blue-600 mt-5 font-medium">
            View projects
            <ArrowRight size={15} />
          </div>
        </button>


        {/* Tasks */}
        <button
          onClick={() =>
            navigate("/admin/projects")
          }
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Tasks
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Project Tasks
              </h2>
            </div>

            <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <ListTodo size={21} />
            </div>

          </div>

          <div className="flex items-center gap-1 text-sm text-green-600 mt-5 font-medium">
            Open projects
            <ArrowRight size={15} />
          </div>
        </button>


        {/* Staff */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Staff
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Staff Management
              </h2>
            </div>

            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Users size={21} />
            </div>

          </div>

          <p className="text-sm text-gray-400 mt-5">
            Coming soon
          </p>

        </div>


        {/* Requests */}
        <button
          onClick={() =>
            navigate("/admin/task-requests")
          }
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition"
        >

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Requests
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Task Requests
              </h2>
            </div>

            <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={21} />
            </div>

          </div>

          <div className="flex items-center gap-1 text-sm text-orange-600 mt-5 font-medium">
            Review requests
            <ArrowRight size={15} />
          </div>

        </button>

        {/* Risk Dashboard */}
        <button
          type="button"
          onClick={() => navigate("/admin/risks")}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Risks
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Risk Dashboard
              </h2>
            </div>

            <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <ShieldAlert size={21} />
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-red-600 mt-5 font-medium">
            Monitor project risks
            <ArrowRight size={15} />
          </div>
        </button>

      </div>





      {/* Dashboard content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Recent activity */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Activity
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Latest staff updates and requests
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/notifications")
              }
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </button>

          </div>


          {recentNotifications.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <div className="w-12 h-12 mx-auto bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Bell size={22} />
              </div>

              <p className="font-medium text-gray-700 mt-4">
                No recent activity
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Staff activity will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {recentNotifications.map(
                (notification) => {

                  const style =
                    getNotificationStyle(
                      notification.type
                    );

                  const Icon = style.icon;

                  return (
                    <div
                      key={notification._id}
                      className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50/70 transition"
                    >

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconStyle}`}
                      >
                        <Icon size={18} />
                      </div>


                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {notification.title}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                          </div>


                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                          )}

                        </div>


                        <p className="text-xs text-gray-400 mt-2">
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : ""}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* Quick actions */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Common management actions
            </p>

          </div>


          <div className="p-4 space-y-2">

            <button
              onClick={() =>
                navigate("/admin/projects/create")
              }
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-indigo-50 transition text-left group"
            >
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Plus size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  Create Project
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Start a new project
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-gray-300 group-hover:text-indigo-600"
              />
            </button>


            <button
              onClick={() =>
                navigate("/admin/projects")
              }
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition text-left group"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FolderKanban size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  View Projects
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Manage projects and tasks
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-gray-300 group-hover:text-blue-600"
              />
            </button>


            <button
              onClick={() =>
                navigate("/admin/task-requests")
              }
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition text-left group"
            >
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <ClipboardList size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  Review Requests
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Check staff task requests
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-gray-300 group-hover:text-orange-600"
              />
            </button>


            <button
              onClick={() =>
                navigate("/admin/notifications")
              }
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition text-left group"
            >
              <div className="relative w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  Notifications
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} new notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "No new notifications"}
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-gray-300 group-hover:text-green-600"
              />
            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default AdminDashboard;