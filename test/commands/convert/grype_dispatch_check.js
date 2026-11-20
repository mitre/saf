// Regression check for mitre/saf#9702: the generic `saf convert` dispatch must
// match the fingerprint() value for Grype files, which is 'grype'.
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'src', 'commands', 'convert', 'index.ts'),
  'utf8',
);

const caseLabels = src.split(/\r?\n/).flatMap(line => {
  const match = /^[ \t]*case '([^']+)':/.exec(line);
  return match ? [match[1]] : [];
});
const grypeCases = caseLabels.filter(label => /grype/i.test(label));

if (grypeCases.length !== 1 || grypeCases[0] !== 'grype') {
  console.error(`FAIL: generic convert dispatch has Grype case label(s) ${JSON.stringify(grypeCases)}; expected case 'grype' to match fingerprint() output`);
  process.exit(1);
}

console.log('PASS: generic convert dispatch uses case \'grype\'');
