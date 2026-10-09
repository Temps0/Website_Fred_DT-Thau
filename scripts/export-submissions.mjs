#!/usr/bin/env node
// @ts-check
/**
 * Exports form submissions as CSV, ready for a spreadsheet: semicolon separators and a
 * UTF-8 byte order mark, as French Excel expects.
 *
 * Usage:
 *   node scripts/export-submissions.mjs contact messages.csv
 *   node scripts/export-submissions.mjs survey reponses.csv
 * Without a file name, the CSV goes to standard output, e.g. from the container:
 *   docker compose exec -T web node scripts/export-submissions.mjs survey > reponses.csv
 * Always give the file name on Windows: Windows PowerShell rewrites redirected output (>)
 * as UTF-16, which spreadsheets misread.
 *
 * Reads the database in DATA_DIR (default ./data), read-only.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  assertOutsideDataDirectory,
  warnAboutWindowsRedirection,
  writeOrExplain,
} from './lib/output.mjs';

const [kind, outputPath] = process.argv.slice(2);
if (kind !== 'contact' && kind !== 'survey') {
  console.error('Usage: node scripts/export-submissions.mjs <contact|survey> [file.csv]');
  process.exit(2);
}

const dataDirectory = resolve(process.env.DATA_DIR ?? './data');
const databasePath = join(dataDirectory, 'submissions.db');
if (!existsSync(databasePath)) {
  console.error(`No database at ${databasePath}: nothing has been submitted yet.`);
  process.exit(1);
}
if (outputPath) assertOutsideDataDirectory(outputPath, dataDirectory);

/**
 * Formats one CSV cell. Values starting with a formula character are prefixed with an
 * apostrophe, so a spreadsheet never runs a formula typed by a visitor (CSV injection).
 * @param {unknown} value
 */
function cell(value) {
  if (value === null || value === undefined) return '';
  let text = Array.isArray(value) ? value.join(' | ') : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const parisTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Paris',
  dateStyle: 'short',
  timeStyle: 'short',
});

/**
 * Stored timestamps are UTC (ISO 8601); show them in Paris time, e.g. 2026-10-09 09:29.
 * @param {unknown} iso
 */
function localTime(iso) {
  return parisTime.format(new Date(String(iso)));
}

/** @param {unknown[][]} rows */
function toCsv(rows) {
  return `﻿${rows.map((row) => row.map(cell).join(';')).join('\r\n')}\r\n`;
}

/** @returns {unknown[][]} header row, then one row per contact message */
function contactRows() {
  const columns = ['id', 'created_at', 'name', 'company', 'email', 'phone', 'message'];
  const messages = database
    .prepare(`SELECT ${columns.join(', ')} FROM contact_messages ORDER BY id`)
    .all();
  return [
    ['N°', 'Date', 'Nom', 'Entreprise', 'E-mail', 'Téléphone', 'Message'],
    ...messages.map((message) =>
      columns.map((column) =>
        column === 'created_at' ? localTime(message[column]) : message[column],
      ),
    ),
  ];
}

/** @returns {unknown[][]} header row, then one row per survey response */
function surveyRows() {
  /** @typedef {{ id: number, survey_id: string, submitted_on: string, answers: string, contact_email: string | null }} SurveyRow */
  const rows = /** @type {SurveyRow[]} */ (
    /** @type {unknown} */ (
      database
        .prepare(
          'SELECT id, survey_id, submitted_on, answers, contact_email FROM survey_responses ORDER BY id',
        )
        .all()
    )
  );
  const responses = rows.map((row) => ({
    ...row,
    /** @type {Record<string, unknown>} */ answers: JSON.parse(row.answers),
  }));
  // One column per question id, in order of first appearance.
  const questionIds = [...new Set(responses.flatMap((response) => Object.keys(response.answers)))];
  return [
    ['N°', 'Questionnaire', 'Date', 'E-mail (consentement)', ...questionIds],
    ...responses.map((response) => [
      response.id,
      response.survey_id,
      response.submitted_on,
      response.contact_email,
      ...questionIds.map((id) => response.answers[id]),
    ]),
  ];
}

const database = new DatabaseSync(databasePath, { readOnly: true });
try {
  const rows = kind === 'contact' ? contactRows() : surveyRows();
  const csv = toCsv(rows);
  const count = rows.length - 1;
  const what = kind === 'contact' ? 'contact message(s)' : 'survey response(s)';

  if (outputPath) {
    if (writeOrExplain(outputPath, () => writeFileSync(outputPath, csv, 'utf8'))) {
      console.error(`Exported ${count} ${what} to ${outputPath}.`);
    }
  } else {
    warnAboutWindowsRedirection(
      `Give the file name instead: node scripts/export-submissions.mjs ${kind} export.csv`,
    );
    process.stdout.write(csv);
    // On standard error, so that it never ends up in the CSV.
    console.error(`Exported ${count} ${what}.`);
  }
} finally {
  database.close();
}
