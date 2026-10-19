import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  CalendarDays,
  ArrowRight,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getProjects,
  updateProject,
  deleteProject,
} from "../services/projectApi.js";
import { getMyNotifications } from "../services/notificationApi.js";
import DashboardLayout from "../components/layout/DashboardLayout";

const formatInputDate = (date) => {
  if (!date) return "";
  return String(date).slice(0, 10);
};

const getStatusStyle = (status) => {
  if (status === "completed") return "bg-green-50 text-green-700 border-green-100";
  if (status === "ongoing") return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-orange-50 text-orange-700 border-orange-100";
};

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    start_date: "",
    target_completion_date: "",
  });
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    const loadNotifications = async () => {
      try {
        const notifications = await getMyNotifications();
        setUnreadCount(notifications.filter((notification) => !notification.isRead).length);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    load();
    loadNotifications();
  }, []);

  const openEditModal = (project) => {
    setProjectToEdit(project);
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      start_date: formatInputDate(project.start_date),
      target_completion_date: formatInputDate(project.target_completion_date),
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!projectToEdit || saving) return;

    if (!editForm.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (
      editForm.start_date &&
      editForm.target_completion_date &&
      editForm.target_completion_date < editForm.start_date
    ) {
      toast.error("Target completion date cannot be before start date");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description,
        start_date: editForm.start_date || null,
        target_completion_date: editForm.target_completion_date || null,
      };
      const response = await updateProject(projectToEdit._id, payload);
      setProjects((current) =>
        current.map((project) =>
          project._id === projectToEdit._id
            ? { ...project, ...response.project, createdBy: project.createdBy }
            : project
        )
      );
      setProjectToEdit(null);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProject(projectToDelete._id);
      setProjects((current) =>
        current.filter((project) => project._id !== projectToDelete._id)
      );
      setProjectToDelete(null);
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const term = search.toLowerCase();
    return (
      project.title?.toLowerCase().includes(term) ||
      project.description?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout role="admin" unreadCount={unreadCount}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Create and manage all of your projects.</p>
        </div>
        <button
          onClick={() => navigate("/admin/projects/create")}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Project summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Projects</p>
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-gray-900">{projects.length}</h2>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={21} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ongoing</p>
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-blue-600">
              {projects.filter((project) => project.status === "ongoing").length}
            </h2>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-green-600">
              {projects.filter((project) => project.status === "completed").length}
            </h2>
            <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Projects section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">All Projects</h2>
            <p className="text-sm text-gray-400 mt-1">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <FolderKanban size={25} />
            </div>
            <h3 className="font-semibold text-gray-800 mt-4">
              {projects.length === 0 ? "No projects yet" : "No matching projects"}
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              {projects.length === 0
                ? "Create your first project to get started."
                : "Try searching with another project name."}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => navigate("/admin/projects/create")}
                className="inline-flex items-center gap-2 mt-5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                <Plus size={17} /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-5">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <FolderKanban size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg break-words">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description || "No description available"}
                      </p>
                    </div>
                  </div>
                  <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getStatusStyle(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Start Date</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Target Completion</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {project.target_completion_date
                        ? new Date(project.target_completion_date).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Created by</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {project.createdBy?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => openEditModal(project)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    <button
                      onClick={() => navigate(`/admin/projects/${project._id}/tasks`)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View Tasks <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit project modal */}
      {projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-project-title" className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 id="edit-project-title" className="text-xl font-bold text-gray-900">Edit Project</h2>
              <button type="button" onClick={() => setProjectToEdit(null)} disabled={saving} aria-label="Close edit form" className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input id="project-title" required value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
              </div>
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="project-description" rows={3} value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project-start" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input id="project-start" type="date" value={editForm.start_date} onChange={(event) => setEditForm({ ...editForm, start_date: event.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
                </div>
                <div>
                  <label htmlFor="project-target" className="block text-sm font-medium text-gray-700 mb-1">Target Completion</label>
                  <input id="project-target" type="date" value={editForm.target_completion_date} onChange={(event) => setEditForm({ ...editForm, target_completion_date: event.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Project status is calculated automatically from its tasks.</p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setProjectToEdit(null)} disabled={saving} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title" className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 id="delete-project-title" className="text-xl font-bold text-gray-900">Delete Project?</h2>
            <p className="text-sm text-gray-600 mt-3">
              Are you sure you want to delete <span className="font-semibold">{projectToDelete.title}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Deletion is allowed only when the project has no incomplete tasks. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setProjectToDelete(null)} disabled={deleting} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Projects;
