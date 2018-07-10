const fs = require('fs');
const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('symbols-raw.txt')
});

var symbols = {};

lineReader.on('line', function (line) {
    const parts = line.split(/\s+/);
    symbols[parts[0]] = parts.slice(2).join(" ");
});

lineReader.on('close', () => {
    fs.writeFile('symbols.json', JSON.stringify(symbols), () => {
        console.log("Done!");
    });
});