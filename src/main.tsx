import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Home } from "./route-components/Home";
import { Player } from "./route-components/Player";
import { Root } from "./route-components/root/Root";
import { RootErrorBoundary } from "./route-components/root/RootErrorBoundary";
import { ROUTES } from "./route-components/routes";

const router = createBrowserRouter([
  {
    path: ROUTES.root,
    errorElement: <RootErrorBoundary />,
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: ROUTES.player, Component: Player },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
