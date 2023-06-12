const fs = require('fs');
const { promisify } = require('util');
const { program } = require('commander');
const path = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

async function processFile(filePath, outputNumber) {
  try {
    // Read the JSON file
    const data = await readFile(filePath, 'utf8');

    if (!data || data.length === 0 || data === '' || data === '[]' || data === '{}' || data === 'null' || data === 'undefined') {
      throw new Error(`File is empty: ${filePath}, skipping...`);
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Get the specified number of elements from the array
    const outputData = jsonData.slice(0, outputNumber);

    // Create the output file path
    const outputFileName = `output_${path.basename(filePath)}`;
    const outputPath = path.join('output', outputFileName);

    // Write the output data to the output file (formatted with 2 spaces indentation)
    await writeFile(outputPath, JSON.stringify(outputData, null, 2), { flag: 'w' });

    console.log(`${outputNumber} element(s) written to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing the file: ${filePath}:`, error);
  }
}

async function processEntry(entry, outputNumber) {
  try {
    const entryStat = await stat(entry);
    if (entryStat.isDirectory()) {
      const files = await fs.promises.readdir(entry);
      for (const file of files) {
        const filePath = path.join(entry, file);
        const fileStat = await stat(filePath);
        if (fileStat.isFile() && path.extname(file) === '.json') {
          await processFile(filePath, outputNumber);
        }
      }
    } else if (entryStat.isFile() && path.extname(entry) === '.json') {
      await processFile(entry, outputNumber);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function Main(entry, options) {
  try {
    // Check if the entry is a file or a folder
    const isFolder = options.folder;

    // Generate the output folder if it doesn't exist
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }

    // Handle single file path
    if (!isFolder) {
      await processEntry(entry, options.outputNumber || 1);
      return;
    }

    // Handle folder path
    await processEntry(entry, options.outputNumber || 1);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

program
  .arguments('<entry>')
  .option('-f, --folder', 'Specify folder instead of a single file')
  .option('-n, --output-number <number>', 'Number of objects to output', parseInt)
  .action(Main)
  .parse(process.argv);
