import api from "./api.js";


// Staff: create a task change request
export const createTaskRequest = async (requestData) => {

  const response = await api.post(
    "/task-requests",
    requestData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};


// Staff: get my submitted requests
export const getMyTaskRequests = async () => {

  const response = await api.get(
    "/task-requests/my-requests",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};


// Admin: get all task change requests
export const getAllTaskRequests = async () => {

  const response = await api.get(
    "/task-requests",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};


// Admin: approve or reject a request
export const updateTaskRequest = async (id, requestData) => {

  const response = await api.put(
    `/task-requests/${id}`,
    requestData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};