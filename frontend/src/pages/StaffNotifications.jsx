import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
} from "../services/notificationApi";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  PauseCircle,
  UserMinus,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function StaffNotifications() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);


  // Load notifications
  useEffect(() => {
    fetchNotifications();
  }, []);


  // Get notifications and mark them as read
  const fetchNotifications = async () => {
    try {

      const data = await getMyNotifications();

      setNotifications(data);

      // Opening this page means the notifications have been seen
      const hasUnreadNotifications = data.some(
        (notification) => !notification.isRead
      );

      if (hasUnreadNotifications) {
        await markAllNotificationsAsRead();
      }

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load notifications"
      );

    } finally {

      setLoading(false);

    }
  };


  // Notification type label
  const getTypeLabel = (type) => {

    if (type === "task_assigned") {
      return "Task Assigned";
    }

    if (type === "task_unassigned") {
      return "Task Removed";
    }

    if (type === "request_holding") {
      return "Request Holding";
    }

    if (type === "request_approved") {
      return "Request Approved";
    }

    if (type === "request_rejected") {
      return "Request Rejected";
    }

    return "Notification";
  };


 return (
  <DashboardLayout role="staff">

    {/* Back */}
    <button
      type="button"
      onClick={() => navigate("/staff/dashboard")}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
    >
      <ArrowLeft size={17} />
      Back to Dashboard
    </button>


    {/* Header */}
    <div className="mb-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Bell size={22} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="text-gray-500 mt-1">
            View your task assignments and request updates.
          </p>
        </div>

      </div>

    </div>


    {/* Loading */}
    {loading ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Bell size={21} />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Loading notifications...
        </p>

      </div>

    ) : notifications.length === 0 ? (

      /* Empty State */
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Bell size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No notifications
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          You do not have any notifications yet.
        </p>

      </div>

    ) : (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* List Header */}
        <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Your latest task and request updates
            </p>
          </div>


          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {notifications.length}{" "}
            {notifications.length === 1
              ? "Notification"
              : "Notifications"}
          </span>

        </div>


        {/* Notification List */}
        <div className="divide-y divide-gray-100">

          {notifications.map((notification) => (

            <div
              key={notification._id}
              className="p-5 md:p-6 hover:bg-slate-50/60 transition"
            >

              <div className="flex items-start gap-4">

                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    notification.type === "task_assigned"
                      ? "bg-blue-50 text-blue-600"
                      : notification.type === "task_unassigned"
                      ? "bg-red-50 text-red-600"
                      : notification.type === "request_approved"
                      ? "bg-green-50 text-green-600"
                      : notification.type === "request_rejected"
                      ? "bg-red-50 text-red-600"
                      : notification.type === "request_holding"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >

                  {notification.type === "task_assigned" ? (
                    <ListTodo size={20} />
                  ) : notification.type === "task_unassigned" ? (
                    <UserMinus size={20} />
                  ) : notification.type === "request_approved" ? (
                    <CheckCircle2 size={20} />
                  ) : notification.type === "request_rejected" ? (
                    <XCircle size={20} />
                  ) : notification.type === "request_holding" ? (
                    <PauseCircle size={20} />
                  ) : (
                    <Bell size={20} />
                  )}

                </div>


                {/* Content */}
                <div className="flex-1 min-w-0">

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                    <div>

                      {/* Type */}
                      <p
                        className={`text-xs font-semibold ${
                          notification.type === "task_assigned"
                            ? "text-blue-600"
                            : notification.type === "task_unassigned"
                            ? "text-red-600"
                            : notification.type === "request_approved"
                            ? "text-green-600"
                            : notification.type === "request_rejected"
                            ? "text-red-600"
                            : notification.type === "request_holding"
                            ? "text-amber-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {getTypeLabel(notification.type)}
                      </p>


                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mt-1">
                        {notification.title}
                      </h3>

                    </div>


                    {/* Date */}
                    {notification.createdAt && (

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">

                        <Clock3 size={13} />

                        <span>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                    )}

                  </div>


                  {/* Message */}
                  <p className="text-sm text-gray-500 mt-2 leading-6">
                    {notification.message}
                  </p>


                  {/* Related Data */}
                  {(notification.relatedProject ||
                    notification.relatedTask) && (

                    <div className="flex flex-wrap gap-2 mt-4">

                      {notification.relatedProject && (

                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium">

                          <FolderKanban size={13} />

                          {
                            notification.relatedProject
                              .title
                          }

                        </div>

                      )}


                      {notification.relatedTask && (

                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">

                          <ListTodo size={13} />

                          {notification.relatedTask.title}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    )}

  </DashboardLayout>
);
}


export default StaffNotifications;