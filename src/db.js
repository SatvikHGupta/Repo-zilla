import { openDB } from "idb";

const DB_NAME = "repo-catalogue";
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // cached layer data
      if (!db.objectStoreNames.contains("layers"))
        db.createObjectStore("layers");
      // user actions - pins, shelf, tags, notes
      if (!db.objectStoreNames.contains("userdata"))
        db.createObjectStore("userdata");
      // uploaded summaries
      if (!db.objectStoreNames.contains("summaries"))
        db.createObjectStore("summaries");
      // cached readmes
      if (!db.objectStoreNames.contains("readmes"))
        db.createObjectStore("readmes");
    },
  });
}

export async function cacheLayer(layer, data) {
  const db = await getDB();
  await db.put("layers", data, `layer${layer}`);
}

export async function getCachedLayer(layer) {
  const db = await getDB();
  return db.get("layers", `layer${layer}`);
}

export async function getUserData(key) {
  const db = await getDB();
  const value = await db.get("userdata", key);
  return value || {};
}

export async function setUserData(key, value) {
  const db = await getDB();
  await db.put("userdata", value, key);
}

export async function getSummary(fullName) {
  const db = await getDB();
  return db.get("summaries", fullName);
}

export async function setSummary(fullName, content) {
  const db = await getDB();
  await db.put("summaries", content, fullName);
}

export async function getCachedReadme(fullName) {
  const db = await getDB();
  return db.get("readmes", fullName);
}

export async function setCachedReadme(fullName, content) {
  const db = await getDB();
  await db.put("readmes", content, fullName);
}