#!/usr/bin/env node
// @ts-check
/**
 * Replaces the submissions database with a backup made by backup-database.mjs. Uses
 * SQLite's backup API, which rewrites the database and its journal consistently.
 * Stop the server first.
 *
 * Usage:
 *   node scripts/restore-database.mjs <backup.db>
 * In the container (the backup file mounted read-only):
 *   docker compose stop web
 *   docker compose run --rm --no-deps -v "$PWD/sauvegarde.db:/restore.db:ro" web \
 *     node scripts/restore-database.mjs /restore.db
 *   docker compose start web
 */
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';

const [backupPath] = process.argv.slice(2);
if (!backupPath || !existsSync(backupPath)) {
  console.error('Usage: node scripts/restore-database.mjs <backup.db> (file not found)');
  process.exit(2);
}

// Work on a private copy: the backup may be mounted read-only, where SQLite cannot open a
// WAL-mode file, and the original must stay untouched.
const workDirectory = mkdtempSync(join(tmpdir(), 'dt-thau-restore-'));
const workCopy = join(workDirectory, 'restore.db');
copyFileSync(backupPath, workCopy);
const source = new DatabaseSync(workCopy, { readOnly: true });
try {
  /** @returns {boolean} */
  const isValidBackup = () => {
    try {
      const { integrity_check: integrity } = /** @type {{ integrity_check: string }} */ (
        source.prepare('PRAGMA integrity_check').get()
      );
      const tables = source
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => row.name);
      return integrity === 'ok' && tables.includes('contact_messages');
    } catch {
      return false; // Not a SQLite file at all.
    }
  };
  if (!isValidBackup()) {
    console.error(`${backupPath} is not a valid submissions backup: nothing was changed.`);
    process.exitCode = 1;
  } else {
    const directory = resolve(process.env.DATA_DIR ?? './data');
    mkdirSync(directory, { recursive: true });
    await backup(source, join(directory, 'submissions.db'));
    console.log(`Restored ${backupPath} into ${join(directory, 'submissions.db')}.`);
  }
} finally {
  source.close();
  rmSync(workDirectory, { recursive: true, force: true });
}
