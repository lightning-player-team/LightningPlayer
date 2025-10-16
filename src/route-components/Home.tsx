import { Link } from "react-router";
import { ROUTES } from "./routes";
import { FC } from "react";

export const Home: FC = () => {
  return (
    <>
      <p>hello world</p>
      <Link to={ROUTES.player}>Go to player</Link>
    </>
  );
};
