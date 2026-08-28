var fs = require('fs');
var content = fs.readFileSync('tests/app.test.js', 'utf8');
var lines = content.split('\n');
var currentSuite = null;
var counts = {};
for (var i = 0; i < lines.length; i++) {
  var line = lines[i].trim();
  var suiteMatch = line.match(/^suite\('([^']+)'\)/);
  if (suiteMatch) {
    currentSuite = suiteMatch[1];
    counts[currentSuite] = 0;
  }
  var testMatch = line.match(/^test\(/);
  if (testMatch && currentSuite) {
    counts[currentSuite]++;
  }
}
var total = 0;
for (var s in counts) {
  console.log(s + ': ' + counts[s]);
  total += counts[s];
}
console.log('TOTAL: ' + total);
