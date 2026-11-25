// checks data/products.csv for mistakes
// usage: node scripts/check-products.mjs [file.csv]

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const COLUMNS = [
  'barcode',
  'product_name',
  'category',
  'image_url',
  'net_weight_g',
  'price_baht',
  'calories_kcal',
  'protein_g',
  'fat_g',
  'carbohydrate_g',
  'sugar_g',
  'sodium_mg',
  'basis',
  'serving_size_g',
  'data_source',
  'entered_by',
  'verified_by',
  'last_verified_date',
];
const CATEGORIES = ['frozen', 'ready-to-eat'];
const BASES = ['per_serving', 'per_pack'];
const NUTRIENTS = ['calories_kcal', 'protein_g', 'fat_g', 'carbohydrate_g', 'sugar_g', 'sodium_mg'];

const file = process.argv[2] ?? fileURLToPath(new URL('../data/products.csv', import.meta.url));
let text = readFileSync(file, 'utf8');

const errors = [];
const warnings = [];

// excel adds this at the start of the file
if (text.charCodeAt(0) === 0xfeff) {
  warnings.push('file looks like it was saved from Excel, check the barcodes');
  text = text.slice(1);
}

const records = parseCsv(text);
if (records.length === 0) {
  fail('file is empty');
}

const header = records[0].values.map((v) => v.trim());
if (header.join(',') !== COLUMNS.join(',')) {
  fail(`header row is wrong, it should be:\n${COLUMNS.join(',')}`);
}

const seenBarcodes = new Map();
let productCount = 0;
let verifiedCount = 0;
const now = new Date();
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((n) => String(n).padStart(2, '0'))
  .join('-');

for (const { line, values } of records.slice(1)) {
  const err = (msg) => errors.push(`line ${line}: ${msg}`);
  const warn = (msg) => warnings.push(`line ${line}: ${msg}`);

  if (values.length !== COLUMNS.length) {
    err(`has ${values.length} columns, should be ${COLUMNS.length} (a comma in a name needs quotes)`);
    continue;
  }
  productCount++;
  const row = Object.fromEntries(COLUMNS.map((c, i) => [c, values[i].trim()]));

  // barcode
  const barcode = row.barcode;
  if (/e\+/i.test(barcode) || barcode.includes('.')) {
    err(`barcode ${barcode} got changed to a number (Excel?), type it again`);
  } else if (!/^\d+$/.test(barcode)) {
    err(`barcode ${barcode} should be digits only`);
  } else if (![8, 12, 13].includes(barcode.length)) {
    err(`barcode ${barcode} has ${barcode.length} digits, should be 13 (or 8 / 12)`);
  } else if (!hasValidCheckDigit(barcode)) {
    // 8 digit could be UPC-E which has a different check
    if (barcode.length === 8) warn(`barcode ${barcode} check digit looks wrong (ok if it's UPC-E)`);
    else err(`barcode ${barcode} check digit is wrong, probably a typo`);
  }
  if (seenBarcodes.has(barcode)) {
    err(`barcode ${barcode} is already on line ${seenBarcodes.get(barcode)}`);
  } else {
    seenBarcodes.set(barcode, line);
  }

  if (!row.product_name) err('product_name is empty');

  if (!CATEGORIES.includes(row.category)) {
    err(`category should be frozen or ready-to-eat, got "${row.category}"`);
  }

  if (row.image_url && !/^https?:\/\//.test(row.image_url)) {
    err('image_url should start with https://');
  }

  const netWeight = positiveNumber(row, 'net_weight_g', err);
  positiveNumber(row, 'price_baht', err);

  const n = {};
  for (const name of NUTRIENTS) {
    if (row[name] === '') {
      warn(`${name} is empty`);
    } else if (!isNumber(row[name])) {
      err(`${name} should be a number only, got "${row[name]}"`);
    } else {
      n[name] = Number(row[name]);
    }
  }

  // grams that the nutrition values are for
  let grams = null;
  if (!BASES.includes(row.basis)) {
    err(`basis should be per_pack or per_serving, got "${row.basis}"`);
  } else if (row.basis === 'per_serving') {
    grams = positiveNumber(row, 'serving_size_g', err);
    if (grams !== null && netWeight !== null && grams > netWeight) {
      err('serving_size_g is bigger than net_weight_g');
    }
  } else {
    grams = netWeight;
  }

  // numbers that can't be right
  const p = n.protein_g;
  const f = n.fat_g;
  const c = n.carbohydrate_g;
  if (grams !== null && (p ?? 0) + (f ?? 0) + (c ?? 0) > grams) {
    err(`protein + fat + carbs is more than ${grams} g`);
  }
  if (grams !== null && n.sodium_mg !== undefined && n.sodium_mg / 1000 > grams) {
    err('sodium is too high, it should be in mg');
  }
  if (n.sugar_g !== undefined && c !== undefined && n.sugar_g > c) {
    err('sugar is more than carbohydrate');
  }
  if (p !== undefined && f !== undefined && c !== undefined && n.calories_kcal >= 50) {
    const estimate = 4 * p + 4 * c + 9 * f;
    if (Math.abs(estimate - n.calories_kcal) / n.calories_kcal > 0.3) {
      warn(`calories ${n.calories_kcal} but protein/fat/carbs give about ${Math.round(estimate)}, check for typo`);
    }
  }

  if (!row.data_source) err('data_source is empty');
  if (!row.entered_by) err('entered_by is empty');

  // checked by a second person
  if (row.verified_by) {
    let ok = true;
    if (row.verified_by.toLowerCase() === row.entered_by.toLowerCase()) {
      err('verified_by has to be a different person from entered_by');
      ok = false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.last_verified_date) || !isRealDate(row.last_verified_date)) {
      err(`last_verified_date should look like 2026-11-30, got "${row.last_verified_date}"`);
      ok = false;
    } else if (row.last_verified_date > today) {
      err('last_verified_date is in the future');
      ok = false;
    }
    if (ok) verifiedCount++;
  } else if (row.last_verified_date) {
    err('has last_verified_date but no verified_by');
  }
}

