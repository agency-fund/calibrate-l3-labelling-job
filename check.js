// Checks the proxy's list of allowed calls. Run: node check.js
import assert from "node:assert";
import { isAllowed } from "./api/_allowed.js";

const ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

for (const [method, path] of [
  ["GET", "/annotators"],
  ["POST", "/annotators"],
  ["GET", "/annotation-tasks"],
  ["GET", `/annotation-tasks/${ID}`],
  ["POST", `/annotation-tasks/${ID}/jobs`],
]) assert.equal(isAllowed(method, path), true, `should allow ${method} ${path}`);

for (const [method, path] of [
  ["DELETE", `/annotation-tasks/${ID}/jobs`],
  ["DELETE", `/annotation-tasks/${ID}/jobs/${ID}`],
  ["GET", "/agents"],
  ["GET", "/evaluators"],
  ["GET", `/annotation-tasks/${ID}/items`],
  ["GET", `/annotation-tasks/${ID}/jobs`],
  ["POST", `/annotation-tasks/${ID}/jobs/extra`],
  ["GET", "/annotators/../agents"],
  ["GET", "/annotatorsX"],
]) assert.equal(isAllowed(method, path), false, `should refuse ${method} ${path}`);

console.log("allowed-call list is correct");
