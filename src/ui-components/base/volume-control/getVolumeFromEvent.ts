/**
 * Calculates volume (0-100) from mouse position relative to slider.
 * Returns undefined if the slider ref is not available or has zero width.
 */
export const getVolumeFromEvent = ({
  event,
  sliderRef,
}: {
  event: MouseEvent | React.MouseEvent;
  sliderRef: React.RefObject<HTMLDivElement | null>;
}): number | undefined => {
  if (!sliderRef.current) return undefined;
  const rect = sliderRef.current.getBoundingClientRect();
  if (rect.width === 0) return undefined;
  const percentage = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width)
  );
  return Math.round(percentage * 100);
};
