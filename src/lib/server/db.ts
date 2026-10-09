import { DATA_DIR } from 'astro:env/server';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Storage of form submissions in a single SQLite file under DATA_DIR (a Docker volume in
 * production). Statements are always parameterised: visitor input never reaches the SQL.
 */

let database: DatabaseSync | undefined;

function getDatabase(): DatabaseSync {
  if (!database) {
    const directory = resolve(DATA_DIR);
    mkdirSync(directory, { recursive: true });
    database = new DatabaseSync(join(directory, 'submissions.db'));
    database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL
      );
    `);
  }
  return database;
}

export interface ContactMessage {
  name: string;
  company: string;
  email: string;
  phone: string | null;
  message: string;
}

export function saveContactMessage(contact: ContactMessage): void {
  getDatabase()
    .prepare(
      `INSERT INTO contact_messages (created_at, name, company, email, phone, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      new Date().toISOString(),
      contact.name,
      contact.company,
      contact.email,
      contact.phone,
      contact.message,
    );
}
