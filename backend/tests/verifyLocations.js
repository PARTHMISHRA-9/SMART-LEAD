// backend/tests/verifyLocations.js
// Run: node backend/tests/verifyLocations.js
// Validates every hoarding site's geographic coordinates against the hoardings.csv dataset.

const fs = require('fs');
const path = require('path');

// Mumbai Metropolitan Region bounding box
const MMR_BOUNDS = { minLat: 18.9, maxLat: 19.45, minLng: 72.75, maxLng: 73.15 };

// Known zone → pincode mapping
const zonePincodes = {
  'Kandivali': '400067',
  'Borivali':  '400066',
  'Dahisar':   '400068',
  'Malad':     '400064',
  'Goregaon':  '400063',
  'Andheri':   '400053',
  'Powai':     '400076',
  'BKC':       '400051',
  'Sion':      '400022',
  'Thane':     '400601',
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      const v = (vals[i] || '').trim();
      obj[h] = isNaN(v) || v === '' ? v : Number(v);
    });
    return obj;
  });
}

function inMMR(lat, lng) {
  return lat >= MMR_BOUNDS.minLat && lat <= MMR_BOUNDS.maxLat &&
         lng >= MMR_BOUNDS.minLng && lng <= MMR_BOUNDS.maxLng;
}

const csvPath = path.join(__dirname, '../data/hoardings.csv');
const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));

console.log('\n═══════════════════════════════════════════════════');
console.log('   LOCATION VALIDATION REPORT — SmartLeads Agent');
console.log('═══════════════════════════════════════════════════\n');
console.log(`CSV: ${csvPath}`);
console.log(`Columns detected: ${Object.keys(rows[0] || {}).join(', ')}\n`);

let validCoords = 0;
let invalidCoords = 0;
let missingCoords = 0;
let missingPincode = 0;
let issues = [];
const coordSet = new Set();
let duplicateCoords = 0;

rows.forEach(row => {
  const { site_id, location, zone, latitude, longitude } = row;
  const lat = typeof latitude === 'number' ? latitude : null;
  const lng = typeof longitude === 'number' ? longitude : null;

  const issues_row = [];

  if (lat === null || lng === null) {
    missingCoords++;
    issues_row.push('MISSING COORDINATES');
  } else if (!inMMR(lat, lng)) {
    invalidCoords++;
    issues_row.push(`OUT OF MMR BOUNDS [${lat}, ${lng}]`);
  } else {
    const key = `${lat},${lng}`;
    if (coordSet.has(key)) {
      duplicateCoords++;
      issues_row.push(`DUPLICATE COORDINATE with another site`);
    }
    coordSet.add(key);
    validCoords++;
  }

  const pincode = zonePincodes[zone];
  if (!pincode) {
    missingPincode++;
    issues_row.push(`NO PINCODE MAPPING for zone "${zone}"`);
  }

  const icon = issues_row.length ? '⚠' : '✓';
  const pinLabel = pincode || 'UNKNOWN';
  console.log(`  ${icon} ${site_id.padEnd(10)} | ${(location || '').padEnd(34)} | ${(zone || '').padEnd(12)} | lat:${lat ?? 'NULL'} lng:${lng ?? 'NULL'} | PIN:${pinLabel}`);
  if (issues_row.length) {
    issues_row.forEach(msg => console.log(`       └─ ${msg}`));
  }
});

console.log('\n───────────────────────────────────────────────────');
console.log(`  Total sites:           ${rows.length}`);
console.log(`  Valid coordinates:     ${validCoords}`);
console.log(`  Missing coordinates:   ${missingCoords}`);
console.log(`  Invalid coordinates:   ${invalidCoords}  (outside MMR bounds)`);
console.log(`  Duplicate coordinates: ${duplicateCoords}`);
console.log(`  Missing pincodes:      ${missingPincode}`);

const pass = validCoords === rows.length && invalidCoords === 0 && missingCoords === 0 && duplicateCoords === 0;
console.log(`\n  Result: ${pass ? '✓ PASS — All sites have valid unique coordinates' : '⚠ REVIEW NEEDED — see issues above'}`);
console.log('═══════════════════════════════════════════════════\n');
