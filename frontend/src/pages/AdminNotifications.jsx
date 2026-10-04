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
  ClipboardList,
  Clock3,
  FolderKanban,
  ListTodo,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function AdminNotifications() {

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

      // Mark new notifications as seen
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

    if (type === "task_updated") {
      return "Task Updated";
    }

    if (type === "request_submitted") {
    return "New Task Request";
    }

    return "Notification";
  };


  return (
  <DashboardLayout role="admin">

    {/* Back */}
    <button
      onClick={() => navigate("/admin/dashboard")}
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
            View task updates and requests submitted by staff.
          </p>
        </div>

      </div>

    </div>


    {/* Content */}
    {loading ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 text-center">

        <Clock3
          size={25}
          className="mx-auto text-gray-300"
        />

        <p className="text-gray-500 mt-3">
          Loading notifications...
        </p>

      </div>

    ) : notifications.length === 0 ? (

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

        {/* List header */}
        <div className="px-5 md:px-6 py-5 border-b border-gray-100">

          <h2 className="font-semibold text-gray-900">
            Recent Activity
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </p>

        </div>


        {/* Notifications */}
        <div className="divide-y divide-gray-100">

          {notifications.map((notification) => {

            const isTaskUpdate =
              notification.type === "task_updated";

            const isRequest =
              notification.type === "request_submitted";


            return (
              <div
                key={notification._id}
                className="p-5 md:p-6 hover:bg-slate-50/70 transition"
              >

                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isTaskUpdate
                        ? "bg-blue-50 text-blue-600"
                        : isRequest
                        ? "bg-orange-50 text-orange-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {isTaskUpdate ? (
                      <ListTodo size={20} />
                    ) : isRequest ? (
                      <ClipboardList size={20} />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>


                  {/* Notification body */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                      <div>

                        {/* Type */}
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isTaskUpdate
                              ? "text-blue-600"
                              : isRequest
                              ? "text-orange-600"
                              : "text-indigo-600"
                          }`}
                        >
                          {getTypeLabel(
                            notification.type
                          )}
                        </p>


                        {/* Title */}
                        <h3 className="text-base font-semibold text-gray-900 mt-1">
                          {notification.title}
                        </h3>

                      </div>


                      {/* Date */}
                      {notification.createdAt && (

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">

                          <Clock3 size={13} />

                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}

                        </div>

                      )}

                    </div>


                    {/* Message */}
                    <p className="text-sm text-gray-600 mt-2 leading-6">
                      {notification.message}
                    </p>


                    {/* Related information */}
                    {(notification.relatedProject ||
                      notification.relatedTask) && (

                      <div className="flex flex-wrap gap-2 mt-4">

                        {notification.relatedProject && (

                          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600">

                            <FolderKanban
                              size={14}
                              className="text-gray-400"
                            />

                            <span>
                              Project:
                            </span>

                            <span className="font-medium text-gray-800">
                              {
                                notification
                                  .relatedProject
                                  .title
                              }
                            </span>

                          </div>

                        )}


                        {notification.relatedTask && (

                          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600">

                            <ListTodo
                              size={14}
                              className="text-gray-400"
                            />

                            <span>
                              Task:
                            </span>

                            <span className="font-medium text-gray-800">
                              {
                                notification
                                  .relatedTask
                                  .title
                              }
                            </span>

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    )}

  </DashboardLayout>
);
}


export default AdminNotifications;