import api from "./api.js";


export const getTasks = async (projectId) => {

  const response = await api.get(`/tasks/${projectId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


export const createTask = async (taskData) => {

  const response = await api.post("/tasks", taskData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


export const updateTask = async (id, taskData) => {

  const response = await api.put(`/tasks/${id}`, taskData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


export const deleteTask = async (id) => {

  const response = await api.delete(`/tasks/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


export const getTaskById = async (id) => {

  const response = await api.get(`/tasks/single/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


export const getStaff = async () => {

  const response = await api.get("/staff", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};


// Get tasks assigned to the logged-in staff member
export const getMyTasks = async () => {

  const response = await api.get("/tasks/my-tasks", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const getMyProjects = async () => {

  const response = await api.get("/projects/my-projects", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const getMyProjectTasks = async (projectId) => {

  const response = await api.get(
    `/tasks/my-project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};

export const updateStaffTask = async (id, taskData) => {

  const response = await api.put(
    `/tasks/staff/${id}`,
    taskData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};

export const getStaffTaskById = async (id) => {

  const response = await api.get(
    `/tasks/staff/single/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};