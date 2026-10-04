import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTaskRequests } from "../services/taskRequestApi";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ClipboardList,
  MessageSquare,
  PauseCircle,
  Plus,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function StaffMyRequests() {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);


  useEffect(() => {
    fetchRequests();
  }, []);


  const fetchRequests = async () => {

    try {

      const data = await getMyTaskRequests();

      setRequests(data);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load requests"
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

    return "bg-yellow-100 text-yellow-700";

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ClipboardList size={22} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Task Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Track the task change requests you have submitted.
          </p>
        </div>

      </div>


      <button
        type="button"
        onClick={() => navigate("/staff/request")}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
      >
        <Plus size={17} />
        New Request
      </button>

    </div>


    {/* Empty State */}
    {requests.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ClipboardList size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No requests found
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          You have not submitted any task change requests yet.
        </p>


        <button
          type="button"
          onClick={() => navigate("/staff/request")}
          className="inline-flex items-center gap-2 mt-5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Submit Your First Request
        </button>

      </div>

    ) : (

      <div className="space-y-4">

        {requests.map((request) => (

          <div
            key={request._id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >

            {/* Request Header */}
            <div className="p-5 md:p-6">

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Task
                  </p>

                  <h2 className="text-lg font-semibold text-gray-900 mt-1">
                    {request.task?.title ||
                      "Task unavailable"}
                  </h2>


                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">

                    <Clock3 size={14} />

                    <span>
                      Submitted{" "}
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "Unknown"}
                    </span>

                  </div>

                </div>


                {/* Status */}
                <span
                  className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                    request.status === "holding"
                      ? "bg-blue-100 text-blue-700"
                      : getStatusStyle(
                          request.status
                        )
                  }`}
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


              {/* Reason */}
              <div className="mt-6">

                <div className="flex items-center gap-2 mb-2">

                  <MessageSquare
                    size={15}
                    className="text-gray-400"
                  />

                  <p className="text-sm font-semibold text-gray-700">
                    Your Reason
                  </p>

                </div>


                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                    {request.reason}
                  </p>

                </div>

              </div>


              {/* Admin Response */}
              {request.adminResponse && (

                <div className="mt-5">

                  <div className="flex items-center gap-2 mb-2">

                    <MessageSquare
                      size={15}
                      className="text-indigo-500"
                    />

                    <p className="text-sm font-semibold text-gray-700">
                      Admin Response
                    </p>

                  </div>


                  <div
                    className={`rounded-xl p-4 border ${
                      request.status === "approved"
                        ? "bg-green-50 border-green-100"
                        : request.status === "rejected"
                        ? "bg-red-50 border-red-100"
                        : request.status === "holding"
                        ? "bg-blue-50 border-blue-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >

                    <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                      {request.adminResponse}
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* Status Footer */}
            <div className="border-t border-gray-100 px-5 md:px-6 py-3 bg-slate-50/50">

              {request.status === "pending" && (

                <p className="text-xs text-amber-600">
                  Your request is waiting for admin review.
                </p>

              )}


              {request.status === "holding" && (

                <p className="text-xs text-blue-600">
                  The admin has placed this request on hold
                  for further review.
                </p>

              )}


              {request.status === "approved" && (

                <p className="text-xs text-green-600">
                  Your request has been approved.
                </p>

              )}


              {request.status === "rejected" && (

                <p className="text-xs text-red-600">
                  Your request has been rejected.
                </p>

              )}

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);return (
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ClipboardList size={22} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Task Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Track the task change requests you have submitted.
          </p>
        </div>

      </div>


      <button
        type="button"
        onClick={() => navigate("/staff/request")}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
      >
        <Plus size={17} />
        New Request
      </button>

    </div>


    {/* Empty State */}
    {requests.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ClipboardList size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No requests found
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          You have not submitted any task change requests yet.
        </p>


        <button
          type="button"
          onClick={() => navigate("/staff/request")}
          className="inline-flex items-center gap-2 mt-5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Submit Your First Request
        </button>

      </div>

    ) : (

      <div className="space-y-4">

        {requests.map((request) => (

          <div
            key={request._id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >

            {/* Request Header */}
            <div className="p-5 md:p-6">

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Task
                  </p>

                  <h2 className="text-lg font-semibold text-gray-900 mt-1">
                    {request.task?.title ||
                      "Task unavailable"}
                  </h2>


                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">

                    <Clock3 size={14} />

                    <span>
                      Submitted{" "}
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "Unknown"}
                    </span>

                  </div>

                </div>


                {/* Status */}
                <span
                  className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                    request.status === "holding"
                      ? "bg-blue-100 text-blue-700"
                      : getStatusStyle(
                          request.status
                        )
                  }`}
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


              {/* Reason */}
              <div className="mt-6">

                <div className="flex items-center gap-2 mb-2">

                  <MessageSquare
                    size={15}
                    className="text-gray-400"
                  />

                  <p className="text-sm font-semibold text-gray-700">
                    Your Reason
                  </p>

                </div>


                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                    {request.reason}
                  </p>

                </div>

              </div>


              {/* Admin Response */}
              {request.adminResponse && (

                <div className="mt-5">

                  <div className="flex items-center gap-2 mb-2">

                    <MessageSquare
                      size={15}
                      className="text-indigo-500"
                    />

                    <p className="text-sm font-semibold text-gray-700">
                      Admin Response
                    </p>

                  </div>


                  <div
                    className={`rounded-xl p-4 border ${
                      request.status === "approved"
                        ? "bg-green-50 border-green-100"
                        : request.status === "rejected"
                        ? "bg-red-50 border-red-100"
                        : request.status === "holding"
                        ? "bg-blue-50 border-blue-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >

                    <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                      {request.adminResponse}
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* Status Footer */}
            <div className="border-t border-gray-100 px-5 md:px-6 py-3 bg-slate-50/50">

              {request.status === "pending" && (

                <p className="text-xs text-amber-600">
                  Your request is waiting for admin review.
                </p>

              )}


              {request.status === "holding" && (

                <p className="text-xs text-blue-600">
                  The admin has placed this request on hold
                  for further review.
                </p>

              )}


              {request.status === "approved" && (

                <p className="text-xs text-green-600">
                  Your request has been approved.
                </p>

              )}


              {request.status === "rejected" && (

                <p className="text-xs text-red-600">
                  Your request has been rejected.
                </p>

              )}

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);

}

export default StaffMyRequests;