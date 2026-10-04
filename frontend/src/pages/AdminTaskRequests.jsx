import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTaskRequests,
  updateTaskRequest,
} from "../services/taskRequestApi";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ClipboardList,
  PauseCircle,
  User,
  Mail,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";

function AdminTaskRequests() {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store admin responses separately for each request
  const [responses, setResponses] = useState({});


  useEffect(() => {
    fetchRequests();
  }, []);


  const fetchRequests = async () => {

    try {

      const data = await getAllTaskRequests();

      setRequests(data);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load task requests"
      );

    } finally {

      setLoading(false);

    }

  };


  const handleResponseChange = (requestId, value) => {

    setResponses({
      ...responses,
      [requestId]: value,
    });

  };


  const handleDecision = async (requestId, status) => {

    const adminResponse =
      responses[requestId]?.trim() || "";


    if (!adminResponse) {

      toast.error(
        "Please write a response before submitting."
      );

      return;

    }


    try {

      await updateTaskRequest(requestId, {
        status,
        adminResponse,
      });


      if (status === "approved") {

        toast.success(
          "Task change request approved."
        );

      } else if (status === "holding") {

      toast.success(
        "Task change request placed on hold."
      );} else {

        toast.success(
          "Task change request rejected."
        );

      }


      fetchRequests();

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update request"
      );

    }

  };


  const getStatusStyle = (status) => {

    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "holding") {
    return "bg-blue-100 text-blue-700";
     }

    return "bg-yellow-100 text-yellow-700";

  };


return (
  <DashboardLayout role="admin">

    <button
      onClick={() => navigate("/admin/dashboard")}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
    >
      <ArrowLeft size={17} />
      Back to Dashboard
    </button>


    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Task Change Requests
      </h1>

      <p className="text-gray-500 mt-1">
        Review and respond to task change requests
        submitted by staff.
      </p>
    </div>


    {loading ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 text-center">
        <Clock3
          size={25}
          className="mx-auto text-gray-300"
        />

        <p className="text-gray-500 mt-3">
          Loading requests...
        </p>
      </div>

    ) : requests.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <ClipboardList size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No task change requests
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          There are currently no requests to review.
        </p>

      </div>

    ) : (

      <div className="space-y-5">

        {requests.map((request) => (

          <div
            key={request._id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >

            <div className="p-5 md:p-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    {request.task?.title ||
                      "Task unavailable"}
                  </h2>


                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User size={15} />

                      <span>
                        {request.staff?.name ||
                          "Unknown"}
                      </span>
                    </div>


                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={15} />

                      <span>
                        {request.staff?.email ||
                          "Unknown"}
                      </span>
                    </div>

                  </div>


                  <p className="text-sm text-gray-500 mt-2">
                    Project:{" "}
                    <span className="font-medium text-gray-700">
                      {request.task?.projectId?.title ||
                        "Unknown"}
                    </span>
                  </p>

                </div>


                <span
                  className={`inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                    request.status
                  )}`}
                >
                  {request.status === "approved" && (
                    <CheckCircle2 size={14} />
                  )}

                  {request.status === "rejected" && (
                    <XCircle size={14} />
                  )}

                  {request.status === "holding" && (
                    <PauseCircle size={14} />
                  )}

                  {request.status === "pending" && (
                    <Clock3 size={14} />
                  )}

                  {request.status}
                </span>

              </div>


              {/* Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">

                {/* Task info */}
                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Task Information
                  </p>


                  <div className="mt-3 space-y-2">

                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Priority:
                      </span>{" "}

                      <span className="capitalize">
                        {request.task?.priority ||
                          "Unknown"}
                      </span>
                    </p>


                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Status:
                      </span>{" "}

                      <span className="capitalize">
                        {request.task?.status ===
                        "inprogress"
                          ? "In Progress"
                          : request.task?.status ||
                            "Unknown"}
                      </span>
                    </p>

                  </div>


                  <p className="text-sm text-gray-500 mt-4 leading-6">
                    {request.task?.description ||
                      "No task description available."}
                  </p>

                </div>


                {/* Staff reason */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Staff's Reason
                  </p>

                  <p className="text-sm text-gray-700 mt-3 leading-6 whitespace-pre-wrap">
                    {request.reason ||
                      "No reason provided."}
                  </p>

                </div>

              </div>


              {/* Pending / Holding actions */}
              {["pending", "holding"].includes(
                request.status
              ) ? (

                <div className="mt-6 pt-5 border-t border-gray-100">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response
                  </label>


                  <textarea
                    value={
                      responses[request._id] || ""
                    }
                    onChange={(e) =>
                      handleResponseChange(
                        request._id,
                        e.target.value
                      )
                    }
                    rows="4"
                    placeholder="Write your response to the staff member..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />


                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">

                    {request.status === "pending" && (

                      <button
                        type="button"
                        onClick={() =>
                          handleDecision(
                            request._id,
                            "holding"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 border border-blue-200 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition"
                      >
                        <PauseCircle size={16} />
                        Put on Hold
                      </button>

                    )}


                    <button
                      type="button"
                      onClick={() =>
                        handleDecision(
                          request._id,
                          "rejected"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDecision(
                          request._id,
                          "approved"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition"
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>

                  </div>

                </div>

              ) : (

                /* Final request */
                <div className="mt-6 pt-5 border-t border-gray-100">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Admin Response
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 mt-2">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {request.adminResponse ||
                        "No response provided."}
                    </p>
                  </div>

                </div>

              )}


              {/* Submitted date */}
              <div className="flex items-center gap-2 mt-5 text-xs text-gray-400">

                <Clock3 size={14} />

                <span>
                  Submitted:{" "}
                  {request.createdAt
                    ? new Date(
                        request.createdAt
                      ).toLocaleString()
                    : "Unknown"}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);

}

export default AdminTaskRequests;