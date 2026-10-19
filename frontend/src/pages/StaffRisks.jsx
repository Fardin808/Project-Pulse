
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Clock3,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getRisks } from "../services/riskService";

const riskLabels = {
  overdue: "Overdue Task",
  no_progress: "No Recent Progress",
  dependency_risk: "Dependency Risk",
  effort_anomaly: "Effort Estimation",
  team_bottleneck: "Team Bottleneck",
};

const severityStyles = {
  low: "bg-blue-50 text-blue-700",
  medium: "bg-yellow-50 text-yellow-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

export default function StaffRisks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRisks();
      setRisks(data);
    } catch (err) {
      setError(err.message || "Failed to load risks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const activeRisks = risks.filter(
    (risk) => risk.status === "active"
  );

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const matchesStatus =
        statusFilter === "all" ||
        risk.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        risk.type === typeFilter;

      return matchesStatus && matchesType;
    });
  }, [risks, statusFilter, typeFilter]);

  const highPriorityCount = activeRisks.filter(
    (risk) =>
      risk.severity === "high" ||
      risk.severity === "critical"
  ).length;

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Task Risks
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor risks affecting your assigned tasks.
            </p>
          </div>

          <button
            onClick={fetchRisks}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-5">
            <AlertTriangle className="text-orange-500" size={22} />
            <p className="text-sm text-gray-500 mt-3">
              Active Risks
            </p>
            <h2 className="text-3xl font-bold mt-1">
              {activeRisks.length}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <Clock3 className="text-red-500" size={22} />
            <p className="text-sm text-gray-500 mt-3">
              High / Critical
            </p>
            <h2 className="text-3xl font-bold mt-1">
              {highPriorityCount}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <ShieldCheck className="text-green-600" size={22} />
            <p className="text-sm text-gray-500 mt-3">
              Resolved Risks
            </p>
            <h2 className="text-3xl font-bold mt-1">
              {risks.filter((r) => r.status === "resolved").length}
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white text-sm"
          >
            <option value="active">Active Risks</option>
            <option value="resolved">Resolved Risks</option>
            <option value="all">All Risks</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white text-sm"
          >
            <option value="all">All Risk Types</option>
            {Object.entries(riskLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk list */}
        {loading ? (
          <p className="text-gray-500">Loading risks...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredRisks.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            No risks found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRisks.map((risk) => (
              <div
                key={risk._id}
                className="bg-white border rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {risk.taskId?.title || "Deleted Task"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {risk.projectId?.title || "Unknown Project"}
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        severityStyles[risk.severity] || ""
                      }`}
                    >
                      {risk.severity}
                    </span>

                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {risk.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  {riskLabels[risk.type] || risk.type}
                </p>

                <p className="text-sm text-gray-700 mt-2">
                  {risk.type === "team_bottleneck"
                    ? "Your assigned workload may be too high. Review your active tasks with your Admin."
                    : risk.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
