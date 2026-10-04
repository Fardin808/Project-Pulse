import api from "./api";


// Get logged-in user's notifications
export const getMyNotifications = async () => {
  const response = await api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.put(
    "/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};