
import Task from "../models/Task.js";
import Risk from "../models/Risk.js";

export const checkOverdueTasks = async () => {
  const now = new Date();

  // Find tasks that have passed their deadlines
  const overdueTasks = await Task.find({
    dueDate: { $lt: now },
    status: { $ne: "completed" },
  });

  let detected = 0;
  let resolved = 0;

  // Create or reactivate overdue risks
  for (const task of overdueTasks) {
    const existingRisk = await Risk.findOne({
      taskId: task._id,
      type: "overdue",
    });

    if (existingRisk?.status === "active") {
      continue;
    }

    await Risk.findOneAndUpdate(
      {
        taskId: task._id,
        type: "overdue",
      },
      {
        $set: {
          projectId: task.projectId,
          createdBy: task.createdBy,
          severity: "high",
          message: `Task "${task.title}" is overdue.`,
          status: "active",
          resolvedAt: null,
          detectedAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    detected++;
  }

  // Find overdue risks that are currently active
  const activeRisks = await Risk.find({
    type: "overdue",
    status: "active",
  });

  // Resolve risks when their overdue condition no longer exists
  for (const risk of activeRisks) {
    const task = await Task.findById(risk.taskId);

    const stillOverdue =
      task &&
      task.dueDate &&
      task.dueDate < now &&
      task.status !== "completed";

    if (!stillOverdue) {
      await Risk.findByIdAndUpdate(risk._id, {
        status: "resolved",
        resolvedAt: now,
      });

      resolved++;
    }
  }

  return {
    checkedAt: now,
    overdueTasks: overdueTasks.length,
    detected,
    resolved,
  };
};


export const checkNoProgressTasks = async () => {
  const now = new Date();

  const threshold = new Date(
    now.getTime() - 3 * 24 * 60 * 60 * 1000
  );

  const monitoredStatuses = [
    "inprogress",
    "blocked",
    "review",
    "testing",
  ];

  const tasks = await Task.find({
    status: { $in: monitoredStatuses },
  });

  let detected = 0;
  let resolved = 0;

  // Detect tasks with no recent progress
  for (const task of tasks) {
    const lastProgress = task.lastProgressAt || task.createdAt;

    if (!lastProgress || lastProgress > threshold) {
      continue;
    }

    const existingRisk = await Risk.findOne({
      taskId: task._id,
      type: "no_progress",
    });

    if (existingRisk?.status === "active") {
      continue;
    }

    await Risk.findOneAndUpdate(
      {
        taskId: task._id,
        type: "no_progress",
      },
      {
        $set: {
          projectId: task.projectId,
          createdBy: task.createdBy,
          severity: "medium",
          message: `Task "${task.title}" has had no progress for at least 3 days.`,
          status: "active",
          detectedAt: now,
          resolvedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    detected++;
  }

  // Resolve risks when progress resumes
  const activeRisks = await Risk.find({
    type: "no_progress",
    status: "active",
  });

  for (const risk of activeRisks) {
    const task = await Task.findById(risk.taskId);

    const lastProgress = task
      ? task.lastProgressAt || task.createdAt
      : null;

    const stillInactive =
      task &&
      monitoredStatuses.includes(task.status) &&
      lastProgress &&
      lastProgress <= threshold;

    if (!stillInactive) {
      await Risk.findByIdAndUpdate(risk._id, {
        status: "resolved",
        resolvedAt: now,
      });

      resolved++;
    }
  }

  return {
    checkedAt: now,
    detected,
    resolved,
  };
};


export const checkDependencyRisks = async () => {
  const now = new Date();
  const threshold = new Date(
    now.getTime() + 2 * 24 * 60 * 60 * 1000
  );

  const tasks = await Task.find({
    dependency: { $ne: null },
    status: { $ne: "completed" },
  }).populate("dependency", "status");

  let detected = 0;
  let resolved = 0;

  for (const task of tasks) {
    const prerequisite = task.dependency;

    // Match the existing dependency unlock rules
    const completed = prerequisite?.status === "completed";

    let unlockedByDate = false;

    if (task.dependencyOriginalStartDate) {
      const offset = Number(task.dependencyOffsetDays);

      if (Number.isInteger(offset) && offset >= 0) {
        const unlockDate = new Date(
          task.dependencyOriginalStartDate
        );

        if (!Number.isNaN(unlockDate.getTime())) {
          unlockDate.setUTCDate(
            unlockDate.getUTCDate() + offset
          );

          unlockedByDate = now >= unlockDate;
        }
      }
    }

    const stillLocked = !completed && !unlockedByDate;

    const deadlineApproaching =
      task.dueDate &&
      task.dueDate <= threshold;

    if (!stillLocked || !deadlineApproaching) {
      continue;
    }

    const existingRisk = await Risk.findOne({
      taskId: task._id,
      type: "dependency_risk",
    });

    if (existingRisk?.status === "active") {
      continue;
    }

    await Risk.findOneAndUpdate(
      {
        taskId: task._id,
        type: "dependency_risk",
      },
      {
        $set: {
          projectId: task.projectId,
          createdBy: task.createdBy,
          type: "dependency_risk",
          severity: "high",
          message: `Task "${task.title}" is blocked by an unfinished dependency and its deadline is approaching.`,
          status: "active",
          detectedAt: now,
          resolvedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    detected++;
  }

  // Resolve risks when dependency is unlocked or deadline changes
  const activeRisks = await Risk.find({
    type: "dependency_risk",
    status: "active",
  });

  for (const risk of activeRisks) {
    const task = await Task.findById(risk.taskId)
      .populate("dependency", "status");

    if (!task || task.status === "completed" || !task.dependency) {
      await Risk.findByIdAndUpdate(risk._id, {
        status: "resolved",
        resolvedAt: now,
      });
      resolved++;
      continue;
    }

    const completed = task.dependency?.status === "completed";

    let unlockedByDate = false;

    if (task.dependencyOriginalStartDate) {
      const offset = Number(task.dependencyOffsetDays);

      if (Number.isInteger(offset) && offset >= 0) {
        const unlockDate = new Date(
          task.dependencyOriginalStartDate
        );

        if (!Number.isNaN(unlockDate.getTime())) {
          unlockDate.setUTCDate(
            unlockDate.getUTCDate() + offset
          );

          unlockedByDate = now >= unlockDate;
        }
      }
    }

    const deadlineApproaching =
      task.dueDate &&
      task.dueDate <= threshold;

    if (completed || unlockedByDate || !deadlineApproaching) {
      await Risk.findByIdAndUpdate(risk._id, {
        status: "resolved",
        resolvedAt: now,
      });
      resolved++;
    }
  }

  return {
    checkedAt: now,
    detected,
    resolved,
  };
};

export const checkEffortAnomalies = async () => {
  const now = new Date();

  const tasks = await Task.find({
    estimatedHours: { $gt: 0 },
    actualHours: { $gt: 0 },
  });

  let detected = 0;
  let resolved = 0;
  let updated = 0;

  const riskyTaskIds = new Set();

  for (const task of tasks) {
    const ratio = task.actualHours / task.estimatedHours;

    if (ratio <= 1.25) {
      continue;
    }

    riskyTaskIds.add(String(task._id));

    let severity = "medium";

    if (ratio > 2) {
      severity = "critical";
    } else if (ratio > 1.5) {
      severity = "high";
    }

    const message =
      `Task "${task.title}" has used ${task.actualHours} hours ` +
      `against an estimate of ${task.estimatedHours} hours.`;

    const existingRisk = await Risk.findOne({
      taskId: task._id,
      type: "effort_anomaly",
    });

    if (existingRisk?.status === "active") {
      if (
        existingRisk.severity !== severity ||
        existingRisk.message !== message
      ) {
        await Risk.findByIdAndUpdate(existingRisk._id, {
          severity,
          message,
        });

        updated++;
      }

      continue;
    }

    await Risk.findOneAndUpdate(
      {
        taskId: task._id,
        type: "effort_anomaly",
      },
      {
        $set: {
          projectId: task.projectId,
          createdBy: task.createdBy,
          severity,
          message,
          status: "active",
          detectedAt: now,
          resolvedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    detected++;
  }

  // Resolve risks when effort returns within the threshold
  const activeRisks = await Risk.find({
    type: "effort_anomaly",
    status: "active",
  });

  for (const risk of activeRisks) {
    if (riskyTaskIds.has(String(risk.taskId))) {
      continue;
    }

    await Risk.findByIdAndUpdate(risk._id, {
      status: "resolved",
      resolvedAt: now,
    });

    resolved++;
  }

  return {
    checkedAt: now,
    detected,
    updated,
    resolved,
  };
};


export const checkTeamBottlenecks = async () => {
  const now = new Date();

  const activeStatuses = [
    "backlog",
    "todo",
    "inprogress",
    "blocked",
    "review",
    "testing",
  ];

  const tasks = await Task.find({
    status: { $in: activeStatuses },
    assignedMembers: { $exists: true, $ne: [] },
  });

  const memberTasks = new Map();

  // Count active tasks assigned to each staff member
  for (const task of tasks) {
    for (const memberId of task.assignedMembers || []) {
      const key = String(memberId);

      if (!memberTasks.has(key)) {
        memberTasks.set(key, []);
      }

      memberTasks.get(key).push(task);
    }
  }

  const riskyTasks = new Map();

  for (const [memberId, assignedTasks] of memberTasks) {
    const count = assignedTasks.length;

    if (count <= 4) {
      continue;
    }

    const severity = count > 8 ? "critical" : "high";

    for (const task of assignedTasks) {
      const taskId = String(task._id);

      const existing = riskyTasks.get(taskId);

      // Keep the highest severity when multiple staff are overloaded
      if (
        !existing ||
        (severity === "critical" && existing.severity !== "critical")
      ) {
        riskyTasks.set(taskId, {
          task,
          severity,
          message: `Task "${task.title}" is assigned to a team member with ${count} active tasks, creating a potential workload bottleneck.`,
        });
      }
    }
  }

  let detected = 0;
  let updated = 0;
  let resolved = 0;

  // Create or update bottleneck risks
  for (const { task, severity, message } of riskyTasks.values()) {
    const existingRisk = await Risk.findOne({
      taskId: task._id,
      type: "team_bottleneck",
    });

    if (existingRisk?.status === "active") {
      if (
        existingRisk.severity !== severity ||
        existingRisk.message !== message
      ) {
        await Risk.findByIdAndUpdate(existingRisk._id, {
          severity,
          message,
        });

        updated++;
      }

      continue;
    }

    await Risk.findOneAndUpdate(
      {
        taskId: task._id,
        type: "team_bottleneck",
      },
      {
        $set: {
          projectId: task.projectId,
          createdBy: task.createdBy,
          severity,
          message,
          status: "active",
          detectedAt: now,
          resolvedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    detected++;
  }

  // Resolve risks when workload decreases
  const activeRisks = await Risk.find({
    type: "team_bottleneck",
    status: "active",
  });

  for (const risk of activeRisks) {
    if (riskyTasks.has(String(risk.taskId))) {
      continue;
    }

    await Risk.findByIdAndUpdate(risk._id, {
      status: "resolved",
      resolvedAt: now,
    });

    resolved++;
  }

  return {
    checkedAt: now,
    detected,
    updated,
    resolved,
  };
};
