export const getOutputPath = (
  filePath: string,
  newExtension: string
): string => {
  return `${filePath}.${newExtension}`;
};
