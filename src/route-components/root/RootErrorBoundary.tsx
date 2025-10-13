import { useRouteError } from "react-router";

export const RootErrorBoundary = () => {
  const error = useRouteError() as { message: string };
  return (
    <div>
      <h2>Root Error Boundary:</h2>
      <p>{JSON.stringify(error)}</p>
    </div>
  );
};
