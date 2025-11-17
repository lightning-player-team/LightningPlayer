export const getFileExtension = (filePath: string): string | undefined => {
  const dotIndex = filePath.lastIndexOf(".");
  return dotIndex !== -1
    ? filePath.substring(dotIndex + 1).toLowerCase()
    : undefined;
};
