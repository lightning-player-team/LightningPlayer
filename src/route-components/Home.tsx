import { useAtomValue } from "jotai";
import { FC } from "react";
import { Link } from "react-router";
import { titleBarPinnedState } from "../shared/settings/titleBarPinnedState";
import { titleBarPlaceholderStyles } from "./Home.styles";
import { ROUTES } from "./routes";

export const Home: FC = () => {
  const isTitleBarPinned = useAtomValue(titleBarPinnedState);
  return (
    <>
      {isTitleBarPinned && <div css={titleBarPlaceholderStyles} />}
      <p>hello world</p>
      <Link to={ROUTES.player}>Go to player</Link>
    </>
  );
};
