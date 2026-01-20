export const getDeadlineStatus = (deadline: string | Date | null | undefined) => {
  if (!deadline) return null;

  const today = new Date();
  const targetDate = new Date(deadline);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Delayed", color: "error", days: diffDays };
  if (diffDays <= 3)
    return { label: "Critical", color: "critical", days: diffDays };
  if (diffDays <= 7)
    return { label: "Approaching", color: "warning", days: diffDays };
  return { label: "There’s still time", color: "safe", days: diffDays };
};
