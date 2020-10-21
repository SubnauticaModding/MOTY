import * as config from "../config.json";

/** Checks if a user has manager permissions for the event */
export function isManager(userId?: string) {
  if (!userId) return false;
  return config.ManagerIDs.includes(userId);
}