import { Command } from "@tauri-apps/plugin-shell";
import { VideoFileExtension } from "../../shared/types/fileExtensions";
import { getOutputPath } from "./getOutputPath";

export const transmuxVideo = async (
  inputPath: string,
  outputExtension: VideoFileExtension
): Promise<string> => {
  const outputPath = getOutputPath(inputPath, outputExtension);
  console.log(
    `Transmuxing video to ${outputExtension} container: ${inputPath} -> ${outputPath}`
  );
  const result = await Command.sidecar("binaries/ffmpeg", [
    ...`-loglevel error -y -i ${inputPath} -c copy ${outputPath}`.split(" "),
  ]).execute();
  console.log("ffmpeg output:", result);
  if (result.code !== 0) {
    throw new Error(
      `Error transmuxing video: ${inputPath} to ${outputPath}: ${result}`
    );
  }
  return outputPath;
};
