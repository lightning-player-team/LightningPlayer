import { useRouteError } from "react-router";

export const RootErrorBoundary = () => {
  // TODO: improve unsafe type assertion.
  const error = useRouteError() as { message: string };
  return (
    <div>
      <h2>Root Error Boundary:</h2>
      <p>{JSON.stringify(error)}</p>
    </div>
  );
};
