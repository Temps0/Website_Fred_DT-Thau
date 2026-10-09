#!/usr/bin/env node
// @ts-check
/**
 * Deletes form submissions: to answer an erasure request, or to apply the retention
 * periods of the privacy policy.
 *
 * Usage:
 *   node scripts/delete-submissions.mjs contact <id>                 one message (id from the export)
 *   node scripts/delete-submissions.mjs survey <id>                  one survey response
 *   node scripts/delete-submissions.mjs --email <address>            everything linked to an email
 *   node scripts/delete-submissions.mjs contact --older-than <days>  messages older than N days
 *   node scripts/delete-submissions.mjs survey --older-than <days>   responses older than N days
 * In the container, prefix with: docker compose exec web
 *
 * Deleted content is overwritten on disk (secure_delete), and the write-ahead log is then
 * checkpointed and emptied, since it still holds the old pages while the server runs.
 * Backups made before the deletion still contain the data.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const USAGE =
  'Usage: node scripts/delete-submissions.mjs <contact|survey> <id>\n' +
  '       node scripts/delete-submissions.mjs <contact|survey> --older-than <days>\n' +
  '       node scripts/delete-submissions.mjs --email <address>';

// Table and column names come from this fixed list, never from the command line.
const TABLES = {
  contact: { table: 'contact_messages', date: 'created_at' },
  survey: { table: 'survey_responses', date: 'submitted_on' },
};

/** @param {string} message */
function fail(message) {
  console.error(`${message}\n\n${USAGE}`);
  process.exit(2);
}

const databasePath = join(resolve(process.env.DATA_DIR ?? './data'), 'submissions.db');
if (!existsSync(databasePath)) {
  console.error(`No database at ${databasePath}: nothing to delete.`);
  process.exit(1);
}

const [first, second, third] = process.argv.slice(2);
const database = new DatabaseSync(databasePath);
database.exec('PRAGMA secure_delete = ON');

try {
  if (first === '--email') {
    const email = second?.trim().toLowerCase();
    if (!email) fail('Missing email address.');
    const messages = database
      .prepare('DELETE FROM contact_messages WHERE lower(email) = ?')
      .run(email).changes;
    // Survey answers are anonymous without the email: removing the email is enough.
    const responses = database
      .prepare('UPDATE survey_responses SET contact_email = NULL WHERE lower(contact_email) = ?')
      .run(email).changes;
    console.log(
      `Deleted ${messages} contact message(s); removed the email from ${responses} survey response(s).`,
    );
  } else if (first === 'contact' || first === 'survey') {
    const { table, date } = TABLES[first];
    if (second === '--older-than') {
      const days = Number(third);
      if (!Number.isInteger(days) || days < 1) fail('--older-than expects a whole number of days.');
      // ISO 8601 strings sort chronologically, for full timestamps and for plain dates.
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const limit = first === 'survey' ? cutoff.slice(0, 10) : cutoff;
      const deleted = database.prepare(`DELETE FROM ${table} WHERE ${date} < ?`).run(limit).changes;
      console.log(
        `Deleted ${deleted} ${first} entr${deleted === 1 ? 'y' : 'ies'} older than ${days} days.`,
      );
    } else {
      const id = Number(second);
      if (!Number.isInteger(id) || id < 1) fail('Expected the id shown in the export.');
      const deleted = database.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id).changes;
      console.log(deleted ? `Deleted ${first} entry ${id}.` : `No ${first} entry with id ${id}.`);
    }
  } else {
    fail('Unknown command.');
  }

  // Copy the changes into the database file and empty the WAL, which still holds the
  // deleted content. "busy" means the server was writing: the WAL could not be emptied.
  const { busy } = /** @type {{ busy: number }} */ (
    database.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get()
  );
  if (busy) {
    console.error(
      'Warning: the database was busy; deleted content may remain in the write-ahead log. ' +
        'Run the command again in a moment.',
    );
    process.exitCode = 1;
  }
} finally {
  database.close();
}
