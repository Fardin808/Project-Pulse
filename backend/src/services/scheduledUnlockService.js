import Task from "../models/Task.js";
import Notification from "../models/Notification.js";


export const checkScheduledUnlocks = async () => {
  const tasks = await Task.find({
    dependency: { $ne: null },
    dependencyOriginalStartDate: { $ne: null },
    status: { $ne: "completed" },
  }).populate("dependency", "title status");

  const now = new Date();

  for (const task of tasks) {
    if (!task.dependency) continue;
    if (task.dependency.status === "completed") continue;

    const unlockDate = new Date(task.dependencyOriginalStartDate);

    if (
      Number.isNaN(unlockDate.getTime()) ||
      !Number.isInteger(task.dependencyOffsetDays) ||
      task.dependencyOffsetDays < 0
    ) {
      continue;
    }

    unlockDate.setUTCDate(
      unlockDate.getUTCDate() + task.dependencyOffsetDays
    );

    if (unlockDate > now) continue;


    // Recheck the latest task data before sending notifications
        const latestTask = await Task.findById(task._id);

        if (!latestTask) continue;

        if (
        latestTask.status === "completed" ||
        String(latestTask.dependency) !== String(task.dependency._id) ||
        latestTask.dependencyOriginalStartDate?.getTime() !==
            task.dependencyOriginalStartDate.getTime() ||
        latestTask.dependencyOffsetDays !== task.dependencyOffsetDays
        ) {
        continue;
        }

    const scheduleKey = [
      "scheduled_unlock",
      task._id,
      task.dependency._id,
      task.dependencyOriginalStartDate.getTime(),
      task.dependencyOffsetDays,
    ].join(":");

    // Create missing notifications without duplicating existing ones.
    const operations = task.assignedMembers.map((memberId) => ({
      updateOne: {
        filter: {
          eventKey: `${scheduleKey}:${memberId}`,
        },
        update: {
          $setOnInsert: {
            recipient: memberId,
            eventKey: `${scheduleKey}:${memberId}`,
            type: "task_ready",
            title: "Task Ready to Start",
            message: `Your task "${task.title}" is now ready to start because its scheduled unlock date has arrived.`,
            relatedTask: task._id,
            relatedProject: task.projectId,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Notification.bulkWrite(operations, { ordered: false });
    }

    await Task.updateOne(
      {
        _id: task._id,
        dependency: task.dependency._id,
        dependencyOriginalStartDate: task.dependencyOriginalStartDate,
        dependencyOffsetDays: task.dependencyOffsetDays,
      },
      {
        $set: { scheduledUnlockNotifiedAt: now },
      }
    );
  }
};
