import { Link } from "react-router";
import { ROUTES } from "./routes";

export const Home = () => {
  return (
    <>
      <p>hello world</p>
      <Link to={ROUTES.player}>Go to player</Link>
    </>
  );
};
