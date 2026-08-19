// The only calls this proxy will pass on to Calibrate. Anything else is
// refused, so the API key here cannot be used to touch the rest of the
// workspace (agents, tests, evaluators, or any delete).
const UUID = "[0-9a-fA-F-]{36}";

const ROUTES = [
  "GET /annotators",
  "POST /annotators",
  "GET /annotation-tasks",
  `GET /annotation-tasks/${UUID}/jobs`,
  `POST /annotation-tasks/${UUID}/jobs`,
].map((route) => new RegExp(`^${route}$`));

export function isAllowed(method, path) {
  return ROUTES.some((route) => route.test(`${method} ${path}`));
}
