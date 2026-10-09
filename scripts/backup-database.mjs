#!/usr/bin/env node
// @ts-check
/**
 * Writes a consistent copy of the submissions database to standard output, using SQLite's
 * online backup: the server can keep running and writing meanwhile.
 *
 * Usage:
 *   node scripts/backup-database.mjs > sauvegarde.db
 * In the container:
 *   docker compose exec -T web node scripts/backup-database.mjs > sauvegarde.db
 *
 * Reads the database in DATA_DIR (default ./data). The copy contains personal data:
 * store it like the original.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';

const databasePath = join(resolve(process.env.DATA_DIR ?? './data'), 'submissions.db');
if (!existsSync(databasePath)) {
  console.error(`No database at ${databasePath}: nothing to back up yet.`);
  process.exit(1);
}
if (process.stdout.isTTY) {
  console.error('Redirect the output to a file: node scripts/backup-database.mjs > backup.db');
  process.exit(2);
}

const directory = mkdtempSync(join(tmpdir(), 'dt-thau-backup-'));
const source = new DatabaseSync(databasePath, { readOnly: true });
try {
  const copyPath = join(directory, 'submissions.db');
  await backup(source, copyPath);
  // A standalone file: leave WAL mode, which needs side files to be opened, even read-only.
  const copy = new DatabaseSync(copyPath);
  copy.exec('PRAGMA journal_mode = DELETE');
  copy.close();
  process.stdout.write(readFileSync(copyPath));
} finally {
  source.close();
  rmSync(directory, { recursive: true, force: true });
}
