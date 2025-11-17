export const getOutputPath = (
  filePath: string,
  newExtension: string
): string => {
  const dotIndex = filePath.lastIndexOf(".");
  const pre = dotIndex !== -1 ? filePath.substring(0, dotIndex) : filePath;
  return `${pre}.temp.${newExtension}`;
};
