import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { resolveDataDir } from "./ratingStore.js";

const schema = `
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_contact_messages_created
    ON contact_messages (created_at DESC);
`;

export function createContactStore({ dataDir } = {}) {
  const resolvedDataDir = resolveDataDir(dataDir);
  mkdirSync(resolvedDataDir, { recursive: true });

  const database = new DatabaseSync(
    path.join(resolvedDataDir, "fakhara-contact.sqlite")
  );

  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec(schema);

  const insertStatement = database.prepare(`
    INSERT INTO contact_messages (
      name,
      email,
      subject,
      message,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, 'new', ?)
  `);

  function saveMessage({ name, email, subject, message }) {
    const createdAt = new Date().toISOString();
    const result = insertStatement.run(
      name,
      email,
      subject,
      message,
      createdAt
    );

    return {
      id: Number(result.lastInsertRowid),
      createdAt,
    };
  }

  function close() {
    database.close();
  }

  return {
    saveMessage,
    close,
  };
}
