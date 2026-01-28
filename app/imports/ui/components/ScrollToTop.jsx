import { useEffect } from "react";
import { withRouter } from "react-router-dom";

/**
 * ScrollToTop component that scrolls to the top of the page whenever the route changes
 * Wraps the Router to ensure every page navigation starts at the top
 */
const ScrollToTop = ({ history }) => {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return unlisten;
  }, [history]);

  return null;
};

export default withRouter(ScrollToTop);
