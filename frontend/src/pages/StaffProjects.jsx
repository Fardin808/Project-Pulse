import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects } from "../services/taskApi";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FolderKanban,
  User,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function StaffProjects() {

  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {

    fetchProjects();

  }, []);


  const fetchProjects = async () => {

    try {

      const data = await getMyProjects();

      setProjects(data);

    } catch (error) {

      console.log(error);

    }

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
          <FolderKanban size={23} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Projects
          </h1>

          <p className="text-gray-500 mt-1">
            View projects containing tasks assigned to you.
          </p>
        </div>

      </div>

    </div>


    {/* Empty state */}
    {projects.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FolderKanban size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No projects found
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          You have not been assigned any tasks yet.
        </p>

      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {projects.map((project) => (

          <div
            key={project._id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition flex flex-col"
          >

            {/* Card header */}
            <div className="p-6 flex-1">

              <div className="flex items-start justify-between gap-4">

                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FolderKanban size={20} />
                </div>


                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    project.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : project.status === "ongoing"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {project.status || "Pending"}
                </span>

              </div>


              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 mt-5">
                {project.title}
              </h2>


              {/* Description */}
              <p className="text-sm text-gray-500 leading-6 mt-2 min-h-[48px]">
                {project.description ||
                  "No description available."}
              </p>


              {/* Project details */}
              <div className="mt-6 space-y-3">

                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Start Date
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {project.start_date
                        ? project.start_date.split("T")[0]
                        : "Not set"}
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Target Completion
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {project.target_completion_date
                        ? project.target_completion_date.split(
                            "T"
                          )[0]
                        : "Not set"}
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-3">

                  <User
                    size={16}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Created By
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {project.createdBy?.name ||
                        "Unknown"}
                    </p>
                  </div>

                </div>

              </div>

            </div>


            {/* Card footer */}
            <div className="border-t border-gray-100 p-4">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/staff/projects/${project._id}/tasks`
                  )
                }
                className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition group"
              >
                <span>View Project Tasks</span>

                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition"
                />
              </button>

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);

}


export default StaffProjects;