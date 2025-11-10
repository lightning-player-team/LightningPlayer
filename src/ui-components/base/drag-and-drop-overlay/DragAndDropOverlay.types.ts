export enum DragAndDropState {
  None,
  FileNotSupported,
  Processing,
}

export type DragAndDropResult = string[] | DragAndDropState;
