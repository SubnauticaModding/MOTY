// TODO: Combine this with other data stuff somehow

import * as data from "./data";

type Author = {
  id: string,
  discordids: string,
  name?: string,
  icon?: string,
  remove?: boolean,
};

/** Gets an author from the database by their id */
export function getAuthor(authorId: string): Author {
  return data.getObject("authors", authorId);
};

/** Gets all authors from the database */
export function getAuthors(): Author[] {
  return data.getObjects("authors");
};

/** Removes an author from the database by their id */
export function removeAuthor(authorId: string) {
  data.removeObject("authors", authorId);
};

/** Adds or replaces an author in the database */
export function setAuthor(authorId: string, discordIds: string, name: string, icon: string) {
  setAuthorObject({
    id: authorId,
    discordids: discordIds,
    name: name,
    icon: icon,
  });
};

/** Adds or replaces an author in the database */
export function setAuthorObject(object: Author) {
  data.setObject("authors", object.id, object);
}