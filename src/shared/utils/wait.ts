/** Time in milliseconds. */
export const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
