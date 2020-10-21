import * as data from "./data";

type User = {
  id: string,
  votes: string[],
};

/** Gets a user from the database by their id */
export function getUser(userId: string): User {
  return data.getObject("users", userId);
};

/** Gets all users from the database */
export function getUsers(): User[] {
  return data.getObjects("users");
};

/** Removes a user from the database by their id */
export function removeUser(userId: string) {
  data.removeObject("users", userId);
};

/** Adds or replaces a user in the database */
export function setUser(userId: string, votes: string[]) {
  setUserObject({
    id: userId,
    votes: votes,
  });
};

/** Adds or replaces a user in the database */
export function setUserObject(object: User) {
  data.setObject("users", object.id, object);
}