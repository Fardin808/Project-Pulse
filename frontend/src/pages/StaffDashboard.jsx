import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyNotifications } from "../services/notificationApi";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  FolderKanban,
  ListTodo,
  Send,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";

function StaffDashboard() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [unreadCount, setUnreadCount] = useState(0);


  // Check for new notifications
  useEffect(() => {
    fetchNotificationCount();
  }, []);


  // Count unread notifications
  const fetchNotificationCount = async () => {
    try {

      const notifications = await getMyNotifications();

      const count = notifications.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(count);

    } catch (error) {

      console.log("Failed to load notification count:", error);

    }
  };


return (
  <DashboardLayout
    role="staff"
    unreadCount={unreadCount}
  >

    {/* Header */}
    <div className="mb-8">

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Staff Dashboard
      </h1>

      <p className="text-gray-500 mt-1">
        Welcome back, {user.name || "Staff"}.
        Manage your assigned work and requests.
      </p>

    </div>


    {/* Main navigation cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

      {/* Projects */}
      <button
        type="button"
        onClick={() =>
          navigate("/staff/projects")
        }
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:border-indigo-200 hover:shadow-md transition group"
      >

        <div className="flex items-start justify-between">

          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban size={21} />
          </div>

          <ArrowRight
            size={18}
            className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition"
          />

        </div>


        <h2 className="font-semibold text-gray-900 mt-5">
          My Projects
        </h2>

        <p className="text-sm text-gray-500 mt-2 leading-6">
          View projects that contain tasks
          assigned to you.
        </p>

      </button>


      {/* Tasks */}
      <button
        type="button"
        onClick={() =>
          navigate("/staff/tasks")
        }
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:border-blue-200 hover:shadow-md transition group"
      >

        <div className="flex items-start justify-between">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ListTodo size={21} />
          </div>

          <ArrowRight
            size={18}
            className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition"
          />

        </div>


        <h2 className="font-semibold text-gray-900 mt-5">
          My Tasks
        </h2>

        <p className="text-sm text-gray-500 mt-2 leading-6">
          View assigned tasks and update your
          progress.
        </p>

      </button>


      {/* Notifications */}
      <button
        type="button"
        onClick={() =>
          navigate("/staff/notifications")
        }
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:border-green-200 hover:shadow-md transition group"
      >

        <div className="flex items-start justify-between">

          <div className="relative">

            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Bell size={21} />
            </div>


            {unreadCount > 0 && (

              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>

            )}

          </div>


          <ArrowRight
            size={18}
            className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition"
          />

        </div>


        <h2 className="font-semibold text-gray-900 mt-5">
          Notifications
        </h2>

        <p className="text-sm text-gray-500 mt-2 leading-6">
          {unreadCount > 0
            ? `You have ${unreadCount} new notification${
                unreadCount !== 1 ? "s" : ""
              }.`
            : "Check task assignments and updates from the admin."}
        </p>

      </button>

    </div>


    {/* Task request section */}
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      <div className="p-6 border-b border-gray-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ClipboardList size={21} />
          </div>


          <div>

            <h2 className="font-semibold text-gray-900">
              Task Change Requests
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Need a change to one of your
              assigned tasks?
            </p>

          </div>

        </div>

      </div>


      <div className="p-6">

        <p className="text-sm text-gray-500 leading-6 max-w-2xl">
          If you are unable to continue an
          assigned task or need the admin to
          review your assignment, submit a
          request. You can also track requests
          you have already submitted.
        </p>


        <div className="flex flex-col sm:flex-row gap-3 mt-5">

          <button
            type="button"
            onClick={() =>
              navigate("/staff/request")
            }
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Send size={16} />
            Send Request
          </button>


          <button
            type="button"
            onClick={() =>
              navigate("/staff/my-requests")
            }
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <ClipboardList size={16} />
            View My Requests
          </button>

        </div>

      </div>

    </div>

  </DashboardLayout>
);

}


export default StaffDashboard;