import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-7ZQN80R6XN";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackPage = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};

export const trackEvent = (
  category,
  action,
  value = null
) => {
  ReactGA.event({
    category,
    action,
    value,
  });
};