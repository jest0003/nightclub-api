const fs = require("fs");
const path = require("path");

const [, , sourceArg, destinationArg] = process.argv;

if (!sourceArg || !destinationArg) {
  console.error("Usage: node scripts/copy-file.js <source> <destination>");
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), sourceArg);
const destinationPath = path.resolve(process.cwd(), destinationArg);

if (!fs.existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourceArg}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, destinationPath);
console.log(`Copied ${sourceArg} to ${destinationArg}`);
