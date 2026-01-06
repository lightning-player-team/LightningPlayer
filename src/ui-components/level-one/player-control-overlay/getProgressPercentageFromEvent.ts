export const getProgressPercentageFromEvent = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  progressBarContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const progressBarContainer = progressBarContainerRef.current;
  if (!progressBarContainer) {
    return 0;
  }
  const rect = progressBarContainer.getBoundingClientRect();
  const percentage = (event.clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(1, percentage));
};
