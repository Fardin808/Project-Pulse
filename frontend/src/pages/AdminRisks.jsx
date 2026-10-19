
import { useEffect, useMemo, useState } from "react";
import { getRisks } from "../services/riskService";
import DashboardLayout from "../components/layout/DashboardLayout";

const riskLabels = {
  overdue: "Overdue Task",
  no_progress: "No Recent Progress",
  dependency_risk: "Dependency Risk",
  effort_anomaly: "Effort Estimation",
  team_bottleneck: "Team Bottleneck",
};

const severityStyles = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AdminRisks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("active");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const data = await getRisks();
        setRisks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, []);

  const activeRisks = risks.filter(
    (risk) => risk.status === "active"
  );

  const summary = {
    total: activeRisks.length,
    medium: activeRisks.filter(
      (risk) => risk.severity === "medium"
    ).length,
    high: activeRisks.filter(
      (risk) => risk.severity === "high"
    ).length,
    critical: activeRisks.filter(
      (risk) => risk.severity === "critical"
    ).length,
  };

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const matchesStatus =
        statusFilter === "all" || risk.status === statusFilter;

      const matchesType =
        typeFilter === "all" || risk.type === typeFilter;

      const matchesSeverity =
        severityFilter === "all" ||
        risk.severity === severityFilter;

      return matchesStatus && matchesType && matchesSeverity;
    });
  }, [risks, statusFilter, typeFilter, severityFilter]);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading risks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Risk Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor potential problems across your projects.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Risks", value: summary.total },
          { label: "Medium", value: summary.medium },
          { label: "High", value: summary.high },
          { label: "Critical", value: summary.critical },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item.label}
            </p>
            <p className="text-3xl font-semibold mt-2 text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="all">All Statuses</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">All Risk Types</option>
          {Object.entries(riskLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Risk table */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Risk Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredRisks.map((risk) => (
              <tr key={risk._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {risk.taskId?.title || "Deleted Task"}
                </td>

                <td className="px-4 py-3">
                  {risk.projectId?.title || "Unknown Project"}
                </td>

                <td className="px-4 py-3">
                  {riskLabels[risk.type] || risk.type}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      severityStyles[risk.severity] || ""
                    }`}
                  >
                    {risk.severity}
                  </span>
                </td>

                <td className="px-4 py-3 capitalize">
                  {risk.status}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {risk.message}
                </td>
              </tr>
            ))}

            {filteredRisks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No risks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </DashboardLayout>
  );
}
