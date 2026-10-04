import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  CalendarDays,
  ArrowRight,
  Search,
} from "lucide-react";

import { getProjects } from "../services/projectApi.js";
import { getMyNotifications } from "../services/notificationApi.js";
import DashboardLayout from "../components/layout/DashboardLayout";


function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    fetchProjects();
    fetchNotificationCount();
  }, []);


  // Load projects
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.log(
        error.response?.data?.message ||
        error.message
      );
    } finally {
      setLoading(false);
    }
  };


  // Load unread notification count
  const fetchNotificationCount = async () => {
    try {
      const notifications =
        await getMyNotifications();

      const count = notifications.filter(
        (notification) =>
          !notification.isRead
      ).length;

      setUnreadCount(count);
    } catch (error) {
      console.log(
        "Failed to load notifications:",
        error
      );
    }
  };


  // Project status badge
  const getStatusStyle = (status) => {
    if (status === "completed") {
      return "bg-green-50 text-green-700 border-green-100";
    }

    if (status === "ongoing") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    return "bg-orange-50 text-orange-700 border-orange-100";
  };


  // Filter projects by search
  const filteredProjects =
    projects.filter((project) => {
      const searchText =
        search.toLowerCase();

      return (
        project.title
          ?.toLowerCase()
          .includes(searchText) ||
        project.description
          ?.toLowerCase()
          .includes(searchText)
      );
    });


  return (
    <DashboardLayout
      role="admin"
      unreadCount={unreadCount}
    >

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Projects
          </h1>

          <p className="text-gray-500 mt-1">
            Create and manage all of your projects.
          </p>
        </div>


        <button
          onClick={() =>
            navigate("/admin/projects/create")
          }
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} />

          New Project
        </button>

      </div>


      {/* Project summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Projects
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-bold text-gray-900">
              {projects.length}
            </h2>

            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={21} />
            </div>

          </div>

        </div>


        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Ongoing
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-bold text-blue-600">
              {
                projects.filter(
                  (project) =>
                    project.status === "ongoing"
                ).length
              }
            </h2>

            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CalendarDays size={21} />
            </div>

          </div>

        </div>


        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Completed
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-bold text-green-600">
              {
                projects.filter(
                  (project) =>
                    project.status === "completed"
                ).length
              }
            </h2>

            <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={21} />
            </div>

          </div>

        </div>

      </div>


      {/* Projects section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-100">

          <div>
            <h2 className="font-semibold text-gray-900">
              All Projects
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {filteredProjects.length} project
              {filteredProjects.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>


          {/* Search */}
          <div className="relative w-full md:w-72">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />

          </div>

        </div>


        {/* Loading */}
        {loading ? (

          <div className="py-16 text-center">
            <p className="text-gray-500">
              Loading projects...
            </p>
          </div>

        ) : filteredProjects.length === 0 ? (

          /* Empty state */
          <div className="py-16 px-6 text-center">

            <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <FolderKanban size={25} />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              {projects.length === 0
                ? "Create your first project to get started."
                : "Try searching with another project name."}
            </p>

            {projects.length === 0 && (
              <button
                onClick={() =>
                  navigate(
                    "/admin/projects/create"
                  )
                }
                className="inline-flex items-center gap-2 mt-5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Project
              </button>
            )}

          </div>

        ) : (

          /* Project cards */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-5">

            {filteredProjects.map(
              (project) => (

                <div
                  key={project._id}
                  className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition"
                >

                  {/* Card top */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <FolderKanban
                          size={20}
                        />
                      </div>


                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {project.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {project.description ||
                            "No description available"}
                        </p>
                      </div>

                    </div>


                    <span
                      className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>

                  </div>


                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                    <div className="bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-400">
                        Start Date
                      </p>

                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {project.start_date
                          ? new Date(
                              project.start_date
                            ).toLocaleDateString()
                          : "Not set"}
                      </p>

                    </div>


                    <div className="bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-400">
                        Target Completion
                      </p>

                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {project.target_completion_date
                          ? new Date(
                              project.target_completion_date
                            ).toLocaleDateString()
                          : "Not set"}
                      </p>

                    </div>

                  </div>


                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">

                    <div>
                      <p className="text-xs text-gray-400">
                        Created by
                      </p>

                      <p className="text-sm font-medium text-gray-700 mt-0.5">
                        {project.createdBy?.name ||
                          "Unknown"}
                      </p>
                    </div>


                    <button
                      onClick={() =>
                        navigate(
                          `/admin/projects/${project._id}/tasks`
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View Tasks
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}


export default Projects;