// Roster file parsing — turns a teacher's class list (Excel, CSV, TSV, text
// or a straight paste) into clean "First Last" lines for the Add-students
// dialog. Runs entirely in the browser; Excel formats are parsed with
// SheetJS, lazily imported so it only loads when an Excel file is dropped.
//
// Handles the exports real schools produce: SIMS/Bromcom/Arbor CSVs with
// "First name / Last name" (or Forename/Surname) columns, single
// "Pupil name" columns, spreadsheets with extra columns (email, DOB, UPN…)
// and plain typed lists. Junk rows (headers, emails, numbers, blank lines)
// are filtered out.

export const ROSTER_ACCEPT = '.csv,.tsv,.txt,.xlsx,.xls,.ods';

const EXCEL_EXT = /\.(xlsx|xls|ods)$/i;

/** true when the file needs SheetJS (binary Excel formats) */
export function isExcelFile(name: string): boolean {
  return EXCEL_EXT.test(name);
}

/** Split a single text blob (CSV/TSV/paste) into rows of cells */
export function textToRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // tab-separated (Excel clipboard) wins if present, then comma, then
      // semicolon (some European exports), then 2+ spaces
      if (line.includes('\t')) return line.split('\t');
      if (line.includes(';') && !line.includes(',')) return line.split(';');
      if (line.includes(',')) return line.split(',');
      if (/\s{2,}/.test(line)) return line.split(/\s{2,}/);
      return [line];
    })
    .map((cells) => cells.map((c) => c.trim().replace(/^["']+|["']+$/g, '')));
}

/** Does a cell look like a human name? (letters, hyphens, apostrophes, spaces) */
function looksLikeName(s: string): boolean {
  if (!s || s.length < 2 || s.length > 40) return false;
  return /^[A-Za-zÀ-ÿ’'-]+([ A-Za-zÀ-ÿ’'.-]*)$/.test(s) && /[A-Za-zÀ-ÿ]/.test(s);
}

/** Header synonyms → column kind */
const FIRST_HEADERS = ['first name', 'firstname', 'forename', 'given name', 'given_name', 'first'];
const LAST_HEADERS = ['last name', 'lastname', 'surname', 'family name', 'family_name', 'last'];
const FULL_HEADERS = ['name', 'full name', 'fullname', 'pupil name', 'student name', 'student', 'pupil', 'name of pupil'];

function normaliseHeader(s: string): string {
  return s.toLowerCase().replace(/[^a-z ]/g, '').trim();
}

/** find which columns hold first/last/full names, given a candidate header row */
function mapHeaders(cells: string[]): { first?: number; last?: number; full?: number } {
  const map: { first?: number; last?: number; full?: number } = {};
  cells.forEach((c, i) => {
    const h = normaliseHeader(c);
    if (FIRST_HEADERS.includes(h)) map.first = i;
    else if (LAST_HEADERS.includes(h)) map.last = i;
    else if (FULL_HEADERS.includes(h)) map.full = i;
  });
  return map;
}

/** A row is a header row if it maps to name columns and no cell is a bare name+name */
function isHeaderRow(cells: string[]): boolean {
  const m = mapHeaders(cells);
  return (m.first !== undefined || m.last !== undefined || m.full !== undefined) && Object.keys(m).length > 0;
}

/** Pull "First Last" strings out of a 2D grid of cells */
export function rowsToNames(rows: string[][]): { names: string[]; skipped: number } {
  if (rows.length === 0) return { names: [], skipped: 0 };

  let header: { first?: number; last?: number; full?: number } | null = null;
  let start = 0;
  if (isHeaderRow(rows[0])) {
    header = mapHeaders(rows[0]);
    start = 1;
  }

  const names: string[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (let r = start; r < rows.length; r++) {
    const cells = rows[r].filter((c) => c.length > 0);
    if (cells.length === 0) continue;

    let name = '';
    if (header && (header.full !== undefined || header.first !== undefined || header.last !== undefined)) {
      const row = rows[r];
      const first = header.first !== undefined ? row[header.first] : '';
      const last = header.last !== undefined ? row[header.last] : '';
      const full = header.full !== undefined ? row[header.full] : '';
      name = full.trim() || [first.trim(), last.trim()].filter(Boolean).join(' ');
    } else if (cells.length === 1) {
      name = cells[0];
    } else if (cells.length === 2 && looksLikeName(cells[0]) && looksLikeName(cells[1])) {
      name = `${cells[0]} ${cells[1]}`;
    } else {
      // 3+ columns with no header: take the first two adjacent name-looking
      // cells (MIS exports often lead with the name, then DOB/UPN/email)
      const idx: number[] = [];
      for (let i = 0; i < rows[r].length && idx.length < 2; i++) {
        if (looksLikeName(rows[r][i])) idx.push(i);
      }
      if (idx.length === 2 && idx[1] === idx[0] + 1) name = `${rows[r][idx[0]]} ${rows[r][idx[1]]}`;
      else if (idx.length >= 1) name = rows[r][idx[0]];
    }

    name = name.replace(/\s+/g, ' ').trim();
    if (!looksLikeName(name)) {
      skipped += 1; // email, number, date, "Total 30"…
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    names.push(name);
  }
  return { names, skipped };
}

/** Parse a whole file into "First Last" lines. Excel formats use SheetJS. */
export async function parseRosterFile(file: File): Promise<{ names: string[]; skipped: number }> {
  const name = file.name;

  if (isExcelFile(name)) {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) return { names: [], skipped: 0 };
    const rows = (XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, raw: false }) as unknown[][]).map(
      (row) => (Array.isArray(row) ? row.map((c) => (c ?? '').toString().trim()) : [])
    );
    return rowsToNames(rows.filter((r) => r.some((c) => c.length > 0)));
  }

  const text = await file.text();
  return rowsToNames(textToRows(text));
}
