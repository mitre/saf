// Regression check for mitre/saf#9702: the generic `saf convert` dispatch must
// match the fingerprint() value for Grype files, which is 'grype'.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'src', 'commands', 'convert', 'index.ts'),
  'utf8',
);

const caseLabels = [...src.matchAll(/^\s*case '([^']+)':/gm)].map(m => m[1]);
const grypeCases = caseLabels.filter(label => /grype/i.test(label));

if (grypeCases.length !== 1 || grypeCases[0] !== 'grype') {
  console.error(`FAIL: generic convert dispatch has Grype case label(s) ${JSON.stringify(grypeCases)}; expected case 'grype' to match fingerprint() output`);
  process.exit(1);
}

console.log('PASS: generic convert dispatch uses case \'grype\'');