for (const e of errors) console.log(`ERROR   ${e}`);
for (const w of warnings) console.log(`WARNING ${w}`);
console.log(
  `\n${productCount} products, ${verifiedCount} verified. ${errors.length} errors, ${warnings.length} warnings.`,
);
process.exit(errors.length ? 1 : 0);

function fail(message) {
  console.log(`ERROR   ${message}`);
  process.exit(1);
}

function isNumber(value) {
  return /^\d+(\.\d+)?$/.test(value);
}

function positiveNumber(row, name, err) {
  const value = row[name];
  if (value === '') {
    err(`${name} is empty`);
    return null;
  }
  if (!isNumber(value) || Number(value) <= 0) {
    err(`${name} should be a number more than 0, got "${value}"`);
    return null;
  }
  return Number(value);
}

function isRealDate(s) {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// same as app/src/barcode.ts
function hasValidCheckDigit(code) {
  const digits = code.split('').map(Number);
  const checkDigit = digits.pop();
  let sum = 0;
  digits.reverse().forEach((digit, i) => {
    sum += i % 2 === 0 ? digit * 3 : digit;
  });
  return (10 - (sum % 10)) % 10 === checkDigit;
}

// simple csv reader, handles "quoted, values"
// returns [{ line, values }]
function parseCsv(input) {
  const result = [];
  let values = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let startLine = 1;

  const endRow = () => {
    values.push(field);
    if (values.length > 1 || values[0].trim() !== '') result.push({ line: startLine, values });
    values = [];
    field = '';
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        if (ch === '\n') line++;
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      values.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      endRow();
      line++;
      startLine = line;
    } else {
      field += ch;
    }
  }
  if (field !== '' || values.length > 0) endRow();
  return result;
}
