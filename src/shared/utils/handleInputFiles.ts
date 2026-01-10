import { SetStateAction, useSetAtom } from "jotai";

export const handleInputFiles = ({
  files,
  setInputFiles,
}: {
  files: FileList;
  setInputFiles: ReturnType<
    typeof useSetAtom<File[], [SetStateAction<File[]>], void>
  >;
}): File[] => {
  if (files.length <= 0) {
    console.error("handleInputFiles: empty.");
    return [];
  }
  const filteredFiles = [...files];
  setInputFiles(filteredFiles);
  console.log("handleInputFiles: ", filteredFiles);

  return filteredFiles;
};
