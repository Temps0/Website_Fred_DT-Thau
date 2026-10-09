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
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY,
        survey_id TEXT NOT NULL,
        submitted_on TEXT NOT NULL,
        answers TEXT NOT NULL,
        contact_email TEXT
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

export interface SurveyResponse {
  surveyId: string;
  /** Answers by question id; unanswered optional questions are left out. */
  answers: Record<string, string | string[] | number>;
  /** Only when the respondent ticked the consent box. */
  contactEmail: string | null;
}

export function saveSurveyResponse(response: SurveyResponse): void {
  // Day only (in Paris time), no time and no IP address: answers should not point back to
  // a person. The en-CA locale formats dates as YYYY-MM-DD.
  const submittedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(
    new Date(),
  );
  getDatabase()
    .prepare(
      `INSERT INTO survey_responses (survey_id, submitted_on, answers, contact_email)
       VALUES (?, ?, ?, ?)`,
    )
    .run(response.surveyId, submittedOn, JSON.stringify(response.answers), response.contactEmail);
}
