const fs = require('fs');
const { promisify } = require('util');
const { program } = require('commander');
const path = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function processFile(filePath) {
  try {
    // Read the JSON file
    const data = await readFile(filePath, 'utf8');

    if (!data || data.length === 0 || data === '' || data === '[]' || data === '{}' || data === 'null' || data === 'undefined') {
      throw new Error(`File is empty: ${filePath}, skipping...`);
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Get the first element of the array
    const firstElement = jsonData[0];

    // Create the output file path
    const outputFileName = `output_${path.basename(filePath)}`;
    const outputPath = path.join('output', outputFileName);

    // Write the first element to the output file
    await writeFile(outputPath, JSON.stringify(firstElement, null, 2));

    console.log(`First element written to ${outputPath}`);
  } catch (error) {
    console.error(`error processing the file: ${filePath}:`, error);
  }
}

async function Main(entry, options) {
  try {
    // Check if the entry is a file or a folder
    const isFolder = options.folder;

    // generate output folder if it doesn't exist
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }

    // Handle single file path
    if (!isFolder) {
      await processFile(entry);
      return;
    }

    // Handle folder path
    const files = await fs.promises.readdir(entry);

    // Process each file individually
    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(entry, file);
        await processFile(filePath);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

program
  .arguments('<entry>')
  .option('-f, --folder', 'Specify folder instead of a single file')
  .action(Main)
  .parse(process.argv);
