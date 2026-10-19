import api from "./api.js";

const getProjects= async() => {

    const response= await api.get("/projects",{

        headers: {

            Authorization: `Bearer ${localStorage.getItem("token")}`,

        },
    });

    return response.data; }

const createProject= async (projectData) => {

    const response = await api.post("projects",projectData,{
        headers: {

            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
    return response.data;
}
const updateProject = async (projectId, projectData) => {
  const response = await api.put(
    `/projects/${projectId}`,
    projectData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};
const deleteProject = async (projectId) => {
  const response = await api.delete(
    `/projects/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};
export {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
