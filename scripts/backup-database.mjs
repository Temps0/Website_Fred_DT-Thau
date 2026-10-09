#!/usr/bin/env node
// @ts-check
/**
 * Makes a consistent copy of the submissions database, using SQLite's online backup: the
 * server can keep running and writing meanwhile.
 *
 * Usage:
 *   node scripts/backup-database.mjs sauvegarde.db
 * Without a file name, the copy goes to standard output, e.g. from the container:
 *   docker compose exec -T web node scripts/backup-database.mjs > sauvegarde.db
 * Always give the file name on Windows: Windows PowerShell rewrites redirected output (>)
 * as UTF-16, which makes the backup unusable.
 *
 * Reads the database in DATA_DIR (default ./data). The copy contains personal data:
 * store it like the original.
 */
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';
import {
  assertOutsideDataDirectory,
  warnAboutWindowsRedirection,
  writeOrExplain,
} from './lib/output.mjs';

const [outputPath] = process.argv.slice(2);

const dataDirectory = resolve(process.env.DATA_DIR ?? './data');
const databasePath = join(dataDirectory, 'submissions.db');
if (!existsSync(databasePath)) {
  console.error(`No database at ${databasePath}: nothing to back up yet.`);
  process.exit(1);
}
if (!outputPath && process.stdout.isTTY) {
  console.error('Give a file name: node scripts/backup-database.mjs backup.db');
  process.exit(2);
}
if (outputPath) assertOutsideDataDirectory(outputPath, dataDirectory);

const directory = mkdtempSync(join(tmpdir(), 'dt-thau-backup-'));
const source = new DatabaseSync(databasePath, { readOnly: true });
try {
  const copyPath = join(directory, 'submissions.db');
  await backup(source, copyPath);
  // A standalone file: leave WAL mode, which needs side files to be opened, even read-only.
  const copy = new DatabaseSync(copyPath);
  copy.exec('PRAGMA journal_mode = DELETE');
  copy.close();

  if (outputPath) {
    if (writeOrExplain(outputPath, () => copyFileSync(copyPath, outputPath))) {
      console.error(`Backup written to ${outputPath}.`);
    }
  } else {
    warnAboutWindowsRedirection(
      'If you ran this in Windows PowerShell, the backup is unusable: run node scripts/backup-database.mjs backup.db instead.',
    );
    process.stdout.write(readFileSync(copyPath));
  }
} finally {
  source.close();
  rmSync(directory, { recursive: true, force: true });
}
