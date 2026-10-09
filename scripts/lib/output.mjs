// @ts-check
/** Helpers shared by the data scripts to write their output files safely. */
import { isAbsolute, relative, resolve, sep } from 'node:path';

/**
 * Refuses an output path inside the data directory: a typo must never overwrite the
 * database with an export or a backup.
 * @param {string} outputPath
 * @param {string} dataDirectory
 */
export function assertOutsideDataDirectory(outputPath, dataDirectory) {
  const path = relative(resolve(dataDirectory), resolve(outputPath));
  const outside = path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path);
  if (!outside) {
    console.error(
      `Refusing to write into the data directory (${dataDirectory}): choose another file name.`,
    );
    process.exit(2);
  }
}

/**
 * Runs a file write, and explains a locked or read-only file (typically a CSV still open
 * in Excel) instead of crashing with a stack trace. Returns false (exit code 1) then.
 * @param {string} outputPath
 * @param {() => void} write
 * @returns {boolean}
 */
export function writeOrExplain(outputPath, write) {
  try {
    write();
    return true;
  } catch (error) {
    const code = /** @type {NodeJS.ErrnoException} */ (error).code;
    if (code === 'EBUSY' || code === 'EPERM' || code === 'EACCES') {
      console.error(
        `Cannot write ${outputPath}: the file is open in another program (Excel, for ` +
          'instance) or read-only. Close it and run the command again.',
      );
      process.exitCode = 1;
      return false;
    }
    if (code === 'ENOENT') {
      console.error(`Cannot write ${outputPath}: the folder does not exist.`);
      process.exitCode = 1;
      return false;
    }
    throw error;
  }
}

/**
 * Windows PowerShell rewrites redirected output (">") as UTF-16: a CSV is then misread by
 * spreadsheets and a backup is unusable. Warn when output is redirected on Windows.
 * @param {string} advice what to run instead
 */
export function warnAboutWindowsRedirection(advice) {
  if (process.platform === 'win32' && !process.stdout.isTTY) {
    console.error(`Warning: on Windows, PowerShell redirection (>) alters the output. ${advice}`);
  }
}
